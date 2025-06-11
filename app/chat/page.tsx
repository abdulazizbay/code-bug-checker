"use client";

import React, {useEffect, useState} from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, SquareArrowUpRight, LogOut, PencilLine, CloudDownload   } from "lucide-react";
import { InputWithIcon } from "@/components/ui/input";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import * as Tooltip from "@radix-ui/react-tooltip";
import {atomDark} from "react-syntax-highlighter/dist/cjs/styles/prism";
import {toast} from "sonner";
import prisma from "../../lib/";


interface ChosenRepo {
    name: string;
    html_url: string;
}

interface FormData {
    message: string;
    chosenRepos: ChosenRepo[];
}

const ChatMainPage = () => {
    const [ serverr, setServerResponse] = useState<any>(null);
    const [editingFiles, setEditingFiles] = useState<Record<string, boolean>>({});
    const [chatHistory, setChatHistory] = useState<string[]>([]);


    const handleSaveIcon = async ()=>{
        const toastId = toast.loading("Committing to Git...");
        console.log(serverr)
        try {
            const res = await fetch("http://localhost:8000/committogit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(serverr),
            });

            const data = await res.json();
            toast.dismiss(toastId);
            toast.success(data.message);
            console.log(data)
        } catch (err) {
            console.error("Submission failed:", err);
            toast.dismiss(toastId);
            toast.error("Failed to commit to Git");
        }
    }

    const getLineProps = (lineNumber: number, issues: any[]) => {
        const matchedIssues = Array.isArray(issues)
            ? issues.filter(
                (issue) => lineNumber + 1 >= issue.line_start && lineNumber + 1 <= issue.line_end
            )
            : [];

        const hasIssues = matchedIssues.length > 0;

        const tooltipContent = matchedIssues
            .map((issue) => `${issue.issue}: ${issue.explanation}`)
            .join(" | ");

        return { hasIssues, tooltipContent };
    };

    // Hook form setup
    const methods = useForm<FormData>({
        defaultValues: {
            message: "",
            chosenRepos: [],
        },
    });

    const footerLinks = [
        { label: "User", icon: <User />, linkTo: "/" },
        { label: "FAQ", icon: <SquareArrowUpRight />, linkTo: "/" },
        { label: "Logout", icon: <LogOut />, linkTo: "/" },
    ];

    function getLanguageFromFilename(filename: string): string {
        const ext = filename.split(".").pop()?.toLowerCase();

        switch (ext) {
            case "js":
                return "javascript";
            case "ts":
                return "typescript";
            case "py":
                return "python";
            case "java":
                return "java";
            case "cpp":
            case "cc":
            case "cxx":
            case "c++":
                return "cpp";
            case "cs":
                return "csharp";
            case "rb":
                return "ruby";
            case "go":
                return "go";
            case "rs":
                return "rust";
            case "php":
                return "php";
            case "html":
                return "html";
            case "css":
                return "css";
            case "json":
                return "json";
            case "xml":
                return "xml";
            default:
                return "text";
        }
    }

    return (
        <div className="flex relative mb-100">
            <aside className="w-[323px] bg-black h-screen pt-[25px] px-[15px] flex flex-col justify-between">
                <div>
                    <Button className="bg-black3 w-[180px] h-[50px] gap-[30px] ml-50 ">
                        <span className="text-xl">+</span>
                        <h6>New Chat</h6>
                    </Button>

                    <div className="pt-50 ml-50">
                        <p className="text-sm text-gray8">Projects</p>
                        <ul className="space-y-4 pt-[25px]">
                            {chatHistory.length === 0 ? (
                                <p className="text-gray-500 text-sm">No chats yet</p>
                            ) : (
                                chatHistory.map((chat, idx) => (
                                    <li key={idx} className="text-white text-sm truncate hover:underline cursor-pointer">
                                        {chat}
                                    </li>
                                ))
                            )}

                        </ul>
                    </div>
                </div>

                <div className="mb-100">
                    <div className="w-[293px] h-[1px] bg-gray8"></div>
                    <ul className="mt-50 ml-50 flex flex-col gap-[30px]">
                        {footerLinks.map((item, index) => (
                            <li key={index} className="flex gap-[30px]">
                                <a href={item.linkTo} className="flex items-center gap-[30px]">
                                    {item.icon}
                                    <h6>{item.label}</h6>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>

            <main className="flex-1 relative">
                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit((data) => {
                        if (data.message.trim() !== "") {
                            const timestamp = new Date().toLocaleTimeString();
                            setChatHistory((prev) => [`Chat ${prev.length + 1} - ${timestamp}`, ...prev]);
                            methods.reset({ message: "" }); // 👈 clear the input field
                        }
                    })}>

                    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
                            <InputWithIcon name="message" onServerResponse={setServerResponse} />
                        </div>
                    </form>
                </FormProvider>

                <div className="p-6">
                    {serverr && serverr.suggestedFixes && (
                        <Tabs defaultValue="account" className="">
                            {Object.entries(serverr.suggestedFixes).map(([repo, files]) => (
                                <React.Fragment key={repo}>
                                    <TabsList>
                                        {Object.keys(files).map((filePath) => (
                                            <TabsTrigger key={filePath} value={filePath} >
                                                {/*<Button>*/}
                                                    {filePath}
                                                {/*</Button>*/}

                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                    {Object.entries(files).map(([filePath, fileData]) => {
                                        const language = getLanguageFromFilename(filePath);
                                        const hasFix = !!fileData.fixed_code;
                                        const hasIssues = Array.isArray(fileData.issues) && fileData.issues.length > 0;

                                        return (
                                            <TabsContent key={filePath} value={filePath}>
                                                <div className="grid grid-cols-2 gap-5 items-start">
                                                    {/* Original Code */}
                                                    <div className="bg-black rounded-md">
                                                        <h3 className="font-semibold text-base px-4 py-[14px] text-white">Original Code</h3>
                                                        <SyntaxHighlighter
                                                            language={language}
                                                            style={atomDark}
                                                            wrapLines
                                                            showLineNumbers
                                                            customStyle={{
                                                                margin: 0,
                                                                padding: '1rem',
                                                                fontSize: '0.85rem',
                                                                borderRadius: 0,
                                                            }}
                                                            lineProps={(lineNumber) => {
                                                                const { hasIssues, tooltipContent } = getLineProps(
                                                                    lineNumber,
                                                                    fileData.issues
                                                                );
                                                                if (hasIssues) {
                                                                    return {
                                                                        style: {
                                                                            backgroundColor: "rgba(255, 0, 0, 0.2)",
                                                                            cursor: "help",
                                                                            position: "relative",
                                                                        },
                                                                        "data-tooltip": tooltipContent,
                                                                    };
                                                                }
                                                                return {};
                                                            }}
                                                        >
                                                            {fileData.original_code}
                                                        </SyntaxHighlighter>
                                                        <Tooltip.Provider />
                                                    </div>

                                                    {/* Fixed Code or Message */}
                                                    {hasFix ? (
                                                        <div className="rounded-md overflow-hidden">
                                                            <div className="bg-black text-white flexBetween items-center gap-2 pl-4 pr-12 py-2">
                                                                <h4 className="font-semibold text-base">Fixed Code</h4>
                                                                <div className="flex gap-10">
                                                                    <Button
                                                                        onClick={() =>
                                                                            setEditingFiles((prev) => ({
                                                                                ...prev,
                                                                                [filePath]: !prev[filePath],
                                                                            }))
                                                                        }
                                                                    >
                                                                        <PencilLine size={15} />
                                                                        <p className="text-sm">{editingFiles[filePath] ? "Cancel" : "Modify"}</p>
                                                                    </Button>
                                                                    <div
                                                                        className="flex gap-1 items-center"
                                                                        onClick={handleSaveIcon}
                                                                    >
                                                                        <Button>
                                                                            <CloudDownload size={15} />
                                                                            <p className="text-sm">Save</p>
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {editingFiles[filePath] ? (
                                                                <textarea
                                                                    value={fileData.fixed_code}
                                                                    onFocus={() => toast.info("Editing started. Don't forget to save!")}
                                                                    onChange={(e) => {
                                                                        setServerResponse((prev: any) => {
                                                                            const newState = { ...prev };
                                                                            newState.suggestedFixes[repo][filePath].fixed_code = e.target.value;
                                                                            return newState;
                                                                        });
                                                                    }}
                                                                    className="w-full h-[400px] p-4 bg-gray-900 text-white font-mono text-sm resize-none rounded-none"
                                                                />
                                                            ) : (
                                                                <SyntaxHighlighter
                                                                    language={language}
                                                                    style={atomDark}
                                                                    wrapLines
                                                                    showLineNumbers
                                                                    customStyle={{
                                                                        margin: 0,
                                                                        padding: '1rem',
                                                                        fontSize: '0.85rem',
                                                                        borderRadius: 0,
                                                                    }}
                                                                >
                                                                    {fileData.fixed_code}
                                                                </SyntaxHighlighter>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full bg-green-50 border border-green-300 rounded-md p-6">
                                                            <h4 className="text-green-700 font-semibold text-lg">
                                                                There are no issues found in this file
                                                            </h4>
                                                        </div>
                                                    )}
                                                </div>
                                            </TabsContent>
                                        );
                                    })}

                                </React.Fragment>
                            ))}
                        </Tabs>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ChatMainPage;
