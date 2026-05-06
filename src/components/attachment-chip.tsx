import { FileText, X } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { getAttachmentDownloadUrl } from "@/api/emails"
import { formatFileSize } from "@/lib/file-size"
import { cn } from "@/lib/utils"
import type { Attachment } from "@/types/email"

interface AttachmentChipProps {
  attachment: Attachment
}

interface FileAttachmentChipProps {
  file: File
  onRemove?: () => void
}

function AttachmentChipBody({ filename, size }: { filename: string; size: number }) {
  return (
    <>
      <FileText className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="min-w-0 truncate font-medium">{filename}</span>
      <span className="shrink-0 text-muted-foreground">{formatFileSize(size)}</span>
    </>
  )
}

function RemoveAttachmentButton({ filename, onRemove }: { filename: string; onRemove: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      className="-mr-1 size-5"
      onClick={onRemove}
      aria-label={`${filename} 첨부파일 제거`}
    >
      <X className="size-3" />
    </Button>
  )
}

export function AttachmentChip({ attachment }: AttachmentChipProps) {
  const className = cn(buttonVariants({ variant: "outline", size: "sm" }), "max-w-full gap-2")

  return (
    <a
      href={getAttachmentDownloadUrl(attachment.id)}
      target="_blank"
      rel="noopener noreferrer"
      download={attachment.filename}
      className={className}
      title={`${attachment.filename} 다운로드`}
    >
      <AttachmentChipBody filename={attachment.filename} size={attachment.size} />
    </a>
  )
}

export function FileAttachmentChip({ file, onRemove }: FileAttachmentChipProps) {
  return (
    <Button variant="outline" size="sm" className="gap-2 hover:bg-background active:not-aria-[haspopup]:translate-y-0">
      <AttachmentChipBody filename={file.name} size={file.size} />
      {onRemove ? <RemoveAttachmentButton filename={file.name} onRemove={onRemove} /> : null}
    </Button>
  )
}
