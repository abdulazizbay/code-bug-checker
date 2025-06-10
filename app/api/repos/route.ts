import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch("https://api.github.com/user/repos", {
        headers: {
            Authorization: `token ${session.accessToken}`,
            Accept: "application/vnd.github.v3+json",
        },
    });

    const data = await res.json();
    return NextResponse.json(data);
}
