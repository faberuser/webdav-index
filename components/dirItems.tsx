"use client"

import path from "path"
import { useState, useEffect } from "react"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
    DownloadIcon,
    FolderIcon,
    FileIcon,
    ZipIcon,
    ImageIcon,
    LoadingIcon,
    TextFileIcon
} from "@/components/icons"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"


const previewCache: any = {}

export function DislayDir({ dir, onChange }: any) {
    const [preview, setPreview] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const fetchContents = async () => {
        setIsLoading(true)
        const filename = encodeURIComponent(dir.hasThumbnail)
        const response = await fetch(`/api/preview?filename=${filename}`)
        const blob = await response.blob()
        const objectURL = URL.createObjectURL(blob)
        previewCache[dir.hasThumbnail] = objectURL
        setPreview(objectURL)
        setIsLoading(false)
    }

    useEffect(() => {
        if (dir.hasThumbnail != null) {
            if (previewCache[dir.hasThumbnail]) {
                setPreview(previewCache[dir.hasThumbnail])
            } else {
                fetchContents()
            }
        }
    }, [dir.hasThumbnail])

    return (
        dir.hasThumbnail != null ?
            <HoverCard>
                <HoverCardTrigger asChild>
                    <div style={{ cursor: 'pointer' }} onClick={() => onChange(dir.filename)} className="aspect-[1/1] w-full h-full group relative rounded-md p-4 shadow-sm transition-all border border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500">
                        <div className="text-center">
                            <div className="flex h-20 w-full items-center justify-center">
                                {isLoading ?
                                    <LoadingIcon className="h-12 w-12" />
                                    :
                                    preview && <Image
                                        src={preview}
                                        alt={dir.basename}
                                        width={0}
                                        height={0}
                                        sizes="100vw"
                                        className="w-full h-full object-cover rounded-md"
                                    />
                                }
                            </div>
                            <div className="relative mt-4">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">{dir.basename}</h3>
                            </div>
                        </div>
                    </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 bg-white dark:bg-black">
                    <div className="flex justify-between space-x-4">
                        <div className="space-y-1 h-full w-full">
                            <div className="flex justify-between">
                                <h4 className="text-sm font-semibold break-all">{dir.basename}</h4>
                                {/* <span className="pt-1 text-xs text-muted-foreground break-all">
                                    {dir.size} KB
                                </span> */}
                            </div>
                            {isLoading ?
                                <ImageIcon className="h-24 w-24" />
                                :
                                preview && <Image
                                    src={preview}
                                    alt={dir.basename}
                                    width={0}
                                    height={0}
                                    sizes="100vw"
                                    className="w-full h-full object-cover rounded-md"
                                />}
                        </div>
                    </div>
                </HoverCardContent>
            </HoverCard>
            :
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <div style={{ cursor: 'pointer' }} onClick={() => onChange(dir.filename)} className="aspect-[1/1] w-full h-full group relative rounded-md p-4 shadow-sm transition-all border border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500">
                            <div className="text-center">
                                <div className="flex h-20 w-full items-center justify-center">
                                    <FolderIcon className="h-12 w-12 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300" />
                                </div>
                                <div className="relative mt-4">
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">{dir.basename}</h3>
                                </div>
                            </div>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white dark:bg-black">
                        {dir.basename}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
    )
}


