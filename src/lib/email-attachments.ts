import type { Attachment } from "@/types/email"

export function getVisibleAttachments(attachments: readonly Attachment[]) {
  return attachments.filter((attachment) => attachment.disposition !== "INLINE")
}
