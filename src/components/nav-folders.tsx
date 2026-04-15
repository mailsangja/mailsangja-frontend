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
  inbox: <Inbox />,
  sent: <Send />,
  draft: <FileText />,
  spam: <AlertTriangle />,
  trash: <Trash2 />,
}

interface NavFoldersProps {
  mailbox: PrimaryMailboxId | null
  onMailboxChange: (mailbox: PrimaryMailboxId) => void
}

export function NavFolders({ mailbox, onMailboxChange }: NavFoldersProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>메일함</SidebarGroupLabel>
      <SidebarMenu>
        {PRIMARY_MAILBOX_IDS.map((mailboxId) => (
          <SidebarMenuItem key={mailboxId}>
            <SidebarMenuButton
              tooltip={MAILBOX_LABELS[mailboxId]}
              isActive={mailbox === mailboxId}
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
