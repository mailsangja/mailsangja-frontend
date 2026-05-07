import { Link } from "@tanstack/react-router"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { AccountIcon } from "@/lib/icon-entries"
import { cn } from "@/lib/utils"
import { useMailAccounts } from "@/queries/mail-accounts"

interface NavAccountsProps {
  activeAccountId?: string
  onAccountToggle: (accountId: string) => void
  className?: string
}

export function NavAccounts({ activeAccountId, onAccountToggle, className }: NavAccountsProps) {
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
            <SidebarMenuButton
              type="button"
              tooltip={account.emailAddress}
              isActive={activeAccountId === account.id}
              onClick={() => onAccountToggle(account.id)}
            >
              <span
                className="flex size-5 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: account.color || "#6B7280" }}
              >
                <AccountIcon name={account.icon} className="size-3 text-white" />
              </span>
              <span className="truncate text-xs">{account.emailAddress}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
