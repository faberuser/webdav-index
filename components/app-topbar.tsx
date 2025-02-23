import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ModeToggle } from "@/components/toggleMode"
import {
    MenuIcon,
    ArrowDownIcon,
    ArrowUpIcon,
    LoadingIcon,
    GitHubIcon,
    ListIcon,
} from "@/components/icons"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import { SidebarTrigger } from "@/components/ui/sidebar"
import UpdateBreadcrumb from "@/components/app-breadcrumb"

interface AppTopbarProps {
    currentPath: string
    setNewPath: any
    searchResults: any
    isLoading: boolean
    inputValue: string
    displayLimit: number
    isListView: boolean
    handleListView: any
    handleInputChange: any
    loadMoreResults: any
    handleSetSort: any
    activeSort: string
    getPathToFile: any
}

export default function AppTopbar({
    currentPath,
    setNewPath,
    searchResults,
    isLoading,
    inputValue,
    displayLimit,
    isListView,
    handleListView,
    handleInputChange,
    loadMoreResults,
    handleSetSort,
    activeSort,
    getPathToFile,
}: AppTopbarProps) {
    return (
        <div className="flex h-14 items-center justify-between border-b dark:border-gray-600 p-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="lg:hidden">
                    <MenuIcon className="h-6 w-6" />
                </Button>

                <div className="border justify-center items-center flex p-2 pt-1 pb-1 rounded-md">
                    <SidebarTrigger className="size-3.5" />
                </div>

                <UpdateBreadcrumb
                    path={currentPath}
                    onChange={(_path: any) => setNewPath(_path)}
                />
            </div>

            <div className="flex items-center gap-4">
                <SearchDialog
                    handleInputChange={handleInputChange}
                    isLoading={isLoading}
                    inputValue={inputValue}
                    searchResults={searchResults}
                    displayLimit={displayLimit}
                    setNewPath={setNewPath}
                    loadMoreResults={loadMoreResults}
                    getPathToFile={getPathToFile}
                />

                <SortMenu
                    handleSetSort={handleSetSort}
                    activeSort={activeSort}
                />

                <Button
                    size="icon"
                    className={
                        isListView
                            ? "bg-gray-200 dark:bg-gray-800"
                            : "hover:bg-gray-200 dark:hover:bg-gray-800"
                    }
                    onClick={() => handleListView(!isListView)}
                >
                    <ListIcon className="h-[1.2rem] w-[1.2rem]" />
                </Button>

                <a
                    target="_blank"
                    rel="noreferrer"
                    href="https://github.com/faberuser/webdav-index"
                >
                    <Button
                        size="icon"
                        className="hover:bg-gray-200 dark:hover:bg-gray-800"
                    >
                        <GitHubIcon className="h-[1.2rem] w-[1.2rem]" />
                        <span className="sr-only">GitHub</span>
                    </Button>
                </a>

                <ModeToggle />
            </div>
        </div>
    )
}

interface SortMenuProps {
    handleSetSort: any
    activeSort: string
}

function SortMenu({ handleSetSort, activeSort }: SortMenuProps) {
    return (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger className="hover:bg-gray-200 dark:hover:bg-gray-800">
                        Sort
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="flex flex-col gap-2 p-2 bg-white dark:bg-black">
                        <Button
                            className={
                                activeSort.startsWith("type")
                                    ? "w-full bg-gray-200 dark:bg-gray-800"
                                    : "w-full hover:bg-gray-200 dark:hover:bg-gray-800"
                            }
                            onClick={() =>
                                handleSetSort(
                                    activeSort === "type"
                                        ? "type reverse"
                                        : "type"
                                )
                            }
                        >
                            Type&nbsp;
                            {(activeSort === "type" && (
                                <ArrowUpIcon className="h-3 w-3" />
                            )) ||
                                (activeSort === "type reverse" && (
                                    <ArrowDownIcon className="h-3 w-3" />
                                ))}
                        </Button>

                        <Button
                            className={
                                activeSort.startsWith("name")
                                    ? "w-full bg-gray-200 dark:bg-gray-800"
                                    : "w-full hover:bg-gray-200 dark:hover:bg-gray-800"
                            }
                            onClick={() =>
                                handleSetSort(
                                    activeSort === "name alpha"
                                        ? "name reverse"
                                        : "name alpha"
                                )
                            }
                        >
                            Name&nbsp;
                            {(activeSort === "name alpha" && (
                                <ArrowUpIcon className="h-3 w-3" />
                            )) ||
                                (activeSort === "name reverse" && (
                                    <ArrowDownIcon className="h-3 w-3" />
                                ))}
                        </Button>

                        <Button
                            className={
                                activeSort.startsWith("date")
                                    ? "w-full bg-gray-200 dark:bg-gray-800"
                                    : "w-full hover:bg-gray-200 dark:hover:bg-gray-800"
                            }
                            onClick={() =>
                                handleSetSort(
                                    activeSort === "date new to old"
                                        ? "date old to new"
                                        : "date new to old"
                                )
                            }
                        >
                            Modified&nbsp;
                            {(activeSort === "date new to old" && (
                                <ArrowDownIcon className="h-3 w-3" />
                            )) ||
                                (activeSort === "date old to new" && (
                                    <ArrowUpIcon className="h-3 w-3" />
                                ))}
                        </Button>
                    </NavigationMenuContent>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    )
}

