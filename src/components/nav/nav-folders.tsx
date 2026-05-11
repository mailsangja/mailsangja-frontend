import { Inbox, Send, AlertTriangle, Trash2 } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useMailboxThreads } from "@/queries/emails"
import { useTrashThreads } from "@/queries/trash"
import { MAILBOX_LABELS, PRIMARY_MAILBOX_IDS } from "@/types/email"
import type { PrimaryMailboxId } from "@/types/email"

const folderIcons: Record<PrimaryMailboxId, React.ReactNode> = {
  inbox: <Inbox />,
  sent: <Send />,
  spam: <AlertTriangle />,
  trash: <Trash2 />,
}

interface NavFoldersProps {
  mailbox: PrimaryMailboxId | null
  onMailboxChange: (mailbox: PrimaryMailboxId) => void
}

function formatUnreadCount(count: number) {
  return count > 99 ? "99+" : count.toLocaleString()
}

export function NavFolders({ mailbox, onMailboxChange }: NavFoldersProps) {
  const { data: inboxData } = useMailboxThreads("inbox", { size: 1 })
  const { data: sentData } = useMailboxThreads("sent", { size: 1 })
  const { data: trashData } = useTrashThreads({ size: 1 })

  const unreadCounts: Partial<Record<PrimaryMailboxId, number | undefined>> = {
    inbox: inboxData?.pages[0]?.unreadCount,
    sent: sentData?.pages[0]?.unreadCount,
    trash: trashData?.pages[0]?.unreadCount,
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>메일함</SidebarGroupLabel>
      <SidebarMenu>
        {PRIMARY_MAILBOX_IDS.map((mailboxId) => {
          const unreadCount = unreadCounts[mailboxId] ?? 0

          return (
            <SidebarMenuItem key={mailboxId}>
              <SidebarMenuButton
                tooltip={MAILBOX_LABELS[mailboxId]}
                isActive={mailbox === mailboxId}
                onClick={() => onMailboxChange(mailboxId)}
                className={unreadCount > 0 ? "pr-12" : undefined}
              >
                {folderIcons[mailboxId]}
                <span>{MAILBOX_LABELS[mailboxId]}</span>
              </SidebarMenuButton>
              {unreadCount > 0 ? (
                <SidebarMenuBadge aria-label={`${MAILBOX_LABELS[mailboxId]} 안읽음 ${unreadCount.toLocaleString()}개`}>
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
