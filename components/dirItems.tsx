"use client"

import path from "path"
import { useState, useEffect } from "react"

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

function truncateString(str: string, maxLength: number): string {
    if (str.length > maxLength) {
        return str.substring(0, maxLength) + '...';
    }
    return str;
}

const toastTitle = ({ dir }: any) =>
    "Downloading file with " + DisplaySize({ dir })

const toastDescription = ({ dir }: any) =>
    truncateString(dir.basename, 25)

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


function DisplayDownloadButton({ dir, listView }: any) {
    const { toast } = useToast()

    return (
        <Button size="sm" className={listView == false ? "absolute top-1 right-1 hover:bg-gray-200 dark:hover:bg-gray-800" : "hover:bg-gray-200 dark:hover:bg-gray-800"}
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
    const fileLink = document.createElement('a')
    const downloadURL = `/api/download?filename=${encodeURIComponent(filepath)}`
    const fileName = path.basename(filepath)
    fileLink.href = downloadURL
    fileLink.download = fileName
    fileLink.click()
}


async function fetchAndSet(url: string, cache: any, setFunc: any, filename: string, fetchQueue: any) {
    const abortController = new AbortController()
    fetchQueue.push(abortController)

    try {
        const response = await fetch(url, {
            signal: abortController.signal
        })
        const blob = await response.blob()
        const objectURL = URL.createObjectURL(blob)
        cache[filename] = objectURL
        setFunc(objectURL)
    } catch (error: any) {
        if (error.name === 'AbortError') { }
        else if (error.name === 'TypeError') { }
        else { throw error }
    } finally {
        fetchQueue = fetchQueue.filter((controller: any) => controller !== abortController)
    }
}


export function DisplayDir({ dir, onChange, fetchQueue, listView }: any) {
    const [preview, setPreview] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const fetchContents = async () => {
        setIsLoading(true)
        const filename = encodeURIComponent(dir.hasThumbnail)
        await fetchAndSet(`/api/preview?filename=${filename}`, previewCache, setPreview, dir.hasThumbnail, fetchQueue)
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
            setIsLoading(false)
        }
    }, [dir.hasThumbnail, preview])

    if (listView) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild className="h-full w-full">
                        <div className="flex items-center gap-4 p-3 rounded-md shadow-sm transition-all border border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 text-gray-500 dark:text-gray-400"
                            style={{ cursor: 'pointer' }}
                            onClick={() => onChange(dir.filename)}>
                            <FolderIcon className="h-8 w-8" />

                            <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">{dir.basename}</div>
                            </div>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className={backgroundClass("")}>
                        {dir.basename}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    } else {
        return (
            dir.hasThumbnail != null ?
                <HoverCard>
                    <HoverCardTrigger asChild className="h-full w-full">
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
                        <TooltipTrigger asChild className="h-full w-full">
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
}


export function DisplayImage({ dir, fetchQueue, listView }: any) {
    const [preview, setPreview] = useState("")
    const [image, setImage] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isImageLoading, setIsImageLoading] = useState(true)

    const fetchContents = async (image: boolean = false) => {
        setIsLoading(true)
        const filename = encodeURIComponent(dir.filename)
        if (image) {
            await fetchAndSet(`/api/image?filename=${filename}`, imageCache, setImage, dir.filename, fetchQueue)
        } else {
            await fetchAndSet(`/api/preview?filename=${filename}`, previewCache, setPreview, dir.filename, fetchQueue)
        }
    }

    useEffect(() => {
        if (previewCache[dir.filename]) {
            setPreview(previewCache[dir.filename])
        } else {
            fetchContents()
        }
        if (preview) {
            setIsLoading(false)
        }
        if (image) {
            setIsImageLoading(false)
        }
    }, [dir.filename, preview, image])

    function getImage(filename: any) {
        if (imageCache[filename]) {
            return imageCache[filename]
        } else {
            fetchContents(true)
        }
    }

    if (listView) {
        return (
            <Dialog>
                <DialogTrigger asChild className="h-full w-full">
                    <div className="flex items-center gap-4 p-3 rounded-md shadow-sm transition-all border border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 text-gray-500 dark:text-gray-400"
                        style={{ cursor: 'pointer' }} onClick={() => getImage(dir.filename)}>
                        <ImageIcon className="h-8 w-8" />

                        <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">{dir.basename}</div>
                            <span className={muteTextClass("")}>
                                <DisplaySize dir={dir} />
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <DisplayDownloadButton dir={dir} listView={true} />
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
            </Dialog>
        )
    } else {
        return (
            <Dialog>
                <DialogTrigger asChild className="h-full w-full">
                    <div style={{ cursor: 'pointer' }} className={cardClass("p-0")} onClick={() => getImage(dir.filename)}>
                        <div className="flex h-full w-full items-center justify-center text-gray-500 dark:text-gray-400">
                            <DisplayDownloadButton dir={dir} listView={false} />
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
            </Dialog>
        )
    }
}


