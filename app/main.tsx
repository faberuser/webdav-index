import '@/styles/globals.css'

import { Inter } from "next/font/google"
import Head from 'next/head'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import RootLayout from '@/app/layout'
import dynamic from 'next/dynamic'


const Client = dynamic(() => import('@/app/client'))

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
})

export const Main = ({ currentPath, title }: any) => (
    <>
        <Head>
            <title>{title}</title>
            <meta property="og:title" content={title} key="title" />
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
                <Client title={title} initialPath={currentPath} />
            </RootLayout>
            <Toaster />
        </ThemeProvider>
    </>
)