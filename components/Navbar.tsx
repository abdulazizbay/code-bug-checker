import {signOut, useSession} from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {CustomButton} from "@/components/CustomButton";


export const Navbar = ()=>{
    const {data: session, status} = useSession();
    const navMenus = [
        {label:"Pricing", linkTo:"/"},
        {label:"Contact", linkTo:"/", },
        {label:"FAQ", linkTo:"/", }
    ]
    if (session){
        return(
            <header className="max-container flexBetween pt-100 items-center">
                <h6>REPODOCTOR</h6>
                <nav>
                    <ul
                        className="flex gap-70"
                    >
                        {
                            navMenus.map((navmenu,index)=>(
                                <li key={index}><a href={navmenu.linkTo}><h6> {navmenu.label}</h6></a></li>
                            ))
                        }
                    </ul>
                </nav>

                {
                    session.user?.name?
                        (
                            <Avatar>
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                        ): (
                            <h6>Login</h6>
                            )
                }
                <div className="hidden">
                    {/*<p>Signed in as {session.user?.name}</p>*/}
                </div>

                {/*<button onClick={() => signOut()}>Try for free</button>*/}
                    <CustomButton bgCol="customGreen" label="Try for free"/>
            </header>
        )
    }
}