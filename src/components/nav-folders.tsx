import { Inbox, Send, FileText, AlertTriangle, Trash2 } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { MAILBOX_LABELS, PRIMARY_MAILBOX_IDS } from "@/types/email"
import type { PrimaryMailboxId } from "@/types/email"

const folderIcons: Record<PrimaryMailboxId, React.ReactNode> = {
  INBOX: <Inbox />,
  SENT: <Send />,
  DRAFT: <FileText />,
  SPAM: <AlertTriangle />,
  TRASH: <Trash2 />,
}

interface NavFoldersProps {
  activeMailbox: PrimaryMailboxId
  onMailboxChange: (mailbox: PrimaryMailboxId) => void
}

export function NavFolders({ activeMailbox, onMailboxChange }: NavFoldersProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>메일함</SidebarGroupLabel>
      <SidebarMenu>
        {PRIMARY_MAILBOX_IDS.map((mailboxId) => (
          <SidebarMenuItem key={mailboxId}>
            <SidebarMenuButton
              tooltip={MAILBOX_LABELS[mailboxId]}
              isActive={activeMailbox === mailboxId}
              onClick={() => onMailboxChange(mailboxId)}
            >
              {folderIcons[mailboxId]}
              <span>{MAILBOX_LABELS[mailboxId]}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
