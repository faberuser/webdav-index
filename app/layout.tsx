import type { Metadata } from "next"
import { title } from '@/config'

const metadata: Metadata = {
  title: title,
  description: "Interface Indexer for " + title,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <div>{children}</div>
}