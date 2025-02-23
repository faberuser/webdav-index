"use client"

import { useState, useEffect, useCallback } from "react"
import RenderIfVisible from "@/components/RenderIfVisible"
import {
    ArrowDownIcon,
    ArrowRightIcon,
    LoadingIcon,
    LoadingIconLarge,
} from "@/components/icons"
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
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import AppTopbar from "@/components/app-topbar"

const cache: any = {}
let fetchQueue: any = []
const INITIAL_DISPLAY_LIMIT = 50

export default function Client({ title }: any) {
    const [isLoading, setIsLoading] = useState(false)
    const [currentPath, setCurrentPath] = useState("")
    const [rootDirItems, setRootDirItems] = useState([])
    const [dirItems, setDirItems] = useState([])
    const [searchResults, setSearchResults] = useState([])
    const [hasMD, setHasMD] = useState("")
    const [isListView, setIsListView] = useState(false)
    const [activeSort, setSort] = useState("type")
    const [displayLimit, setDisplayLimit] = useState(INITIAL_DISPLAY_LIMIT)
    const [inputValue, setInputValue] = useState("")

    async function fetchRootContents() {
        const response = await fetch(`/api/listContents?dir=`)
        const json = await response.json()
        setRootDirItems(json)
    }

    useEffect(() => {
        const fetchContents = async () => {
            if (rootDirItems.length === 0) {
                await fetchRootContents()
            }
            setHasMD("")
            setIsLoading(true)
            const response = await fetch(
                `/api/listContents?dir=${encodeURIComponent(currentPath)}`
            )
            const json = await response.json()
            cache[currentPath] = json
            sortDir(activeSort, json)
            const mdFile = json.find((item: any) =>
                item.basename.toLowerCase().endsWith(".md")
            )
            if (mdFile) {
                setHasMD(mdFile.filename)
            }
            setIsLoading(false)
        }

        if (cache[currentPath]) {
            setHasMD("")
            sortDir(activeSort, cache[currentPath])
            const mdFile = cache[currentPath].find((item: any) =>
                item.basename.toLowerCase().endsWith(".md")
            )
            if (mdFile) {
                setHasMD(mdFile.filename)
            }
        } else {
            fetchContents()
        }
    }, [currentPath, activeSort, rootDirItems.length])

    useEffect(() => {
        const savedState = localStorage.getItem("isListView")
        setIsListView(savedState !== null ? JSON.parse(savedState) : false)

        const savedSort = localStorage.getItem("sort")
        setSort(savedSort !== null ? savedSort : "type")

        const handlePopState = (event?: PopStateEvent) => {
            setCurrentPath(
                window.location.pathname === "/"
                    ? ""
                    : decodeURIComponent(window.location.pathname)
            )
        }
        handlePopState()
        window.addEventListener("popstate", handlePopState)
        return () => {
            window.removeEventListener("popstate", handlePopState)
        }
    }, [])

    function handleListView(value: any) {
        setIsListView(value)
        localStorage.setItem("isListView", JSON.stringify(value))
    }

    function sortDir(sort: any, items: any) {
        if (sort === "type") {
            setDirItems(
                items.sort((a: any, b: any) => a.type.localeCompare(b.type))
            )
        } else if (sort === "type reverse") {
            setDirItems(
                items.sort((a: any, b: any) => b.type.localeCompare(a.type))
            )
        } else if (sort === "name alpha") {
            setDirItems(
                items.sort((a: any, b: any) =>
                    a.basename.localeCompare(b.basename)
                )
            )
        } else if (sort === "name reverse") {
            setDirItems(
                items.sort((a: any, b: any) =>
                    b.basename.localeCompare(a.basename)
                )
            )
        } else if (sort === "date new to old") {
            setDirItems(
                items.sort(
                    (a: any, b: any) =>
                        new Date(b.lastmod).getTime() -
                        new Date(a.lastmod).getTime()
                )
            )
        } else if (sort === "date old to new") {
            setDirItems(
                items.sort(
                    (a: any, b: any) =>
                        new Date(a.lastmod).getTime() -
                        new Date(b.lastmod).getTime()
                )
            )
        }
    }

    function handleSetSort(value: any) {
        setSort(value)
        localStorage.setItem("sort", value)
        sortDir(value, dirItems)
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

    function debounce(func: any, delay: any) {
        let timeoutId: any
        return function (this: any, ...args: any) {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(() => {
                func.apply(this, args)
            }, delay)
        }
    }

    const performSearch = async (query: any) => {
        console.log(query)
        if (query === "") {
            setSearchResults([])
            return
        }
        setIsLoading(true)
        const response = await fetch(
            `/api/search?query=${encodeURIComponent(query)}`
        )
        const json = await response.json()
        setSearchResults(json)
        setIsLoading(false)
    }

    const debouncedSearch = useCallback(
        debounce((query: string) => performSearch(query), 500),
        []
    )

    const handleInputChange = (event: any) => {
        setInputValue(event.target.value)
        debouncedSearch(event.target.value)
    }

    function getPathToFile(filePath: string): string {
        const lastSlashIndex = filePath.lastIndexOf("/")
        if (lastSlashIndex !== -1) {
            return filePath.substring(0, lastSlashIndex)
        }
        return filePath
    }

    const loadMoreResults = () => {
        setDisplayLimit(displayLimit + INITIAL_DISPLAY_LIMIT)
    }

    return (
        <div className="flex h-screen w-full">
            <SidebarProvider>
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 dark:bg-white dark:bg-opacity-10 z-50">
                        <LoadingIconLarge />
                    </div>
                )}

                <AppSidebar
                    setNewPath={setNewPath}
                    title={title}
                    rootDirItems={rootDirItems}
                    ListDirs={ListDirs}
                />

                <div className="flex flex-col h-screen w-full">
                    <AppTopbar
                        currentPath={currentPath}
                        setNewPath={setNewPath}
                        searchResults={searchResults}
                        isLoading={isLoading}
                        inputValue={inputValue}
                        displayLimit={displayLimit}
                        isListView={isListView}
                        handleListView={handleListView}
                        handleInputChange={handleInputChange}
                        loadMoreResults={loadMoreResults}
                        handleSetSort={handleSetSort}
                        activeSort={activeSort}
                        getPathToFile={getPathToFile}
                    />

                    {hasMD ? (
                        <div className="flex h-full overflow-hidden">
                            {isListView ? (
                                <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 overflow-auto ctscroll">
                                    <div className="grid gap-2">
                                        <AccessDir
                                            items={dirItems}
                                            onChange={(_path: any) =>
                                                setNewPath(_path)
                                            }
                                            listView={isListView}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 overflow-auto p-4 md:p-6 ctscroll">
                                    <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-7 auto-rows-min">
                                        <AccessDir
                                            items={dirItems}
                                            onChange={(_path: any) =>
                                                setNewPath(_path)
                                            }
                                            listView={isListView}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="hidden md:block w-80 border-l dark:border-gray-600 text-gray-700 dark:text-gray-300 p-4 overflow-auto ctscroll allow-select">
                                <h2 className="text-lg font-semibold">
                                    {hasMD
                                        .split("/")
                                        .filter((x: string) => x)
                                        .pop()}
                                </h2>
                                <div className="text-sm whitespace-pre-wrap break-words text-pretty">
                                    <DisplayText
                                        filename={hasMD}
                                        fetchQueue={fetchQueue}
                                        key={currentPath}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : isListView ? (
                        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 overflow-auto ctscroll">
                            <div className="grid gap-2">
                                <AccessDir
                                    items={dirItems}
                                    onChange={(_path: any) => setNewPath(_path)}
                                    listView={isListView}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-auto p-4 md:p-6">
                            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-9 auto-rows-min">
                                <AccessDir
                                    items={dirItems}
                                    onChange={(_path: any) => setNewPath(_path)}
                                    listView={isListView}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </SidebarProvider>
        </div>
    )
}

function ListDirs({ dir, path, onChange }: any) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [subDirs, setSubDirs] = useState([])

    useEffect(() => {
        const fetchContents = async () => {
            setIsLoading(true)
            const response = await fetch(
                `/api/listContents?dir=${encodeURIComponent(path)}`
            )
            const json = await response.json()
            cache[path] = json
            setSubDirs(json.filter((_dir: any) => _dir.type === "directory"))
            setIsLoading(false)
        }

        if (cache[path]) {
            setSubDirs(
                cache[path].filter((_dir: any) => _dir.type === "directory")
            )
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
            <SidebarMenuItem key={path}>
                <SidebarMenuButton asChild>
                    <div className="text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 px-3 py-2 gap-2">
                        <div
                            onClick={handleExpand}
                            className="hover:text-gray-400 dark:hover:text-gray-600"
                        >
                            {isLoading && <LoadingIcon />}
                            {!isLoading &&
                                subDirs.length > 0 &&
                                (isExpanded ? (
                                    <ArrowDownIcon />
                                ) : (
                                    <ArrowRightIcon />
                                ))}
                        </div>
                        <div
                            style={{ cursor: "pointer" }}
                            onClick={() => onChange(path)}
                            className="w-full h-full flex items-center"
                        >
                            <TooltipProvider>
                                <Tooltip>
                                    <div className="text-nowrap w-full">
                                        <TooltipTrigger>{dir}</TooltipTrigger>
                                    </div>
                                    <TooltipContent className="bg-white dark:bg-black">
                                        {dir}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
            {isExpanded &&
                subDirs.map((subDir: any) => (
                    <div key={subDir.filename} style={{ marginLeft: "10px" }}>
                        <ListDirs
                            dir={subDir.basename}
                            path={`${path}/${subDir.basename}`}
                            isLoading={isLoading}
                            onChange={onChange}
                        />
                    </div>
                ))}
        </div>
    )
}

function getFileExtension(filename: string) {
    const dotIndex = filename.lastIndexOf(".")
    if (dotIndex === -1) return ""
    return filename.slice(dotIndex)
}

function AccessDir({ items, onChange, listView }: any) {
    const fileExtensionToComponent: any = {
        ".png": DisplayImage,
        ".jpg": DisplayImage,
        ".jpeg": DisplayImage,
        ".gif": DisplayImage,
        ".avif": DisplayImage,
        ".webp": DisplayImage,

        ".mp4": DisplayVideo,
        ".mkv": DisplayVideo,

        ".md": DisplayTextFile,
        ".txt": DisplayTextFile,
        ".json": DisplayTextFile,
        ".ini": DisplayTextFile,
        ".log": DisplayTextFile,
    }

    return items.map((dir: any) => {
        const Component =
            dir.type === "directory"
                ? DisplayDir
                : fileExtensionToComponent[
                      getFileExtension(dir.basename.toLowerCase())
                  ] || DisplayFile

        return (
            <RenderIfVisible key={dir.filename} stayRendered={true}>
                <Component
                    key={dir.filename}
                    dir={dir}
                    onChange={onChange}
                    fetchQueue={fetchQueue}
                    listView={listView}
                />
            </RenderIfVisible>
        )
    })
}
