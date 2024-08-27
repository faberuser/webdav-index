"use client"

import path from "path"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import {
    DownloadIcon,
    FolderIcon,
    FileIcon,
    ZipIcon,
    ImageIcon,
    LoadingIcon,
    TextFileIcon,
    VideoIcon,
    LoadingIconLarge,
} from "@/components/icons"
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
const imageCache: any = {}
const textCache: any = {}

const toastTitle = ({ dir }: any) =>
    "Downloading file with " + DisplaySize({ dir })

const toastDescription = ({ dir }: any) =>
    dir.basename

const backgroundClass = (props: any) =>
    props + " bg-white dark:bg-black"

const muteTextClass = (props: any) =>
    props + " text-xs text-muted-foreground text-nowrap flex items-center"

const nameTitleClass = (props: any) =>
    props + " flex justify-between gap-2 break-all"


function cardClass(props: any) {
    let padding = "p-4"
    if (props.includes("p-")) {
        padding = ""
    }
    return props + padding + " relative aspect-[1/1] w-full h-full rounded-md shadow-sm transition-all border border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
}


function DisplayBasename({ dir }: any) {
    return (
        <div className="h-1/4 w-full flex items-end justify-center">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">
                {dir.basename}
            </h3>
        </div>
    )
}


function DisplayIcon({ icon }: any) {
    return (
        <div className="h-3/4 w-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            {icon}
        </div>
    )
}


function DisplaySize({ dir }: any) {
    return (
        dir.size < 1024 ? `${dir.size} B` : dir.size / 1024 < 1024 ? `${(dir.size / 1024).toFixed(2)} KB` : dir.size / 1024 / 1024 < 1024 ? `${(dir.size / 1024 / 1024).toFixed(2)} MB` : `${(dir.size / 1024 / 1024 / 1024).toFixed(2)} GB`
    )
}


