import {signOut, useSession} from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


export const Navbar = ()=>{
    const {data: session, status} = useSession();
    const navMenus = [
        {label:"PRICING", linkTo:"/"},
        {label:"Contact", linkTo:"/", },
        {label:"FAQ", linkTo:"/", }
    ]
    if (session){
        return(
            <header className="max-container flexBetween pt-100 ml-100">
                <h3>REPODOCTOR</h3>
                <nav>
                    <ul>
                        {
                            navMenus.map((navmenu,index)=>(
                                <li key={index}><a href={navmenu.linkTo}> {navmenu.label}</a></li>
                            ))
                        }
                    </ul>
                </nav>
                <h4>Login</h4>
                <div className="hidden">
                    <p>Signed in as {session.user?.name}</p>
                    <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                </div>

                <button onClick={() => signOut()}>Try for free</button>
            </header>
        )
    }
}