export function DisplayVideo({ dir, listView }: any) {
    if (listView) {
        return (
            <Dialog>
                <DialogTrigger asChild className="h-full w-full">
                    <div className="flex items-center gap-4 p-3 rounded-md shadow-sm transition-all border border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 text-gray-500 dark:text-gray-400"
                        style={{ cursor: 'pointer' }}>
                        <VideoIcon className="h-8 w-8" />

                        <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">{dir.basename}</div>
                            <span className={muteTextClass("")}>
                                <DisplaySize dir={dir} />
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <DisplayDownloadButton dir={dir} listView={true} />
                        </div>
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
                            <video controls autoPlay
                                src={`/api/video?filename=${dir.filename}`}
                                width={0}
                                height={0}
                                className="max-h-[90vh] max-w-[90vw] w-auto h-full"
                            >
                                Your browser does not support the video tag.
                            </video>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        )
    } else {
        return (
            <Dialog>
                <DialogTrigger asChild className="h-full w-full">
                    <div style={{ cursor: 'pointer' }} className={cardClass("")}>
                        <DisplayDownloadButton dir={dir} listView={false} />
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
                            <video controls autoPlay
                                src={`/api/video?filename=${dir.filename}`}
                                width={0}
                                height={0}
                                className="max-h-[90vh] max-w-[90vw] w-auto h-full"
                            >
                                Your browser does not support the video tag.
                            </video>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        )
    }
}


export function DisplayTextFile({ dir, listView }: any) {
    if (listView) {
        return (
            <Sheet>
                <SheetTrigger asChild className="h-full w-full">
                    <div className="flex items-center gap-4 p-3 rounded-md shadow-sm transition-all border border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 text-gray-500 dark:text-gray-400"
                        style={{ cursor: 'pointer' }}>
                        <TextFileIcon className="h-8 w-8" />

                        <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">{dir.basename}</div>
                            <span className={muteTextClass("")}>
                                <DisplaySize dir={dir} />
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <DisplayDownloadButton dir={dir} listView={true} />
                        </div>
                    </div>
                </SheetTrigger>
                <SheetContent className={backgroundClass("overflow-auto ctscroll text-gray-700 dark:text-gray-300 allow-select")}>
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
            </Sheet>
        )
    } else {
        return (
            <Sheet>
                <SheetTrigger asChild className="h-full w-full">
                    <div style={{ cursor: 'pointer' }} className={cardClass("")}>
                        <DisplayDownloadButton dir={dir} listView={false} />
                        <DisplayIcon icon={<TextFileIcon className="h-12 w-12" />} />
                        <DisplayBasename dir={dir} />
                    </div>
                </SheetTrigger>
                <SheetContent className={backgroundClass("overflow-auto ctscroll text-gray-700 dark:text-gray-300 allow-select")}>
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
            </Sheet>
        )
    }
}


export function DisplayText({ filename, fetchQueue }: any) {
    const [text, setText] = useState("")
    const abortController = new AbortController()

    const getText = async () => {
        fetchQueue.push(abortController)

        try {
            const response = await fetch(`/api/md?filename=${encodeURIComponent(filename)}`)
            if (!response.ok) {
                throw new Error('Failed to download file')
            }
            const text = await response.text()
            setText(text)
            textCache[filename] = text
        } catch (error: any) {
            if (error.name === 'AbortError') { }
            else if (error.name === 'TypeError') { }
            else { throw error }
        } finally {
            fetchQueue = fetchQueue.filter((controller: any) => controller !== abortController)
        }
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


export function DisplayFile({ dir, listView }: any) {
    if (listView) {
        return (
            <HoverCard>
                <HoverCardTrigger asChild className="h-full w-full">
                    <div className="flex items-center gap-4 p-3 rounded-md shadow-sm transition-all border border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 text-gray-500 dark:text-gray-400"
                        style={{ cursor: 'pointer' }}>
                        {dir.basename.endsWith('.zip') || dir.basename.endsWith('.rar') || dir.basename.endsWith('.7z') || dir.basename.endsWith('.tar') ?
                            <ZipIcon className="h-8 w-8" />
                            :
                            <FileIcon className="h-8 w-8" />
                        }

                        <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">{dir.basename}</div>
                            <span className={muteTextClass("")}>
                                <DisplaySize dir={dir} />
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <DisplayDownloadButton dir={dir} listView={true} />
                        </div>
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
    } else {
        return (
            <HoverCard>
                <HoverCardTrigger asChild className="h-full w-full">
                    <div className={cardClass("")}>
                        <DisplayDownloadButton dir={dir} listView={false} />
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
}