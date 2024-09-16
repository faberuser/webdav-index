import type { Metadata } from "next"
import { Main } from '@/app/main';
import { title } from '@/config'

export const metadata: Metadata = {
    title: title,
    description: "Interface Indexer for " + title,
}

export default function Home() {
    return <Main currentPath="" title="Home" />;
}