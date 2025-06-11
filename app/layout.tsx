"use client"
import './globals.css';
import CustomSessionProvider from './providers';
import { Toaster } from "@/components/ui/sonner"

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body>
            <CustomSessionProvider>
                {children}
            </CustomSessionProvider>
        <Toaster/>
        </body>
        </html>
    );
}
