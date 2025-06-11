const express = require('express');
const axios = require('axios');
const cors = require('cors');
const JSON5 = require('json5');
require('dotenv').config();
const app = express();
app.use(cors());
const port = 8000;
app.use(express.json());
const mysql = require('mysql2/promise');


const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});


const GEMINI_API_URL =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

let savedSuggestions = {};

async function fetchRepoFiles(owner, repo, path = '') {
    try {
        console.log(GITHUB_TOKEN)
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
        const response = await axios.get(url, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` },
        });

        const files = response.data;
        let fileContents = [];

        for (const file of files) {
            if (file.type === 'file' && (file.name.endsWith('.js') || file.name.endsWith('.java'))) {
                console.log(`Fetching: ${file.path}`);
                const fileContent = await axios.get(file.download_url);
                fileContents.push({ path: file.path, content: fileContent.data, sha: file.sha });
            } else if (file.type === 'dir') {
                const nestedFiles = await fetchRepoFiles(owner, repo, file.path);
                fileContents = fileContents.concat(nestedFiles);
            }
        }

        return fileContents;
    } catch (error) {
        console.error('Error fetching GitHub files:', error.response?.data || error.message);
        return [];
    }
}

async function analyzeWithAI(fileContent) {
    try {
        console.log(222222)
        const response = await axios.post(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{
                        text: `
You are a strict JSON-generating code reviewer. Respond ONLY with valid, parsable JSON. No explanations, no markdown, no comments.

Your job:
- If the message asks to "change" or "modify" a specific file, only return that file with the updated code as "fixed_code" and any related "issues".
- Do NOT return any other files in the JSON at all.
- If the message is to "analyze", return all files with their issues.
  - If a file has issues, include "fixed_code" with suggested fixes.
  - If a file has no issues, omit "fixed_code" entirely for that file.

Output Format:
{
  "filename": {
    "issues": [
      {
        "issue": "IssueType",
        "explanation": "Why it’s an issue",
        "line_start": <int>,
        "line_end": <int>
      }
    ],
    // Include "fixed_code" only if the file has fixes
    "fixed_code": "escaped code string here"
  }
}

Guidelines:
- "fixed_code" must be a valid escaped JSON string (use \\n, \\", etc. correctly).
- Only return the files that are explicitly being modified (for change/modify requests).
- Ensure output is pure JSON with no markdown, no comments, and no backticks.
- Always produce well-formed JSON with no trailing commas.

Input:
${fileContent}
`.trim()


                    }]
                }]
            },
            {
                headers: { 'Content-Type': 'application/json' },
            }
        );
        console.log(1111)
        let rawText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        console.log(rawText)

        rawText = rawText.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();

// Extract the JSON block
        const jsonMatch = rawText.match(/{[\s\S]*}/);
        if (!jsonMatch) throw new Error('No JSON object found in Gemini response');

        let jsonText = jsonMatch[0];

// 🧹 Post-process fixed_code for escaping issues
        jsonText = sanitizeFixedCodeStrings(jsonText);

        const parsed = JSON5.parse(jsonText);
        return parsed;


    } catch (error) {
        console.error('❌ Gemini output error or invalid JSON5:', error.message);
        return null;
    }
}

function sanitizeFixedCodeStrings(jsonText) {
    return jsonText.replace(
        /"fixed_code"\s*:\s*"((?:[^"\\]|\\.)*)"/g,
        (_, code) => {
            const safeCode = JSON.stringify(code.replace(/\\n/g, '\n').replace(/\\"/g, '"'))
                .slice(1, -1);
            return `"fixed_code": "${safeCode}"`;
        }
    );
}

async function rewriteFullCode(fileContent) {
    try {
        const response = await axios.post(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: `Provide only the improved code without any comments, explanations, or formatting suggestions:\n${fileContent}` }] }],
            },
            {
                headers: { 'Content-Type': 'application/json' },
            }
        );

        return response.data.candidates?.[0]?.content?.parts?.[0]?.text.trim() || fileContent;
    } catch (error) {
        console.error('Error rewriting code with AI:', error.response?.data || error.message);
        return fileContent;
    }
}


async function updateFileOnGitHub(owner, repo, filePath, newContent, sha, newBranch) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

    try {
        await axios.put(
            url,
            {
                message: `AI Bug Fix: Updated ${filePath}`,
                content: Buffer.from(newContent).toString('base64'),
                sha: sha,
                branch: newBranch,
            },
            {
                headers: { Authorization: `token ${GITHUB_TOKEN}` },
            }
        );

        return true;
    } catch (error) {
        console.error(`Error updating file ${filePath}:`, error.response?.data || error.message);
        return false;
    }
}

async function getFileSha(owner, repo, filePath, branch) {
    try {
        const { data } = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
            { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
        );
        return data.sha;
    } catch (error) {
        console.error(`❌ Failed to get SHA for ${filePath}:`, error.response?.data || error.message);
        return null;
    }
}
app.post('/analyze', async (req, res) => {
    const { message, chosenRepos } = req.body;

    if (!message || !chosenRepos || !Array.isArray(chosenRepos)) {
        return res.status(400).json({ error: 'Message and chosenRepos array are required' });
    }

    let allSuggestedFixes = {};
    let allCleanedFixes = {};

    try {
        for (const repo of chosenRepos) {
            const repoUrl = repo.html_url;
            if (!repoUrl) continue;

            const [owner, repoName] = repoUrl.replace('https://github.com/', '').split('/');
            const fileContents = await fetchRepoFiles(owner, repoName);

            if (fileContents.length === 0) continue;

            let suggestedFixes = {};
            let cleanedFixes = {};

            for (const file of fileContents) {
                const filePrompt = `file: ${file.path}\n${file.content}`;
                const aiSuggestion = await analyzeWithAI(`${message}\n\n${filePrompt}`);

                if (!aiSuggestion || !aiSuggestion[file.path]) continue;

                aiSuggestion[file.path].original_code = file.content;
                suggestedFixes[file.path] = aiSuggestion[file.path];
                const [result] = await pool.query(
                    'INSERT INTO prompt_history (userId, prompt, aiResponse) VALUES (?, ?, ?)',
                    [owner, message, JSON.stringify(aiSuggestion)]
                );
                console.log(`✅ Inserted row with ID: ${result.insertId}`);

                if (aiSuggestion[file.path].fixed_code) {
                    cleanedFixes[file.path] = await rewriteFullCode(aiSuggestion[file.path].fixed_code);
                }
            }

            savedSuggestions[repoName] = { owner, fileContents, suggestedFixes, cleanedFixes };

            allSuggestedFixes[repoName] = suggestedFixes;
            allCleanedFixes[repoName] = cleanedFixes;
        }

        res.status(200).json({
            message: 'Analysis completed for all selected repositories.',
            suggestedFixes: allSuggestedFixes,
            cleanedFixes: allCleanedFixes,
        });
    } catch (error) {
        console.error('Error analyzing repositories:', error.response?.data || error.message);
        res.status(500).json({ error: 'Error analyzing the repositories.' });
    }
});

app.post('/committogit', async (req, res) => {
    const { suggestedFixes } = req.body;
    const repoName = Object.keys(suggestedFixes || {})[0];

    if (!repoName) return res.status(400).json({ error: 'No repo name found' });
    if (!savedSuggestions[repoName]) return res.status(400).json({ error: 'No saved suggestions for repo' });

    const { owner } = savedSuggestions[repoName];
    const newBranch = `aifix-${Date.now()}`;

    // Extract files correctly:
    const filesObj = suggestedFixes[repoName];
    const fileContents = Object.entries(filesObj).map(([path, data]) => ({
        path,
        content: data.fixed_code,
    }));

    try {
        const { data: mainBranch } = await axios.get(
            `https://api.github.com/repos/${owner}/${repoName}/git/refs/heads/master`,
            { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
        );

        await axios.post(
            `https://api.github.com/repos/${owner}/${repoName}/git/refs`,
            { ref: `refs/heads/${newBranch}`, sha: mainBranch.object.sha },
            { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
        );

        for (const file of fileContents) {
            console.log(`🔹 Updating ${file.path}...`);

            const sha = await getFileSha(owner, repoName, file.path, newBranch);
            if (!sha) {
                console.error(`⚠️ Skipping ${file.path} due to missing SHA.`);
                continue;
            }

            await updateFileOnGitHub(owner, repoName, file.path, file.content, sha, newBranch);
        }


        res.json({ message: 'Changes committed', branch: newBranch });
    } catch (error) {
        console.error("❌ Git commit error:", error.response?.data || error.message);
        res.status(500).json({ error: 'Error committing changes to GitHub.' });
    }
});



app.get('/prompt-history', async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ error: 'Missing userId query parameter' });
    }

    try {

        const [rows] = await pool.query('SELECT id, prompt, aiResponse, createdAt FROM prompt_history WHERE userId = ?', [userId]);
        console.log(rows)
        res.json({ userId, history: rows });
    } catch (error) {
        console.error('DB error:', error);
        res.status(500).json({ error: 'Database query failed' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
