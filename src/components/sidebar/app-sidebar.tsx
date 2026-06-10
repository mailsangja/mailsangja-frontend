import { Link } from "@tanstack/react-router"
import { ChevronDown, Mail, Pencil, Star } from "lucide-react"

import { MailAccountLabel } from "@/components/mail-account-label"
import { PwaUpdateBanner } from "@/components/pwa-update-banner"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarAccountsSection } from "@/components/sidebar/accounts-section"
import { SidebarInboxSection } from "@/components/sidebar/inbox-section"
import { SidebarLabelGroupsSection } from "@/components/sidebar/label-groups-section"
import { SidebarLabelsSection } from "@/components/sidebar/labels-section"
import { SidebarUserMenu } from "@/components/sidebar/user-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { m } from "@/paraglide/messages"
import { useActiveMailAccounts } from "@/queries/mail-accounts"
import { useUser } from "@/queries/user"
import type { PrimaryMailboxId } from "@/types/email"

interface AppSidebarProps {
  mailbox: PrimaryMailboxId | null
  activeAccountId?: string
  activeLabelId?: string
  activeLabelGroupId?: string
  onMailboxChange: (mailbox: PrimaryMailboxId) => void
  onAccountToggle: (accountId: string) => void
  onLabelToggle: (labelId: string) => void
  onLabelGroupToggle: (groupId: string) => void
}

export function AppSidebar({
  mailbox,
  activeAccountId,
  activeLabelId,
  activeLabelGroupId,
  onMailboxChange,
  onAccountToggle,
  onLabelToggle,
  onLabelGroupToggle,
  ...props
}: AppSidebarProps & React.ComponentProps<typeof Sidebar>) {
  const { data: user } = useUser()
  const { data: activeMailAccounts } = useActiveMailAccounts()
  const hasMailAccounts = !!activeMailAccounts && activeMailAccounts.length > 0

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
                <span className="truncate font-semibold">{m.app_name()}</span>
                <span className="truncate text-xs">{m.app_tagline()}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="overflow-hidden">
        <div className="mb-2 flex gap-px px-2">
          <Link to="/compose" className={buttonVariants({ size: "lg", className: "flex-1 rounded-r-none" })}>
            <Pencil className="mr-1" />
            {m.mail_compose()}
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger
              disabled={!hasMailAccounts}
              className={buttonVariants({
                size: "lg",
                className: "cursor-pointer rounded-l-none px-2",
              })}
              aria-label={m.mail_from_account_select()}
            >
              <ChevronDown className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-56">
              {(activeMailAccounts ?? []).map((mailAccount) => (
                <DropdownMenuItem
                  key={mailAccount.id}
                  render={<Link to="/compose" search={{ from: mailAccount.emailAddress }} />}
                >
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    <MailAccountLabel account={mailAccount} />
                    {mailAccount.id === user?.defaultMailAccountId && (
                      <Badge
                        variant="secondary"
                        className="px-1.5"
                        aria-label={m.mail_default_from_account()}
                        title={m.mail_default_from_account()}
                      >
                        <Star stroke="var(--secondary-foreground)" fill="var(--secondary-foreground)" />
                      </Badge>
                    )}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <SidebarInboxSection mailbox={mailbox} onMailboxChange={onMailboxChange} />

        <div className="no-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto group-data-[collapsible=icon]:overflow-hidden">
          <SidebarLabelGroupsSection
            activeLabelGroupId={activeLabelGroupId}
            onLabelGroupToggle={onLabelGroupToggle}
            className="mt-2"
          />
          <SidebarLabelsSection activeLabelId={activeLabelId} onLabelToggle={onLabelToggle} className="mt-2" />
        </div>
      </SidebarContent>

      <SidebarFooter className="shrink-0">
        <div className="-mx-2">
          <SidebarAccountsSection activeAccountId={activeAccountId} onAccountToggle={onAccountToggle} />
        </div>
        <PwaUpdateBanner />
        <SidebarUserMenu />
      </SidebarFooter>
    </Sidebar>
  )
}
