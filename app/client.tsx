"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/toggleMode"
import { useState, useEffect } from "react"
import { ChevronDown, Slash } from "lucide-react"
import {
    FolderIcon,
    MenuIcon,
    ArrowDownIcon,
    ArrowRightIcon,
    LoadingIcon,
    LoadingIconLarge
} from "@/components/icons"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

import { DislayDir, DisplayArchive, DisplayImage, DisplayFile } from "@/components/dirItems"

const cache: any = {}

export default function Client({ title }: any) {
    const [rootDirItems, setRootDirItems] = useState([])
    const [dirItems, setDirItems] = useState([])
    const [currentPath, setCurrentPath] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const fetchContents = async () => {
        setIsLoading(true)
        const response = await fetch(`/api/listContents?dir=${encodeURIComponent(currentPath)}`)
        const json = await response.json()
        cache[currentPath] = json
        setDirItems(json)
        if (rootDirItems.length === 0) {
            setRootDirItems(json)
        }
        setIsLoading(false)
    }

    useEffect(() => {
        fetchContents()
    }, [])

    function setNewPath(_path: any) {
        setCurrentPath(_path);
    }

    useEffect(() => {
        if (cache[currentPath]) {
            setDirItems(cache[currentPath]);
        } else {
            fetchContents();
        }
    }, [currentPath]);

    return (
        <div className="flex h-screen w-full">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 dark:bg-white dark:bg-opacity-10 z-50">
                    <LoadingIconLarge />
                </div>
            )}

            <div className="hidden h-full w-64 shrink-0 border-r dark:border-gray-600 lg:block">
                <div className="flex h-full flex-col gap-4 p-4">
                    <Link href="#" className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-50" prefetch={false}>
                        <FolderIcon className="h-6 w-6" />
                        <span>{title}</span>
                    </Link>
                    <nav className="dirtree flex-1 space-y-2 overflow-auto">

                        {rootDirItems.filter((dir: any) => dir.type === "directory").map((dir: any, index: number) => (
                            <ListDirs
                                key={index}
                                dir={dir.basename}
                                path={'/' + dir.basename}
                                currentPath={currentPath}
                                onChange={(_path: any) => setNewPath(_path)}
                            />
                        ))}

                    </nav>
                </div>
            </div>

            <div className="flex flex-1 flex-col">
                <div className="flex h-14 items-center justify-between border-b dark:border-gray-600 px-6">
                    <div className="flex items-center gap-4">

                        <Button variant="ghost" size="icon" className="lg:hidden">
                            <MenuIcon className="h-6 w-6" />
                        </Button>

                        <UpdateBreadcrumb
                            path={currentPath}
                            onChange={(_path: any) => setNewPath(_path)}
                        />

                    </div>
                    <div className="flex items-center gap-4">
                        <ModeToggle />
                    </div>
                </div>
                <div className="flex-1 overflow-auto p-4 md:p-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">

                        <AccessDir
                            items={dirItems}
                            onChange={(_path: any) => setNewPath(_path)}
                        />

                    </div>
                </div>
            </div>

        </div>
    )
}

function ListDirs({ dir, path, currentPath = "", onChange }: any) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [dirItems, setDirItems] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    const fetchContents = async () => {
        setIsLoading(true)
        const response = await fetch(`/api/listContents?dir=${encodeURIComponent(path)}`)
        const json = await response.json()
        cache[path] = json
        setDirItems(json)
        setIsLoading(false)
    }

    useEffect(() => {
        if (cache[path]) {
            setDirItems(cache[path])
        } else {
            fetchContents()
        }
    }, [])

    const handleExpand = () => {
        setIsExpanded(!isExpanded)
        if (!isExpanded) {
            onChange(path)
        }
    }

    const subDirs = dirItems.filter((_dir: any) => _dir.type === "directory")
    // const lastPath = currentPath.split('/').filter((x: string) => x).pop()
    // console.log(lastPath, path)

    return (
        <div>
            <div style={{ cursor: 'pointer' }} onClick={handleExpand} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800">
                {isLoading && <LoadingIcon />}
                {!isLoading && subDirs.length > 0 && (isExpanded ? <ArrowDownIcon /> : <ArrowRightIcon />)}
                {/* {lastPath === dir ? <span className="font-semibold text-gray-200 dark:text-gray-800">{dir}</span> : dir} */}
                <TooltipProvider>
                    <Tooltip>
                        <div className="truncate">
                            <TooltipTrigger>
                                {dir}
                            </TooltipTrigger>
                        </div>
                        <TooltipContent className="bg-white dark:bg-black">
                            {dir}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
            {isExpanded && subDirs.map((subDir: any, index: number) => (
                <div key={index} style={{ marginLeft: '10px' }}>
                    <ListDirs dir={subDir.basename} path={`${path}/${subDir.basename}`} isLoading={isLoading} onChange={onChange} />
                </div>
            ))}
        </div>

    )
}

