import "@/styles/globals.css"

import { Inter } from "next/font/google"
import Head from "next/head"
import dynamic from "next/dynamic"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

import RootLayout from "@/app/layout"

const title = process.env.NEXT_PUBLIC_TITLE
const description = process.env.NEXT_PUBLIC_DESCRIPTION

const Client = dynamic(() => import("@/app/client"))

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
})

export const Main = () => (
    <>
        <Head>
            <title>{title}</title>
            <meta
                name="title"
                property="og:title"
                content={title}
                key="title"
            />
            <meta
                name="description"
                property="og:description"
                content={description}
                key="description"
            />
        </Head>
        <style jsx global>
            {`
                html {
                    lang: en;
                    font-family: ${inter.style.fontFamily};
                }
            `}
        </style>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <RootLayout>
                <Client title={title} />
            </RootLayout>
            <Toaster />
        </ThemeProvider>
    </>
)
