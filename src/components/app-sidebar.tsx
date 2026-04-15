import { Link } from "@tanstack/react-router"
import { Mail } from "lucide-react"

import { NavAccounts } from "@/components/nav-accounts"
import { NavFolders } from "@/components/nav-folders"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { PrimaryMailboxId } from "@/types/email"

interface AppSidebarProps {
  mailbox: PrimaryMailboxId | null
  activeAccountId?: string
  onMailboxChange: (mailbox: PrimaryMailboxId) => void
  onAccountToggle: (accountId: string) => void
}

export function AppSidebar({
  mailbox,
  activeAccountId,
  onMailboxChange,
  onAccountToggle,
  ...props
}: AppSidebarProps & React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="md:hidden">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/mail/$mailbox" params={{ mailbox: "inbox" }} />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Mail className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">메일상자</span>
                <span className="truncate text-xs">AI 메일 통합 인박스</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavFolders mailbox={mailbox} onMailboxChange={onMailboxChange} />
        <NavAccounts activeAccountId={activeAccountId} onAccountToggle={onAccountToggle} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
