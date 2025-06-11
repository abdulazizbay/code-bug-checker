"use client";

import React, { useState, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { useRouter, usePathname } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import inputFolderIcon from "@/public/assets/images/inputfolder.svg";
import githubIcon from "@/public/assets/images/githubicon.svg";
import RoundArrowLeftUp from "@/public/assets/images/RoundArrowLeftUp.svg";

interface ChosenRepo {
    name: string;
    html_url: string;
}

interface InputWithIconProps {
    name: string;
    onServerResponse: (data: any) => void;
}

export const InputWithIcon: React.FC<InputWithIconProps> = ({ name, onServerResponse }) => {
    const { control, setValue, getValues } = useFormContext();
    const [repos, setRepos] = useState<ChosenRepo[]>([]);
    const [chosenRepos, setChosenRepos] = useState<ChosenRepo[]>([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter();
    const pathname = usePathname();

    // Sync chosenRepos with form
    useEffect(() => {
        setValue("chosenRepos", chosenRepos);
    }, [chosenRepos, setValue]);

    // Fetch repositories on mount
    useEffect(() => {
        const fetchRepos = async () => {
            try {
                const res = await fetch("/api/repos", { credentials: "include" });
                const data = await res.json();
                setRepos(data);
            } catch (err) {
                console.error("Repo fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRepos();
    }, []);

    const handleRepoAdd = (repo: ChosenRepo) => {
        if (!chosenRepos.some(r => r.name === repo.name)) {
            setChosenRepos(prev => [...prev, repo]);
        }
    };

    const handleRepoRemove = (name: string) => {
        setChosenRepos(prev => prev.filter(repo => repo.name !== name));
    };

    const handleSubmit = async () => {

        if (pathname === "/") router.push("/chat");
        const values = getValues();
        const payload = { ...values, chosenRepos };

        if (!payload[name] && chosenRepos.length === 0) {
            toast.error("Please enter a repo or select one.");
            return;
        }

        const toastId = toast.loading("Analyzing...");

        try {
            const res = await fetch("http://localhost:8000/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            console.log(data)
            toast.dismiss(toastId);
            toast.success("Analysis complete");
            onServerResponse(data);

        } catch (err) {
            toast.dismiss(toastId);
            toast.error("Analysis failed");
            console.error("Submit error:", err);
        }
    };

    return (
        <div className="relative w-[624px]">
            {/* Left icon: Repo picker */}
            <div className="ml-[25px] absolute top-4 -translate-y-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <div className="bg-gray6 w-10 h-10 flex items-center justify-center rounded-100 cursor-pointer">
                            <Image src={inputFolderIcon} alt="Select Repo" />
                        </div>
                    </PopoverTrigger>
                    {repos.length > 0 && (
                        <PopoverContent className="max-h-[500px] w-[400px] overflow-y-auto">
                            <ul className="space-y-3">
                                {repos.map((repo, i) => (
                                    <li key={i} className="flex justify-between items-center">
                                        <span onClick={() => handleRepoAdd(repo)} className="cursor-pointer">{repo.name}</span>
                                        <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                                            <Image src={githubIcon} alt="GitHub" width={20} height={20} />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </PopoverContent>
                    )}
                </Popover>
            </div>

            {/* Input box */}
            <div
                className={cn(
                    "w-full pl-[85px] pr-[50px] py-3 rounded-2xl border border-input bg-black2 text-white shadow-sm focus-within:ring-1 focus-within:ring-ring"
                )}
            >
                {chosenRepos.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {chosenRepos.map(repo => (
                            <span key={repo.name} className="bg-gray-700 px-2 py-1 rounded-full flex items-center gap-1 text-sm">
                {repo.name}
                                <button
                                    type="button"
                                    className="text-xs text-gray-300 hover:text-white"
                                    onClick={() => handleRepoRemove(repo.name)}
                                >
                  ✕
                </button>
              </span>
                        ))}
                    </div>
                )}

                <Controller
                    name={name}
                    control={control}
                    render={({ field }) => (
                        <textarea
                            {...field}
                            rows={1}
                            placeholder="Send any repository"
                            className="w-full resize-none overflow-hidden bg-transparent outline-none placeholder:text-muted-foreground"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                            onInput={(e) => {
                                const target = e.currentTarget;
                                target.style.height = "auto";
                                target.style.height = `${target.scrollHeight}px`;
                            }}
                        />
                    )}
                />
            </div>

            {/* Right icon: Submit */}
            <div className="absolute right-0 top-4 mr-[25px] -translate-y-2">
                <div
                    className="bg-gray6 w-10 h-10 flex items-center justify-center rounded-100 cursor-pointer"
                    onClick={handleSubmit}
                >
                    <Image src={RoundArrowLeftUp} alt="Submit" />
                </div>
            </div>
        </div>
    );
};
