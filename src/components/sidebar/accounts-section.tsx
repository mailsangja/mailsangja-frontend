import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { MailAccountIcon } from "@/components/mail-account-icon"
import { cn } from "@/lib/utils"
import { useMailAccounts } from "@/queries/mail-accounts"

interface SidebarAccountsSectionProps {
  activeAccountId?: string
  onAccountToggle: (accountId: string) => void
  className?: string
}

export function SidebarAccountsSection({ activeAccountId, onAccountToggle, className }: SidebarAccountsSectionProps) {
  const { data: accounts } = useMailAccounts()

  if (!accounts?.length) return null

  return (
    <SidebarGroup className={cn("group-data-[collapsible=icon]:hidden", className)}>
      <SidebarGroupLabel>계정</SidebarGroupLabel>
      <SidebarMenu>
        {accounts.map((account) => (
          <SidebarMenuItem key={account.id}>
            <SidebarMenuButton
              type="button"
              tooltip={account.emailAddress}
              isActive={activeAccountId === account.id}
              onClick={() => onAccountToggle(account.id)}
            >
              <MailAccountIcon icon={account.icon} color={account.color} />
              <span className="truncate text-xs">{account.emailAddress}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
