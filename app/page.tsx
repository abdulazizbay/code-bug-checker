"use client";

import  RepoList  from "@/components/RepoList"
import {Navbar} from "@/components/Navbar";
import LoginButton from "@/components/LoginButton";


export default function Home() {
    return (
        <div className="">
            <Navbar/>
            <RepoList/>
        </div>
    )

}
