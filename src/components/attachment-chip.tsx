import { FileText } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { getAttachmentDownloadUrl } from "@/api/emails"
import { formatFileSize } from "@/lib/file-size"
import { cn } from "@/lib/utils"
import type { Attachment } from "@/types/email"

interface AttachmentChipProps {
  attachment: Attachment
}

export function AttachmentChip({ attachment }: AttachmentChipProps) {
  return (
    <a
      href={getAttachmentDownloadUrl(attachment.id)}
      target="_blank"
      rel="noopener noreferrer"
      download={attachment.filename}
      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
      title={`${attachment.filename} 다운로드`}
    >
      <FileText className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate font-medium">{attachment.filename}</span>
      <span className="shrink-0 text-muted-foreground">{formatFileSize(attachment.size)}</span>
    </a>
  )
}
