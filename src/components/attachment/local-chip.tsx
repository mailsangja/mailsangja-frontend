import { FileText, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { formatFileSize } from "@/lib/file-size"
import { m } from "@/paraglide/messages"

interface LocalAttachmentChipProps {
  file: File
  onRemove?: () => void
}

function RemoveAttachmentButton({ filename, onRemove }: { filename: string; onRemove: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      className="-mr-1 size-5"
      onClick={onRemove}
      aria-label={m.attachment_remove_aria({ filename })}
    >
      <X className="size-3" />
    </Button>
  )
}

export function LocalAttachmentChip({ file, onRemove }: LocalAttachmentChipProps) {
  return (
    <Button variant="outline" size="sm" className="gap-2 hover:bg-background active:not-aria-[haspopup]:translate-y-0">
      <FileText className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="min-w-0 truncate font-medium">{file.name}</span>
      <span className="shrink-0 text-muted-foreground">{formatFileSize(file.size)}</span>
      {onRemove ? <RemoveAttachmentButton filename={file.name} onRemove={onRemove} /> : null}
    </Button>
  )
}
