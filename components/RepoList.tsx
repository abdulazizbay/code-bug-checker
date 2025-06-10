"use client";

import { useEffect, useState } from "react";

export default function RepoList() {
    const [repos, setRepos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function fetchRepos() {
            const res = await fetch("/api/repos", {
                credentials: "include",
            });
            const data = await res.json();
            setRepos(data);
            setLoading(false);
        }
        fetchRepos();
    }, []);

    if (loading) return <p>Loading repos...</p>;

    const analyzeHandler = async (repo: string)=>{
        const res = await fetch("http://localhost:8000/analyze",
            {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({repoUrl: repo})
            }
        )
        const data = await res.json();
        console.log("Analysis result:", data);
    }

    return (
        <div>
            <h2 className="text-lg font-semibold mb-2 ">Your GitHub Repositories</h2>
            <ul className="list-disc pl-6">
                    {repos.map((repo) => (
                        <li key={repo.id}>
                            <a href={repo.html_url} className="text-blue-500" target="_blank" rel="noreferrer">
                                {repo.name}
                            </a>
                            <button
                                onClick={()=>analyzeHandler(repo.html_url)}
                            >
                                Analyze
                            </button>
                        </li>
                    ))}
            </ul>
        </div>
    );
}