interface SearchDialogProps {
    handleInputChange: any
    isLoading: boolean
    inputValue: string
    searchResults: any
    displayLimit: number
    setNewPath: any
    loadMoreResults: any
    getPathToFile: any
}

function SearchDialog({
    handleInputChange,
    isLoading,
    inputValue,
    searchResults,
    displayLimit,
    setNewPath,
    loadMoreResults,
    getPathToFile,
}: SearchDialogProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="items-center gap-2 whitespace-nowrap border border-gray-300 dark:border-gray-500 px-4 py-2 h-8 justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64">
                    <span>Search...</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="p-0 bg-white dark:bg-black border border-gray-300 dark:border-gray-500">
                <DialogHeader className="hidden">
                    <DialogTitle>Search Dialog</DialogTitle>
                    <DialogDescription>Search Dialog</DialogDescription>
                </DialogHeader>

                <Command className="rounded-lg border shadow-md md:min-w-[450px]">
                    <Input
                        placeholder="Search..."
                        onInput={handleInputChange}
                    />
                    <CommandList className="ctscroll">
                        {isLoading && (
                            <CommandGroup>
                                <CommandItem className="p-5 justify-center">
                                    <LoadingIcon />
                                </CommandItem>
                            </CommandGroup>
                        )}

                        {inputValue &&
                            searchResults.length === 0 &&
                            !isLoading && (
                                <CommandGroup>
                                    <CommandItem className="p-5 justify-center">
                                        <span>No results found</span>
                                    </CommandItem>
                                </CommandGroup>
                            )}

                        {searchResults.some(
                            (result: any) => result.type === "file"
                        ) && (
                            <CommandGroup heading="Files">
                                {searchResults.slice(0, displayLimit).map(
                                    (result: any) =>
                                        result.type === "file" && (
                                            <CommandItem
                                                key={
                                                    result.etag +
                                                    result.basename
                                                }
                                                className="p-0"
                                            >
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger
                                                            asChild
                                                            className="w-full"
                                                        >
                                                            <Button
                                                                onClick={() =>
                                                                    setNewPath(
                                                                        getPathToFile(
                                                                            result.filename
                                                                        )
                                                                    )
                                                                }
                                                                className="w-full justify-start hover:bg-gray-200 dark:hover:bg-gray-800"
                                                            >
                                                                <span className="truncate">
                                                                    {
                                                                        result.basename
                                                                    }
                                                                </span>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-white dark:bg-black border border-gray-300 dark:border-gray-500">
                                                            <p>
                                                                {
                                                                    result.basename
                                                                }
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </CommandItem>
                                        )
                                )}
                            </CommandGroup>
                        )}

                        <CommandSeparator />

                        {searchResults.some(
                            (result: any) => result.type === "directory"
                        ) && (
                            <CommandGroup heading="Directories">
                                {searchResults.slice(0, displayLimit).map(
                                    (result: any) =>
                                        result.type === "directory" && (
                                            <CommandItem
                                                key={
                                                    result.etag +
                                                    result.basename
                                                }
                                                className="p-0"
                                            >
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger
                                                            asChild
                                                            className="w-full"
                                                        >
                                                            <Button
                                                                onClick={() =>
                                                                    setNewPath(
                                                                        result.filename
                                                                    )
                                                                }
                                                                className="w-full justify-start hover:bg-gray-200 dark:hover:bg-gray-800"
                                                            >
                                                                <span className="truncate">
                                                                    {
                                                                        result.basename
                                                                    }
                                                                </span>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-white dark:bg-black border border-gray-300 dark:border-gray-500">
                                                            <p>
                                                                {
                                                                    result.basename
                                                                }
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </CommandItem>
                                        )
                                )}
                            </CommandGroup>
                        )}

                        <CommandSeparator />

                        {searchResults.length > displayLimit && (
                            <CommandGroup>
                                <CommandItem className="p-0">
                                    <Button
                                        className="w-full justify-center hover:bg-gray-200 dark:hover:bg-gray-800"
                                        onClick={loadMoreResults}
                                    >
                                        Load More
                                    </Button>
                                </CommandItem>
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </DialogContent>
        </Dialog>
    )
}
