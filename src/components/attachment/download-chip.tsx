import { FileText } from "lucide-react"

import { getAttachmentDownloadUrl } from "@/api/emails"
import { buttonVariants } from "@/components/ui/button"
import { formatFileSize } from "@/lib/file-size"
import { cn } from "@/lib/utils"
import { m } from "@/paraglide/messages"
import type { Attachment } from "@/types/email"

interface AttachmentDownloadChipProps {
  attachment: Attachment
}

export function AttachmentDownloadChip({ attachment }: AttachmentDownloadChipProps) {
  const className = cn(buttonVariants({ variant: "outline", size: "sm" }), "max-w-full gap-2")

  return (
    <a
      href={getAttachmentDownloadUrl(attachment.id)}
      target="_blank"
      rel="noopener noreferrer"
      download={attachment.filename}
      className={className}
      title={m.attachment_download_title({ filename: attachment.filename })}
    >
      <FileText className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="min-w-0 truncate font-medium">{attachment.filename}</span>
      <span className="shrink-0 text-muted-foreground">{formatFileSize(attachment.size)}</span>
    </a>
  )
}
