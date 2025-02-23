import { ArrowDownIcon, HomeIcon } from "@/components/icons"
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

export default function UpdateBreadcrumb({ path = "", onChange }: any) {
    const pathnames = path.split("/").filter((x: string) => x)
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
                        <BreadcrumbPage
                            style={{ cursor: "pointer" }}
                            onClick={() => onChange("")}
                        >
                            <HomeIcon className="h-4 w-4" />
                        </BreadcrumbPage>
                    </BreadcrumbItem>

                    <BreadcrumbSeparator />

                    <BreadcrumbItem>
                        <BreadcrumbPage>{lastPath}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        )
    } else if (pathnames.length === 2) {
        return (
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbPage
                            style={{ cursor: "pointer" }}
                            onClick={() => onChange("")}
                        >
                            <HomeIcon className="h-4 w-4" />
                        </BreadcrumbPage>
                    </BreadcrumbItem>

                    <BreadcrumbSeparator />

                    <BreadcrumbItem>
                        <BreadcrumbPage
                            style={{ cursor: "pointer" }}
                            onClick={() => onChange("/" + secondLastPath)}
                            className="truncate"
                        >
                            {secondLastPath}
                        </BreadcrumbPage>
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
                        <BreadcrumbPage
                            style={{ cursor: "pointer" }}
                            onClick={() => onChange("")}
                        >
                            <HomeIcon className="h-4 w-4" />
                        </BreadcrumbPage>
                    </BreadcrumbItem>

                    <BreadcrumbSeparator />

                    <BreadcrumbItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-1 truncate">
                                {secondLastPath}
                                <ArrowDownIcon className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-white dark:bg-black dark:border-gray-700">
                                {middlePaths.map(
                                    (value: string, index: number) => {
                                        const valueLocation = [
                                            ...pathnames.slice(0, index),
                                            value,
                                        ].join("/")
                                        return (
                                            <DropdownMenuItem
                                                style={{ cursor: "pointer" }}
                                                key={index}
                                                onClick={() =>
                                                    onChange(
                                                        "/" + valueLocation
                                                    )
                                                }
                                                className="hover:bg-gray-200 dark:hover:bg-gray-800"
                                            >
                                                <BreadcrumbPage>
                                                    {value}
                                                </BreadcrumbPage>
                                            </DropdownMenuItem>
                                        )
                                    }
                                )}
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
