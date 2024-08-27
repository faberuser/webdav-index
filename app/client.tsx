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
    LoadingIconLarge,
    GitHubIcon
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
import {
    DisplayDir,
    DisplayImage,
    DisplayTextFile,
    DisplayFile,
    DisplayText,
    DisplayVideo,
} from "@/components/dirItems"

const cache: any = {}
let fetchQueue: any = new Map()

export default function Client({ title }: any) {
    const [rootDirItems, setRootDirItems] = useState([])
    const [dirItems, setDirItems] = useState([])
    const [currentPath, setCurrentPath] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [hasMD, setHasMD] = useState("")

    const fetchContents = async () => {
        setHasMD("")
        setIsLoading(true)

        const response = await fetch(`/api/listContents?dir=${encodeURIComponent(currentPath)}`)
        const json = await response.json()
        cache[currentPath] = json
        setDirItems(json)
        const mdFile = json.find((item: any) => item.basename.endsWith('.md'))
        if (mdFile) {
            setHasMD(mdFile.filename)
        }
        if (rootDirItems.length === 0) {
            setRootDirItems(json)
        }
        setIsLoading(false)
    }

    useEffect(() => {
        if (cache[currentPath]) {
            setHasMD("")
            setDirItems(cache[currentPath])
            const mdFile = cache[currentPath].find((item: any) => item.basename.endsWith('.md'))
            if (mdFile) {
                setHasMD(mdFile.filename)
            }
        } else {
            fetchContents()
        }
    }, [currentPath])

    function setNewPath(_path: any) {
        console.log(fetchQueue)
        for (const [controller, isRunning] of fetchQueue) {
            if (!isRunning) {
                controller.abort()
                fetchQueue.delete(controller)
            }
        }
        setCurrentPath(_path)
    }

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
                    <nav className="ctscroll flex-1 space-y-2 overflow-auto">

                        {rootDirItems.filter((dir: any) => dir.type === "directory").map((dir: any) => (
                            <ListDirs
                                key={dir.etag}
                                dir={dir.basename}
                                path={'/' + dir.basename}
                                currentPath={currentPath}
                                onChange={(_path: any) => setNewPath(_path)}
                            />
                        ))}

                    </nav>
                </div>
            </div>

            <div className="flex flex-col h-screen w-full">
                <div className="flex h-14 items-center justify-between border-b dark:border-gray-600 p-6">
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
                        <a target="_blank" rel="noreferrer" href="https://github.com/faberuser/webdav-index">
                            <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground py-2 h-8 w-8 px-0">
                                <GitHubIcon className="h-5 w-5" />
                                <span className="sr-only">GitHub</span>
                            </div>
                        </a>
                        <ModeToggle />
                    </div>
                </div>
                {hasMD ? (
                    <div className="flex h-full overflow-hidden">
                        <div className="flex-1 overflow-auto p-4 md:p-6 ctscroll">
                            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-7 auto-rows-min">

                                <AccessDir
                                    items={dirItems}
                                    onChange={(_path: any) => setNewPath(_path)}
                                />

                            </div>
                        </div>
                        <div className="hidden md:block w-80 border-l dark:border-gray-600 text-gray-700 dark:text-gray-300 p-4 overflow-auto ctscroll">
                            <h2 className="text-lg font-semibold">
                                {hasMD.split('/').filter((x: string) => x).pop()}
                            </h2>
                            <div className="text-sm whitespace-pre-wrap break-words text-pretty">
                                <DisplayText filename={hasMD} />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 h-full overflow-auto p-4 md:p-6">
                        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-9 auto-rows-min">

                            <AccessDir
                                items={dirItems}
                                onChange={(_path: any) => setNewPath(_path)}
                            />

                        </div>
                    </div>
                )}
            </div>

        </div>
    )
}

function ListDirs({ dir, path, currentPath = "", onChange }: any) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [subDirs, setSubDirs] = useState([])

    const fetchContents = async () => {
        setIsLoading(true)
        const response = await fetch(`/api/listContents?dir=${encodeURIComponent(path)}`)
        const json = await response.json()
        cache[path] = json
        setSubDirs(json.filter((_dir: any) => _dir.type === "directory"))
        setIsLoading(false)
    }

    useEffect(() => {
        if (cache[path]) {
            setSubDirs(cache[path].filter((_dir: any) => _dir.type === "directory"))
        } else {
            fetchContents()
        }
    }, [path])

    const handleExpand = () => {
        if (subDirs.length === 0) {
            setIsExpanded(false)
        } else {
            setIsExpanded(!isExpanded)
        }
        if (!isExpanded || subDirs.length === 0) {
            onChange(path)
        }
    }

    return (
        <div>
            <div style={{ cursor: 'pointer' }} onClick={handleExpand} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800">
                {isLoading && <LoadingIcon />}
                {!isLoading && subDirs.length > 0 && (isExpanded ? <ArrowDownIcon /> : <ArrowRightIcon />)}
                {/* {currentPath.split('/').filter((x: string) => x).pop() === dir ? <span className="font-semibold text-gray-200 dark:text-gray-800">{dir}</span> : dir} */}
                <TooltipProvider>
                    <Tooltip>
                        <div className="truncate w-full">
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
            {isExpanded && subDirs.map((subDir: any) => (
                <div key={subDir.etag} style={{ marginLeft: '10px' }}>
                    <ListDirs dir={subDir.basename} path={`${path}/${subDir.basename}`} isLoading={isLoading} onChange={onChange} />
                </div>
            ))}
        </div>

    )
}

function getFileExtension(filename: string) {
    const dotIndex = filename.lastIndexOf('.')
    if (dotIndex === -1) return ''
    return filename.slice(dotIndex)
}

function AccessDir({ items, onChange }: any) {
    const fileExtensionToComponent: any = {
        '.png': DisplayImage,
        '.jpg': DisplayImage,
        '.jpeg': DisplayImage,
        '.gif': DisplayImage,
        '.avif': DisplayImage,
        '.webp': DisplayImage,

        '.mp4': DisplayVideo,

        '.md': DisplayTextFile,
        '.txt': DisplayTextFile,
        '.json': DisplayTextFile,
        '.ini': DisplayTextFile,
        '.log': DisplayTextFile,
    }

    return (
        items.map((dir: any) => {
            const Component = dir.type === 'directory'
                ? DisplayDir
                : fileExtensionToComponent[getFileExtension(dir.basename)] || DisplayFile

            return <Component key={dir.etag} dir={dir} onChange={onChange} fetchQueue={fetchQueue} />
        })
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
                        <BreadcrumbPage style={{ cursor: 'pointer' }} onClick={() => onChange("/" + secondLastPath)} className="truncate">{secondLastPath}</BreadcrumbPage>
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
                            <DropdownMenuTrigger className="flex items-center gap-1 truncate">
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
                                    )
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