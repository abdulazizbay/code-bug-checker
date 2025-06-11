"use client";
import { useEffect, useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter/dist/cjs/light";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";

export default function PromptHistory() {
    const userId = process.env.USER_ID
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    function getLanguageFromFilename(filename: string = ""): string {
        const ext = filename.split(".").pop()?.toLowerCase();
        switch (ext) {
            case "js": return "javascript";
            case "ts": return "typescript";
            case "py": return "python";
            case "java": return "java";
            case "cpp":
            case "cc":
            case "cxx":
            case "c++": return "cpp";
            case "cs": return "csharp";
            case "rb": return "ruby";
            case "go": return "go";
            case "rs": return "rust";
            case "php": return "php";
            case "html": return "html";
            case "css": return "css";
            case "json": return "json";
            case "xml": return "xml";
            default: return "text";
        }
    }

    useEffect(() => {
        if (!userId) return;

        async function fetchHistory() {
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:8000/prompt-history?userId=${userId}`);
                if (!res.ok) {
                    console.error("Failed to fetch prompt history");
                    setHistory([]);
                } else {
                    const data = await res.json();
                    setHistory(data.history || []);
                }
            } catch (error) {
                console.error("Error fetching prompt history:", error);
                setHistory([]);
            }
            setLoading(false);
        }

        fetchHistory();
    }, [userId]);

    if (loading) return <div>Loading...</div>;
    if (!history.length) return <div>No prompt history found.</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Prompt History of {userId}</h2>
            <ul className="space-y-6">
                {history.map((item: any) => {
                    const aiResponse = item.aiResponse || {};
                    const codeFile = Object.keys(aiResponse)[0]; // e.g. "Array1.java"
                    const issues = aiResponse[codeFile]?.issues;

                    return (
                        <li key={item.id} className="bg-white shadow-md rounded-xl p-5 border border-gray-100">
                            <div className="mb-3">
                                <span className="font-semibold text-gray-700">Prompt:</span>
                                <span className="ml-2 text-gray-900">{item.prompt}</span>
                            </div>

                            <div className="mb-3">
                                <span className="font-semibold text-gray-700">AI Response:</span>
                                <SyntaxHighlighter
                                    language={getLanguageFromFilename(codeFile)}
                                    style={vscDarkPlus}
                                    className="rounded-lg mt-2"
                                >
                                    {JSON.stringify(aiResponse, null, 2)}
                                </SyntaxHighlighter>
                            </div>

                            <div className="text-sm text-gray-500">
                                {new Date(item.createdAt || item.date).toLocaleString()}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
