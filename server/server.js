const express = require('express');
const axios = require('axios');
const cors = require('cors');


require('dotenv').config();

const app = express();
app.use(cors());
const port = 8000;

app.use(express.json());

const GEMINI_API_URL =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

let savedSuggestions = {};

async function fetchRepoFiles(owner, repo, path = '') {
    try {
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
        const response = await axios.post(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: `if there is precise bugs, provide some. provide it like this: improved code and at the end of code provide bug explanation. if there is no bug, just return code itself not changing anything, by commenting that it is ok:\n${fileContent}` }] }],
            },
            {
                headers: { 'Content-Type': 'application/json' },
            }
        );

        return response.data.candidates?.[0]?.content?.parts?.[0]?.text || fileContent;
    } catch (error) {
        console.error('Error analyzing with AI:', error.response?.data || error.message);
        return fileContent;
    }
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

app.post('/analyze', async (req, res) => {
    const { repoUrl } = req.body;
    if (!repoUrl) {
        return res.status(400).json({ error: 'Repository URL is required' });
    }

    try {
        const repoParts = repoUrl.split('/');
        const owner = repoParts[3];
        const repo = repoParts[4];

        const fileContents = await fetchRepoFiles(owner, repo);
        if (fileContents.length === 0) {
            return res.status(404).json({ error: 'No .js or .java files found in the repository.' });
        }

        let suggestedFixes = {};
        let cleanedFixes = {};

        for (const file of fileContents) {
            const aiSuggestion = await analyzeWithAI(file.content);
            suggestedFixes[file.path] = aiSuggestion;

            cleanedFixes[file.path] = await rewriteFullCode(aiSuggestion);
        }

        savedSuggestions[repo] = { owner, fileContents, suggestedFixes, cleanedFixes };

        res.json({ message: 'Analysis completed. You can now commit changes using /committogit.', suggestedFixes });
    } catch (error) {
        console.error('Error analyzing code:', error.response?.data || error.message);
        res.status(500).json({ error: 'Error analyzing the repository.' });
    }
});

app.post('/committogit', async (req, res) => {
    const { repoName } = req.body;
    if (!repoName || !savedSuggestions[repoName]) {
        return res.status(400).json({ error: 'No analysis found for this repository. Run /analyze first.' });
    }

    const { owner, fileContents, cleanedFixes } = savedSuggestions[repoName];
    const newBranch = `aifix-${Date.now()}`;

    try {
        const { data: mainBranch } = await axios.get(
            `https://api.github.com/repos/${owner}/${repoName}/git/refs/heads/master`,
            { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
        );

        await axios.post(
            `https://api.github.com/repos/${owner}/${repoName}/git/refs`,
            {
                ref: `refs/heads/${newBranch}`,
                sha: mainBranch.object.sha,
            },
            { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
        );

        for (const file of fileContents) {
            const rewrittenContent = cleanedFixes[file.path];
            console.log(`🔹 Updating ${file.path}...`);
            console.log('New Content:\n', rewrittenContent);

            await updateFileOnGitHub(owner, repoName, file.path, rewrittenContent, file.sha, newBranch);
        }

        res.json({ message: 'Changes committed to GitHub.', branch: newBranch });
    } catch (error) {
        console.error('Error committing to GitHub:', error.response?.data || error.message);
        res.status(500).json({ error: 'Error committing changes to GitHub.' });
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