function AccessDir({ items, onChange }: any) {
    return (
        items.map((dir: any, index: number) => (
            dir.type === 'directory' ?
                <DislayDir key={index} dir={dir} onChange={onChange} />
                :
                dir.basename.endsWith('.zip') || dir.basename.endsWith('.rar') || dir.basename.endsWith('.7z') || dir.basename.endsWith('.tar') ?
                    <DisplayArchive key={index} dir={dir} />
                    :
                    dir.basename.endsWith('.png') || dir.basename.endsWith('.jpg') || dir.basename.endsWith('.jpeg') || dir.basename.endsWith('.gif') || dir.basename.endsWith('.avif') || dir.basename.endsWith('.webp') ?
                        <DisplayImage key={index} dir={dir} />
                        :
                        <DisplayFile key={index} dir={dir} />
        ))
    )
}

function UpdateBreadcrumb({ path = "", onChange }: any) {
    const pathnames = path.split('/').filter((x: string) => x)
    const secondLastPath = pathnames[pathnames.length - 2]
    const lastPath = pathnames[pathnames.length - 1]
    const middlePaths = pathnames.slice(0, pathnames.length - 1)

    if (pathnames.length === 0) {
        return (
            <Breadcrumb>
                <BreadcrumbList>

                    <BreadcrumbItem>
                        <BreadcrumbPage>Home</BreadcrumbPage>
                    </BreadcrumbItem>

                </BreadcrumbList>
            </Breadcrumb>
        )
    } else if (pathnames.length === 1) {
        return (
            <Breadcrumb>
                <BreadcrumbList>

                    <BreadcrumbItem>
                        <BreadcrumbPage style={{ cursor: 'pointer' }} onClick={() => onChange("")}>Home</BreadcrumbPage>
                    </BreadcrumbItem>

                    <BreadcrumbSeparator>
                        <Slash />
                    </BreadcrumbSeparator>

                    <BreadcrumbItem>
                        <BreadcrumbPage >{lastPath}</BreadcrumbPage>
                    </BreadcrumbItem>

                </BreadcrumbList>
            </Breadcrumb>
        )
    } else if (pathnames.length === 2) {
        return (
            <Breadcrumb>
                <BreadcrumbList>

                    <BreadcrumbItem>
                        <BreadcrumbPage style={{ cursor: 'pointer' }} onClick={() => onChange("")}>Home</BreadcrumbPage>
                    </BreadcrumbItem>

                    <BreadcrumbSeparator>
                        <Slash />
                    </BreadcrumbSeparator>

                    <BreadcrumbItem>
                        <BreadcrumbPage style={{ cursor: 'pointer' }} onClick={() => onChange("/" + secondLastPath)}>{secondLastPath}</BreadcrumbPage>
                    </BreadcrumbItem>

                    <BreadcrumbSeparator>
                        <Slash />
                    </BreadcrumbSeparator>

                    <BreadcrumbItem>
                        <BreadcrumbPage>{lastPath}</BreadcrumbPage>
                    </BreadcrumbItem>

                </BreadcrumbList>
            </Breadcrumb>
        )
    } else if (pathnames.length >= 3) {
        return (
            <Breadcrumb className="text-gray-900 dark:text-gray-50">
                <BreadcrumbList>

                    <BreadcrumbItem>
                        <BreadcrumbPage style={{ cursor: 'pointer' }} onClick={() => onChange("")}>Home</BreadcrumbPage>
                    </BreadcrumbItem>

                    <BreadcrumbSeparator>
                        <Slash />
                    </BreadcrumbSeparator>

                    <BreadcrumbItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-1">
                                {secondLastPath}
                                <ChevronDown className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-white dark:bg-black dark:border-gray-700">

                                {middlePaths.map((value: string, index: number) => {
                                    const valueLocation = [...pathnames.slice(0, index), value].join('/')
                                    return (
                                        <DropdownMenuItem
                                            style={{ cursor: 'pointer' }}
                                            key={index}
                                            onClick={() => onChange("/" + valueLocation)}
                                            className="hover:bg-gray-200 dark:hover:bg-gray-800">
                                            <BreadcrumbPage >{value}</BreadcrumbPage>
                                        </DropdownMenuItem>
                                    );
                                })}

                            </DropdownMenuContent>
                        </DropdownMenu>
                    </BreadcrumbItem>

                    <BreadcrumbSeparator>
                        <Slash />
                    </BreadcrumbSeparator>

                    <BreadcrumbItem>
                        <BreadcrumbPage>{lastPath}</BreadcrumbPage>
                    </BreadcrumbItem>

                </BreadcrumbList>
            </Breadcrumb>
        )
    }
}