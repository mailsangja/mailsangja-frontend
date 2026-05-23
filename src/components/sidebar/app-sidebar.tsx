import { Link } from "@tanstack/react-router"
import { ChevronDown, Mail, Pencil } from "lucide-react"

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
                <span className="truncate font-semibold">메일상자</span>
                <span className="truncate text-xs">AI 메일 통합 인박스</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <div className="mb-2 flex gap-px px-2">
          <Link to="/compose" className={buttonVariants({ size: "lg", className: "flex-1 rounded-r-none" })}>
            <Pencil className="mr-1" />
            메일 작성
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger
              disabled={!hasMailAccounts}
              className={buttonVariants({
                size: "lg",
                className: "cursor-pointer rounded-l-none px-2",
              })}
              aria-label="발신 계정 선택"
            >
              <ChevronDown className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-56">
              {(activeMailAccounts ?? []).map((mailAccount) => (
                <DropdownMenuItem
                  key={mailAccount.id}
                  render={<Link to="/compose" search={{ from: mailAccount.emailAddress }} />}
                >
                  <span className="flex flex-1 items-center gap-2">
                    <span className="truncate">{mailAccount.emailAddress}</span>
                    {mailAccount.id === user?.defaultMailAccountId && <Badge variant="secondary">default</Badge>}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <SidebarInboxSection mailbox={mailbox} onMailboxChange={onMailboxChange} />
        <SidebarLabelGroupsSection
          activeLabelGroupId={activeLabelGroupId}
          onLabelGroupToggle={onLabelGroupToggle}
          className="mt-2"
        />
        <SidebarLabelsSection activeLabelId={activeLabelId} onLabelToggle={onLabelToggle} className="mt-2" />
        <SidebarAccountsSection
          activeAccountId={activeAccountId}
          onAccountToggle={onAccountToggle}
          className="mt-auto"
        />
      </SidebarContent>

      <SidebarFooter>
        <SidebarUserMenu />
      </SidebarFooter>
    </Sidebar>
  )
}
