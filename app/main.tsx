import '@/styles/globals.css'

import { Inter } from "next/font/google"
import Head from 'next/head'
import dynamic from 'next/dynamic'

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

import RootLayout from '@/app/layout'
import { title } from '@/config'

const Client = dynamic(() => import('@/app/client'))

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
})

export const Main = () => (
    <>
        <Head>
            <title>{title}</title>
            <meta name="title" property="og:title" content={title} key="title" />
            <meta name="description" property="og:description" content={"Interface Indexer for " + title} key="description" />
        </Head>
        <style jsx global>
            {`html {
                lang: en;
                font-family: ${inter.style.fontFamily};
                }`}
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