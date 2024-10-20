"use client"

import { useState, useEffect } from "react"
import RenderIfVisible from '@/components/RenderIfVisible'

import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/toggleMode"
import { ChevronDown } from "lucide-react"
import {
    FolderIcon,
    MenuIcon,
    ArrowDownIcon,
    ArrowRightIcon,
    LoadingIcon,
    LoadingIconLarge,
    GitHubIcon,
    HomeIcon,
    ListIcon
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
let fetchQueue: any = []


export default function Client({ title }: any) {
    const [rootDirItems, setRootDirItems] = useState([])
    const [dirItems, setDirItems] = useState([])
    const [currentPath, setCurrentPath] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [hasMD, setHasMD] = useState("")
    const [isListView, setIsListView] = useState(false)

    async function fetchRootContents() {
        const response = await fetch(`/api/listContents?dir=`)
        const json = await response.json()
        setRootDirItems(json)
    }

    const fetchContents = async () => {
        if (rootDirItems.length === 0) {
            await fetchRootContents()
        }
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

    useEffect(() => {
        const savedState = localStorage.getItem('isListView')
        setIsListView(savedState !== null ? JSON.parse(savedState) : false)

        const handlePopState = (event?: PopStateEvent) => {
            setCurrentPath(window.location.pathname === '/' ? '' : decodeURIComponent(window.location.pathname))
        }
        handlePopState()
        window.addEventListener('popstate', handlePopState)
        return () => {
            window.removeEventListener('popstate', handlePopState)
        }
    }, [])

    function handleListView(value: any) {
        setIsListView(value);
        localStorage.setItem('isListView', JSON.stringify(value));
    }

    function setNewPath(_path: any) {
        for (const controller of fetchQueue) {
            controller.abort()
        }
        fetchQueue = []
        setCurrentPath(_path)
        if (_path == "") {
            _path = "/"
        }
        window.history.pushState(null, "", _path)
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
                    <div onClick={() => setNewPath("")} className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-50">
                        <FolderIcon className="h-6 w-6" />
                        <span>{title}</span>
                    </div>
                    <nav className="ctscroll flex-1 space-y-2 overflow-auto">

                        {rootDirItems.filter((dir: any) => dir.type === "directory").map((dir: any) => (
                            <ListDirs
                                key={dir.etag}
                                dir={dir.basename}
                                path={'/' + dir.basename}
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
                        <Button
                            size="icon"
                            className={isListView ? "bg-gray-200 dark:bg-gray-800" : "hover:bg-gray-200 dark:hover:bg-gray-800"}
                            onClick={() => handleListView(!isListView)}
                        >
                            <ListIcon className="h-[1.2rem] w-[1.2rem]" />
                        </Button>
                        <a target="_blank" rel="noreferrer" href="https://github.com/faberuser/webdav-index">
                            <Button size="icon" className="hover:bg-gray-200 dark:hover:bg-gray-800">
                                <GitHubIcon className="h-[1.2rem] w-[1.2rem]" />
                                <span className="sr-only">GitHub</span>
                            </Button>
                        </a>
                        <ModeToggle />
                    </div>
                </div>
                {hasMD ? (
                    <div className="flex h-full overflow-hidden">
                        {isListView ? (
                            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                                <div className="grid gap-2">
                                    <AccessDir
                                        items={dirItems}
                                        onChange={(_path: any) => setNewPath(_path)}
                                        listView={isListView}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-auto p-4 md:p-6 ctscroll">
                                <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-7 auto-rows-min">
                                    <AccessDir
                                        items={dirItems}
                                        onChange={(_path: any) => setNewPath(_path)}
                                        listView={isListView}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="hidden md:block w-80 border-l dark:border-gray-600 text-gray-700 dark:text-gray-300 p-4 overflow-auto ctscroll allow-select">
                            <h2 className="text-lg font-semibold">
                                {hasMD.split('/').filter((x: string) => x).pop()}
                            </h2>
                            <div className="text-sm whitespace-pre-wrap break-words text-pretty">
                                <DisplayText filename={hasMD} fetchQueue={fetchQueue} key={currentPath} />
                            </div>
                        </div>
                    </div>
                ) : (
                    isListView ? (
                        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                            <div className="grid gap-2">
                                <AccessDir
                                    items={dirItems}
                                    onChange={(_path: any) => setNewPath(_path)}
                                    listView={isListView}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 h-full overflow-auto p-4 md:p-6">
                            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-9 auto-rows-min">
                                <AccessDir
                                    items={dirItems}
                                    onChange={(_path: any) => setNewPath(_path)}
                                    listView={isListView}
                                />
                            </div>
                        </div>
                    )
                )}
            </div>

        </div>
    )
}


function ListDirs({ dir, path, onChange }: any) {
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
    }

    return (
        <div>
            <div className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800">
                <div onClick={handleExpand} className="hover:text-gray-400 dark:hover:text-gray-600">
                    {isLoading && <LoadingIcon />}
                    {!isLoading && subDirs.length > 0 && (isExpanded ? <ArrowDownIcon /> : <ArrowRightIcon />)}
                </div>
                <div style={{ cursor: 'pointer' }} onClick={() => onChange(path)} className="w-full h-full">
                    <TooltipProvider>
                        <Tooltip>
                            <div className="text-nowrap w-full">
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


function AccessDir({ items, onChange, listView }: any) {
    const fileExtensionToComponent: any = {
        '.png': DisplayImage,
        '.jpg': DisplayImage,
        '.jpeg': DisplayImage,
        '.gif': DisplayImage,
        '.avif': DisplayImage,
        '.webp': DisplayImage,

        '.mp4': DisplayVideo,
        '.mkv': DisplayVideo,

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

            return (
                <RenderIfVisible key={dir.etag} stayRendered={true}>
                    <Component key={dir.etag} dir={dir} onChange={onChange} fetchQueue={fetchQueue} listView={listView} />
                </RenderIfVisible>
            )
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
                        <BreadcrumbPage>
                            <HomeIcon className="h-4 w-4" />
                        </BreadcrumbPage>
                    </BreadcrumbItem>

                </BreadcrumbList>
            </Breadcrumb>
        )
    } else if (pathnames.length === 1) {
        return (
            <Breadcrumb>
                <BreadcrumbList>

                    <BreadcrumbItem>
                        <BreadcrumbPage style={{ cursor: 'pointer' }} onClick={() => onChange("")}>
                            <HomeIcon className="h-4 w-4" />
                        </BreadcrumbPage>
                    </BreadcrumbItem>

                    <BreadcrumbSeparator />

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
                        <BreadcrumbPage style={{ cursor: 'pointer' }} onClick={() => onChange("")}>
                            <HomeIcon className="h-4 w-4" />
                        </BreadcrumbPage>
                    </BreadcrumbItem>

                    <BreadcrumbSeparator />

                    <BreadcrumbItem>
                        <BreadcrumbPage style={{ cursor: 'pointer' }} onClick={() => onChange("/" + secondLastPath)} className="truncate">{secondLastPath}</BreadcrumbPage>
                    </BreadcrumbItem>

                    <BreadcrumbSeparator />

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
                        <BreadcrumbPage style={{ cursor: 'pointer' }} onClick={() => onChange("")}>
                            <HomeIcon className="h-4 w-4" />
                        </BreadcrumbPage>
                    </BreadcrumbItem>

                    <BreadcrumbSeparator />

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

                    <BreadcrumbSeparator />

                    <BreadcrumbItem>
                        <BreadcrumbPage>{lastPath}</BreadcrumbPage>
                    </BreadcrumbItem>

                </BreadcrumbList>
            </Breadcrumb>
        )
    }
}