export function DisplayImage({ dir }: any) {
    const [preview, setPreview] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const fetchContents = async () => {
        setIsLoading(true)
        const filename = encodeURIComponent(dir.filename)
        const response = await fetch(`/api/preview?filename=${filename}`)
        const blob = await response.blob()
        const objectURL = URL.createObjectURL(blob)
        previewCache[dir.filename] = objectURL
        setPreview(objectURL)
        setIsLoading(false)
    }

    useEffect(() => {
        if (previewCache[dir.filename]) {
            setPreview(previewCache[dir.filename])
        } else {
            fetchContents()
        }
    }, [dir.filename])

    return (
        <Dialog>
            <DialogTrigger>
                <div className="aspect-[1/1] w-full h-full group p-0 relative rounded-md border shadow-sm transition-all border-gray-200 dark:border-gray-600">
                    <div className="flex h-full w-full items-center justify-center text-gray-500 dark:text-gray-400">
                        {isLoading ?
                            <LoadingIcon className="h-24 w-24" />
                            :
                            preview && <Image
                                src={preview}
                                alt={dir.basename}
                                width={0}
                                height={0}
                                sizes="100vw"
                                className="w-full h-full object-cover rounded-md"
                            />
                        }
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-black">
                <DialogHeader>
                    <DialogTitle className="break-all pr-5 flex justify-between">
                        <h4 className="text-md font-semibold">{dir.basename}</h4>
                        <span className="pt-1 text-xs text-muted-foreground w-28">
                            {dir.size < 1024 ? `${dir.size} B` : dir.size / 1024 < 1024 ? `${(dir.size / 1024).toFixed(2)} KB` : dir.size / 1024 / 1024 < 1024 ? `${(dir.size / 1024 / 1024).toFixed(2)} MB` : `${(dir.size / 1024 / 1024 / 1024).toFixed(2)} GB`}
                        </span>
                    </DialogTitle>
                    <DialogDescription>
                        {isLoading ?
                            <ImageIcon className="h-64 w-64" />
                            :
                            preview && <Image
                                src={preview}
                                alt={dir.basename}
                                width={0}
                                height={0}
                                sizes="100vw"
                                className="w-full h-full object-cover"
                            />
                        }
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

async function downloadFile(filepath: string) {
    const response = await fetch(`/api/download?filename=${encodeURIComponent(filepath)}`)

    if (!response.ok) {
        throw new Error('Failed to download file')
    }

    const link = document.createElement('a')
    link.href = response.url
    link.download = path.basename(filepath)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

export function DisplayTextFile({ dir }: any) {
    const { toast } = useToast()

    return (
        <Sheet>
            <SheetTrigger asChild>
                <div className="aspect-[1/1] w-full h-full group relative rounded-md border p-4 shadow-sm transition-all border-gray-200 dark:border-gray-600">

                    <Button variant="outline" size="sm" className="absolute top-1 right-1 border-gray-200 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-400"
                        onClick={async (e) => {
                            e.preventDefault()
                            try {
                                toast({
                                    title: "File download started",
                                    description: dir.basename + " with " + (dir.size < 1024 ? `${dir.size} B` : dir.size / 1024 < 1024 ? `${(dir.size / 1024).toFixed(2)} KB` : dir.size / 1024 / 1024 < 1024 ? `${(dir.size / 1024 / 1024).toFixed(2)} MB` : `${(dir.size / 1024 / 1024 / 1024).toFixed(2)} GB`),
                                    action: (
                                        <ToastAction altText="Yay">Yay</ToastAction>
                                    ),
                                })
                                await downloadFile(dir.filename)
                            } catch (error) {
                                console.error('Failed to download file:', error)
                            }
                        }}
                    >
                        <DownloadIcon className="h-4 w-4 text-gray-900 dark:text-gray-300" />
                    </Button>

                    <div className="text-center">
                        <div className="flex h-20 w-full items-center justify-center text-gray-500 dark:text-gray-400">
                            <TextFileIcon className="h-12 w-12" />
                        </div>
                        <div className="relative mt-4">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">{dir.basename}</h3>
                        </div>
                    </div>

                </div>
            </SheetTrigger>
            <SheetContent className="bg-white dark:bg-black overflow-auto ctscroll text-gray-700 dark:text-gray-300">
                <SheetHeader>
                    <SheetTitle className="break-all flex justify-between">
                        <h4 className="text-md font-semibold">{dir.basename}</h4>
                        <span className="text-xs text-muted-foreground pr-5 pt-2">
                            {dir.size < 1024 ? `${dir.size} B` : dir.size / 1024 < 1024 ? `${(dir.size / 1024).toFixed(2)} KB` : dir.size / 1024 / 1024 < 1024 ? `${(dir.size / 1024 / 1024).toFixed(2)} MB` : `${(dir.size / 1024 / 1024 / 1024).toFixed(2)} GB`}
                        </span>
                    </SheetTitle>
                    <SheetDescription className="whitespace-pre-wrap break-words">
                        <DisplayText filename={dir.filename} />
                    </SheetDescription>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    )
}

export function DisplayText({ filename }: any) {
    const [text, setText] = useState("")

    const getText = async () => {
        const response = await fetch(`/api/md?filename=${encodeURIComponent(filename)}`)
        if (!response.ok) {
            throw new Error('Failed to download file')
        }
        setText(await response.text())
    }

    useEffect(() => {
        getText()
    }, [filename])

    return (text)
}

export function DisplayFile({ dir }: any) {
    const { toast } = useToast()

    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                <div className="aspect-[1/1] w-full h-full group relative rounded-md border p-4 shadow-sm transition-all border-gray-200 dark:border-gray-600">

                    <Button variant="outline" size="sm" className="absolute top-1 right-1 border-gray-200 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-400"
                        onClick={async (e) => {
                            e.preventDefault()
                            try {
                                toast({
                                    title: "File download started",
                                    description: dir.basename + " with " + (dir.size < 1024 ? `${dir.size} B` : dir.size / 1024 < 1024 ? `${(dir.size / 1024).toFixed(2)} KB` : dir.size / 1024 / 1024 < 1024 ? `${(dir.size / 1024 / 1024).toFixed(2)} MB` : `${(dir.size / 1024 / 1024 / 1024).toFixed(2)} GB`),
                                    action: (
                                        <ToastAction altText="Yay">Yay</ToastAction>
                                    ),
                                })
                                await downloadFile(dir.filename)
                            } catch (error) {
                                console.error('Failed to download file:', error)
                            }
                        }}
                    >
                        <DownloadIcon className="h-4 w-4 text-gray-900 dark:text-gray-300" />
                    </Button>

                    <div className="text-center">
                        <div className="flex h-20 w-full items-center justify-center text-gray-500 dark:text-gray-400">
                            {dir.basename.endsWith('.zip') || dir.basename.endsWith('.rar') || dir.basename.endsWith('.7z') || dir.basename.endsWith('.tar') ?
                                <ZipIcon className="h-12 w-12" />
                                :
                                <FileIcon className="h-12 w-12" />
                            }
                        </div>
                        <div className="relative mt-4">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">{dir.basename}</h3>
                        </div>
                    </div>
                </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 bg-white dark:bg-black">
                <div className="flex justify-between space-x-4">
                    <div className="space-y-1">
                        <h4 className="text-sm font-semibold break-all">{dir.basename}</h4>
                        <div className="flex items-center pt-2">
                            <span className="text-xs text-muted-foreground break-all">
                                {dir.size < 1024 ? `${dir.size} B` : dir.size / 1024 < 1024 ? `${(dir.size / 1024).toFixed(2)} KB` : dir.size / 1024 / 1024 < 1024 ? `${(dir.size / 1024 / 1024).toFixed(2)} MB` : `${(dir.size / 1024 / 1024 / 1024).toFixed(2)} GB`}
                            </span>
                        </div>
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    )
}