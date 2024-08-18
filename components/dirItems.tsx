"use client"

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
    ImageIcon
} from "@/components/icons"
import { Image } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export function DislayDir({ dir, onChange }: any) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <div style={{ cursor: 'pointer' }} onClick={() => onChange(dir.filename)} className="group relative rounded-md p-4 shadow-sm transition-all border border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500">
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

export function DisplayArchive({ dir }: any) {
    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                <div className="group relative rounded-md border p-4 shadow-sm transition-all border-gray-200 dark:border-gray-600">
                    <Button variant="outline" size="sm" className="absolute top-1 right-1 border-gray-200 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-400">
                        <DownloadIcon className="h-4 w-4 text-gray-900 dark:text-gray-300" />
                    </Button>
                    <div className="text-center truncate">
                        <div className="flex h-20 w-full items-center justify-center text-gray-500 dark:text-gray-400">
                            <ZipIcon className="h-12 w-12" />
                        </div>
                        <div className="relative mt-4">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">{dir.basename}</h3>
                        </div>
                    </div>
                </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 bg-white dark:bg-black">
                <div className="flex justify-between space-x-4">
                    <div className="space-y-1">
                        <h4 className="text-sm font-semibold break-all">{dir.basename}</h4>
                        <div className="flex items-center pt-2">
                            <span className="text-xs text-muted-foreground">
                                {dir.size} MB
                            </span>
                        </div>
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    )
}

export function DisplayImage({ dir }: any) {
    const [isLoading, setIsLoading] = useState(false)

    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                <div className="group relative rounded-md border p-4 shadow-sm transition-all border-gray-200 dark:border-gray-600">
                    <div className="text-center truncate">
                        <div className="flex h-20 w-full items-center justify-center text-gray-500 dark:text-gray-400">
                            <ImageIcon className="h-12 w-12" />
                        </div>
                        <div className="relative mt-4">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">{dir.basename}</h3>
                        </div>
                    </div>
                </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 bg-white dark:bg-black">
                <div className="flex justify-between space-x-4">
                    <div className="space-y-1">
                        <h4 className="text-sm font-semibold break-all">{dir.basename}</h4>
                        <Image preview={`/api/preview?file=${encodeURIComponent(dir.filename)}`} width={200} height={200} alt={dir.basename} />
                        <p className="text-sm">
                            Preview placeholder
                        </p>
                        <div className="flex items-center pt-2">
                            <span className="text-xs text-muted-foreground">
                                {dir.size} MB
                            </span>
                        </div>
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    )
}

export function DisplayFile({ dir }: any) {
    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                <div className="group relative rounded-md border p-4 shadow-sm transition-all border-gray-200 dark:border-gray-600">
                    <div className="text-center truncate">
                        <div className="flex h-20 w-full items-center justify-center text-gray-500 dark:text-gray-400">
                            <FileIcon className="h-12 w-12" />
                        </div>
                        <div className="relative mt-4">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">{dir.basename}</h3>
                        </div>
                    </div>
                </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 bg-white dark:bg-black">
                <div className="flex justify-between space-x-4">
                    <div className="space-y-1">
                        <h4 className="text-sm font-semibold break-all">{dir.basename}</h4>
                        {dir.basename.endsWith('.md') || dir.basename.endsWith('.txt') ?
                            <p className="text-sm">
                                Preview placeholder
                            </p> :
                            null
                        }
                        <div className="flex items-center pt-2">
                            <span className="text-xs text-muted-foreground">
                                {dir.size} MB
                            </span>
                        </div>
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    )
}