import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { MailAccountLabel } from "@/components/mail-account-label"
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
            <Tooltip>
              <TooltipTrigger
                render={
                  <SidebarMenuButton
                    type="button"
                    isActive={activeAccountId === account.id}
                    onClick={() => onAccountToggle(account.id)}
                  />
                }
              >
                <MailAccountLabel account={account} />
              </TooltipTrigger>
              <TooltipContent align="center">{account.emailAddress}</TooltipContent>
            </Tooltip>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
