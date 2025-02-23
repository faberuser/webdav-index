import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
} from "@/components/ui/sidebar"

import { FolderIcon } from "@/components/icons"

interface AppSidebarProps {
    setNewPath: any
    title: string
    rootDirItems: any
    ListDirs: any
}

export function AppSidebar({
    setNewPath,
    title,
    rootDirItems,
    ListDirs,
}: AppSidebarProps) {
    return (
        <Sidebar className="dark:border-gray-600">
            <SidebarContent className="ctscroll">
                <SidebarGroup>
                    <SidebarGroupLabel>
                        <div
                            onClick={() => setNewPath("")}
                            className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-50"
                        >
                            <FolderIcon className="h-6 w-6" />
                            <span>{title}</span>
                        </div>
                    </SidebarGroupLabel>
                    <SidebarGroupContent className="mt-2">
                        <SidebarMenu>
                            {rootDirItems &&
                                rootDirItems
                                    .filter(
                                        (dir: any) => dir.type === "directory"
                                    )
                                    .map((dir: any) => (
                                        <ListDirs
                                            key={dir.filename}
                                            dir={dir.basename}
                                            path={"/" + dir.basename}
                                            onChange={(_path: any) =>
                                                setNewPath(_path)
                                            }
                                        />
                                    ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
