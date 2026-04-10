import { Link } from "@tanstack/react-router"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { useMailAccounts } from "@/queries/mail-accounts"

export function NavAccounts({ className }: { className?: string }) {
  const { data: accounts } = useMailAccounts()

  if (!accounts?.length) return null

  return (
    <SidebarGroup className={cn("group-data-[collapsible=icon]:hidden", className)}>
      <SidebarGroupLabel
        render={<Link to="/settings/account" />}
        className="transition-colors hover:text-sidebar-foreground"
      >
        계정
      </SidebarGroupLabel>
      <SidebarMenu>
        {accounts.map((account) => (
          <SidebarMenuItem key={account.id}>
            <SidebarMenuButton>
              <span
                className="flex size-4 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: account.color }}
              >
                <span className="text-[10px] font-bold text-white">{account.alias.charAt(0).toUpperCase()}</span>
              </span>
              <span className="truncate text-xs">{account.emailAddress}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
