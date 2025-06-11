
"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function LoginButton() {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return <p className="mt-20">Loading111...</p>;
    }

    if (status === "authenticated") {
        return (
            <div className="mt-20">
                <p>Signed in as {session.user?.email}</p>
                <button
                    onClick={() => signOut()}
                    className="bg-red-500 text-white px-4 py-2 rounded mt-2"
                >
                    Sign out
                </button>
            </div>
        );
    }

    return (
        <div className="mt-20">
            <button
                onClick={() => signIn("github")}
                className="bg-black text-white px-4 py-2 rounded"
            >
                Sign in with GitHub
            </button>
        </div>
    );
}
