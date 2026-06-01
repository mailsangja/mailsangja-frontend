import { Inbox, Send, Star, Trash2 } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { formatNumber } from "@/lib/date"
import { m } from "@/paraglide/messages"
import { useMailboxThreads, useStarredThreads } from "@/queries/emails"
import { useTrashThreads } from "@/queries/trash"
import { getMailboxLabel, PRIMARY_MAILBOX_IDS } from "@/types/email"
import type { PrimaryMailboxId } from "@/types/email"

const folderIcons: Record<PrimaryMailboxId, React.ReactNode> = {
  inbox: <Inbox />,
  sent: <Send />,
  starred: <Star />,
  trash: <Trash2 />,
}

interface SidebarInboxSectionProps {
  mailbox: PrimaryMailboxId | null
  onMailboxChange: (mailbox: PrimaryMailboxId) => void
}

function formatUnreadCount(count: number) {
  return count > 99 ? "99+" : formatNumber(count)
}

export function SidebarInboxSection({ mailbox, onMailboxChange }: SidebarInboxSectionProps) {
  const { data: inboxData } = useMailboxThreads("inbox", { size: 1 })
  const { data: sentData } = useMailboxThreads("sent", { size: 1 })
  const { data: starredData } = useStarredThreads({ size: 1 })
  const { data: trashData } = useTrashThreads({ size: 1 })

  const unreadCounts: Partial<Record<PrimaryMailboxId, number | undefined>> = {
    inbox: inboxData?.pages[0]?.unreadCount,
    sent: sentData?.pages[0]?.unreadCount,
    starred: starredData?.pages[0]?.unreadCount,
    trash: trashData?.pages[0]?.unreadCount,
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{m.sidebar_mailboxes()}</SidebarGroupLabel>
      <SidebarMenu>
        {PRIMARY_MAILBOX_IDS.map((mailboxId) => {
          const unreadCount = unreadCounts[mailboxId] ?? 0
          const mailboxLabel = getMailboxLabel(mailboxId)

          return (
            <SidebarMenuItem key={mailboxId}>
              <SidebarMenuButton
                tooltip={mailboxLabel}
                isActive={mailbox === mailboxId}
                onClick={() => onMailboxChange(mailboxId)}
                className={unreadCount > 0 ? "pr-12" : undefined}
              >
                {folderIcons[mailboxId]}
                <span>{mailboxLabel}</span>
              </SidebarMenuButton>
              {unreadCount > 0 ? (
                <SidebarMenuBadge
                  aria-label={m.mail_unread_count({ mailbox: mailboxLabel, count: formatNumber(unreadCount) })}
                >
                  <div className="h-4 min-w-5 px-1.5 text-[11px]">{formatUnreadCount(unreadCount)}</div>
                </SidebarMenuBadge>
              ) : null}
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
