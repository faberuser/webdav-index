"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/toggleMode"
import { DownloadIcon, FolderIcon, MenuIcon, ArrowDownIcon, ArrowRightIcon, LoadingIcon, FileIcon } from "@/components/icons"
import { useState, useEffect } from "react"

import { ChevronDown, Slash } from "lucide-react"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
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

const cache: any = {}

export default function Client() {
    const [rootDirItems, setRootDirItems] = useState([])
    const [dirItems, setDirItems] = useState([])
    const [currentPath, setCurrentPath] = useState("")

    const fetchContents = async () => {
        const response = await fetch(`/api/listContents?dir=${encodeURIComponent(currentPath)}`)
        const json = await response.json()
        cache[currentPath] = json
        setDirItems(json)
        if (rootDirItems.length === 0) {
            setRootDirItems(json)
        }
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
            <div className="hidden h-full w-64 shrink-0 border-r bg-gray-100 dark:border-gray-800 dark:bg-gray-900 lg:block">
                <div className="flex h-full flex-col gap-4 p-4">
                    <Link href="#" className="flex items-center gap-2 font-semibold" prefetch={false}>
                        <FolderIcon className="h-6 w-6" />
                        <span>WebDav Index</span>
                    </Link>
                    <nav className="flex-1 space-y-2 overflow-auto">

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
                <div className="flex h-14 items-center justify-between border-b bg-gray-100 px-6 dark:border-gray-800 dark:bg-gray-900">
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
                        <Button variant="outline" size="sm">
                            <DownloadIcon className="h-4 w-4 mr-2" />
                            Download
                        </Button>
                        <ModeToggle />
                    </div>
                </div>
                <div className="flex-1 overflow-auto p-4 md:p-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">

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
            <div style={{ cursor: 'pointer' }} onClick={handleExpand} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800">
                {!isLoading && subDirs.length > 0 && (isExpanded ? <ArrowDownIcon className="h-4 w-4" /> : <ArrowRightIcon className="h-4 w-4" />)}
                {/* {lastPath === dir ? <span className="font-semibold text-blue-500">{dir}</span> : dir} */}
                {dir}
                {isLoading && <LoadingIcon className="h-4 w-4 ml-2" />}
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
            <div key={index} onClick={() => onChange(dir.filename)} className="group relative rounded-md border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-gray-300 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700">
                <Link href="#" className="absolute inset-0 z-10" prefetch={false}>
                    {dir.type === 'directory' ?
                        <span className="sr-only">Open {dir.basename}</span>
                        :
                        <span className="sr-only">Download {dir.basename}</span>
                    }
                </Link>
                <div className="flex h-20 w-full items-center justify-center">
                    {dir.type === 'directory' ?
                        <FolderIcon className="h-12 w-12 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300" />
                        :
                        <FileIcon className="h-12 w-12 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300" />
                    }
                </div>
                <div className="mt-4 text-center">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">{dir.basename}</h3>
                    {dir.type === 'directory' ?
                        // <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{dir.items} items</p>
                        <p></p>
                        :
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{dir.size} MB</p>
                    }
                </div>
            </div >
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
            <Breadcrumb>
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
                            <DropdownMenuContent className="bg-white dark:bg-gray-800">

                                {middlePaths.map((value: string, index: number) => {
                                    const valueLocation = [...pathnames.slice(0, index), value].join('/')
                                    return (
                                        <DropdownMenuItem key={index}>
                                            <BreadcrumbPage style={{ cursor: 'pointer' }} onClick={() => onChange("/" + valueLocation)}>{value}</BreadcrumbPage>
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