function DisplayDownloadButton({ dir }: any) {
    const { toast } = useToast()

    return (
        <Button variant="outline" size="sm" className="absolute top-1 right-1 border-gray-200 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-400"
            onClick={async (e) => {
                e.preventDefault()
                try {
                    toast({
                        title: toastTitle({ dir }),
                        description: toastDescription({ dir }),
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


async function fetchAndSet(url: string, cache: any, setFunc: any, filename: string, abortController: any, isFetching: any, setIsFetching: any) {
    if (isFetching) {
        return; // If a fetch request is in progress, don't start a new one
    }

    setIsFetching(true)

    if (abortController.current) {
        abortController.current.abort();
    }

    abortController.current = new AbortController()

    try {
        const response = await fetch(url, {
            signal: abortController.current.signal
        })
        const blob = await response.blob()
        const objectURL = URL.createObjectURL(blob)
        cache[filename] = objectURL
        setFunc(objectURL)
    } catch (error: any) {
        if (error.name === 'AbortError') { } else { throw error }
    } finally {
        setIsFetching(false)
    }
}


export function DisplayDir({ dir, onChange }: any) {
    const [preview, setPreview] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const abortController = useRef(new AbortController())
    const [isFetching, setIsFetching] = useState(false);

    const fetchContents = async () => {
        setIsLoading(true)
        const filename = encodeURIComponent(dir.hasThumbnail)
        await fetchAndSet(`/api/preview?filename=${filename}`, previewCache, setPreview, dir.hasThumbnail, abortController, isFetching, setIsFetching)
    }

    useEffect(() => {
        if (dir.hasThumbnail != null) {
            if (previewCache[dir.hasThumbnail]) {
                setPreview(previewCache[dir.hasThumbnail])
            } else {
                fetchContents()
            }
        }

        if (preview) {
            setIsLoading(false);
        }

        return () => {
            abortController.current.abort();
        }
    }, [dir.hasThumbnail, preview])

    return (
        dir.hasThumbnail != null ?
            <HoverCard>
                <HoverCardTrigger asChild>
                    <div style={{ cursor: 'pointer' }} onClick={() => onChange(dir.filename)} className={cardClass("")}>
                        {isLoading ?
                            <DisplayIcon icon={<LoadingIcon />} />
                            :
                            preview &&
                            <DisplayIcon icon={
                                <Image
                                    src={preview}
                                    alt={dir.basename}
                                    width={0}
                                    height={0}
                                    sizes="100vw"
                                    className="w-full h-full object-cover rounded-md"
                                />
                            } />
                        }
                        <DisplayBasename dir={dir} />
                    </div>
                </HoverCardTrigger>
                <HoverCardContent className={backgroundClass("")}>
                    {dir.basename}
                    {isLoading ?
                        <div className="flex items-center justify-center">
                            <ImageIcon className="h-24 w-24" />
                        </div>
                        :
                        preview && <Image
                            src={preview}
                            alt={dir.basename}
                            width={0}
                            height={0}
                            sizes="100vw"
                            className="w-full h-full rounded-md"
                        />}
                </HoverCardContent>
            </HoverCard>
            :
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <div style={{ cursor: 'pointer' }} onClick={() => onChange(dir.filename)} className={cardClass("")}>
                            <DisplayIcon icon={<FolderIcon className="h-12 w-12" />} />
                            <DisplayBasename dir={dir} />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className={backgroundClass("")}>
                        {dir.basename}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
    )
}


export function DisplayImage({ dir }: any) {
    const [preview, setPreview] = useState("")
    const [image, setImage] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isImageLoading, setIsImageLoading] = useState(true)

    const abortController = useRef(new AbortController())
    const [isFetching, setIsFetching] = useState(false);

    const fetchContents = async (image: boolean = false) => {
        setIsLoading(true)
        const filename = encodeURIComponent(dir.filename)
        if (image) {
            await fetchAndSet(`/api/image?filename=${filename}`, imageCache, setImage, dir.filename, abortController, isImageLoading, setIsImageLoading)
            setIsImageLoading(false);
        } else {
            await fetchAndSet(`/api/preview?filename=${filename}`, previewCache, setPreview, dir.filename, abortController, isFetching, setIsFetching)
        }
    }

    useEffect(() => {
        if (previewCache[dir.filename]) {
            setPreview(previewCache[dir.filename])
        } else {
            fetchContents()
        }

        if (preview) {
            setIsLoading(false);
        }

        return () => {
            abortController.current.abort();
        }
    }, [dir.filename, preview])

    function getImage(filename: any) {
        if (imageCache[filename]) {
            return imageCache[filename]
        } else {
            fetchContents(true)
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div style={{ cursor: 'pointer' }} className={cardClass("p-0")} onClick={() => getImage(dir.filename)}>
                    <div className="flex h-full w-full items-center justify-center text-gray-500 dark:text-gray-400">
                        <DisplayDownloadButton dir={dir} />
                        {isLoading ?
                            <LoadingIcon />
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
            <DialogContent className={backgroundClass("max-w-min max-h-screen")}>
                {isImageLoading ?
                    <DialogHeader>
                        <DialogTitle></DialogTitle>
                        <DialogDescription className="p-2">
                            <LoadingIconLarge />
                        </DialogDescription>
                    </DialogHeader>
                    : image && <DialogHeader>
                        <DialogTitle className={nameTitleClass("pr-5")}>
                            {dir.basename}
                            <span className={muteTextClass("")}>
                                <DisplaySize dir={dir} />
                            </span>
                        </DialogTitle>
                        <DialogDescription className="flex items-center justify-center">
                            <Image
                                src={image}
                                alt={dir.basename}
                                width={0}
                                height={0}
                                sizes="100vw"
                                className="max-h-[90vh] max-w-[90vw] w-auto h-full"
                            />
                        </DialogDescription>
                    </DialogHeader>
                }
            </DialogContent>
        </Dialog >
    )
}


export function DisplayVideo({ dir }: any) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <div style={{ cursor: 'pointer' }} className={cardClass("")}>
                    <DisplayDownloadButton dir={dir} />
                    <DisplayIcon icon={<VideoIcon className="h-12 w-12" />} />
                    <DisplayBasename dir={dir} />
                </div>
            </DialogTrigger>
            <DialogContent className={backgroundClass("max-w-min max-h-screen")}>
                <DialogHeader>
                    <DialogTitle className={nameTitleClass("pr-5")}>
                        {dir.basename}
                        <span className={muteTextClass("")}>
                            <DisplaySize dir={dir} />
                        </span>
                    </DialogTitle>
                    <DialogDescription className="flex items-center justify-center">
                        <video
                            src={`/api/video?filename=${dir.filename}`} controls
                            width={0}
                            height={0}
                            className="max-h-[90vh] max-w-[90vw] w-auto h-full"
                        >
                        </video>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}


export function DisplayTextFile({ dir }: any) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <div style={{ cursor: 'pointer' }} className={cardClass("")}>
                    <DisplayDownloadButton dir={dir} />
                    <DisplayIcon icon={<TextFileIcon className="h-12 w-12" />} />
                    <DisplayBasename dir={dir} />
                </div>
            </SheetTrigger>
            <SheetContent className={backgroundClass("overflow-auto ctscroll text-gray-700 dark:text-gray-300")}>
                <SheetHeader>
                    <SheetTitle className={nameTitleClass("")}>
                        {dir.basename}
                        <span className={muteTextClass("pr-5")}>
                            <DisplaySize dir={dir} />
                        </span>
                    </SheetTitle>
                    <SheetDescription className="whitespace-pre-wrap break-words text-pretty">
                        <DisplayText filename={dir.filename} />
                    </SheetDescription>
                </SheetHeader>
            </SheetContent>
        </Sheet >
    )
}


export function DisplayText({ filename }: any) {
    const [text, setText] = useState("")

    const getText = async () => {
        const response = await fetch(`/api/md?filename=${encodeURIComponent(filename)}`)
        if (!response.ok) {
            throw new Error('Failed to download file')
        }
        const text = await response.text()
        setText(text)
        textCache[filename] = text
    }

    useEffect(() => {
        if (textCache[filename]) {
            setText(textCache[filename])
        } else {
            getText()
        }
    }, [filename])

    return (text)
}


export function DisplayFile({ dir }: any) {
    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                <div className={cardClass("")}>
                    <DisplayDownloadButton dir={dir} />
                    {dir.basename.endsWith('.zip') || dir.basename.endsWith('.rar') || dir.basename.endsWith('.7z') || dir.basename.endsWith('.tar') ?
                        <DisplayIcon icon={<ZipIcon className="h-12 w-12" />} />
                        :
                        <DisplayIcon icon={<FileIcon className="h-12 w-12" />} />
                    }
                    <DisplayBasename dir={dir} />
                </div>
            </HoverCardTrigger>
            <HoverCardContent className={backgroundClass("w-full")}>
                <div className="flex justify-between space-x-4">
                    <div className="space-y-1">
                        {dir.basename}
                        <span className={muteTextClass("pt-2")}>
                            <DisplaySize dir={dir} />
                        </span>
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    )
}