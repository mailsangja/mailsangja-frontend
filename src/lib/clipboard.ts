import { toast } from "sonner"

import { getErrorMessage } from "@/lib/http-error"
import { m } from "@/paraglide/messages"

export function copyTextToClipboard(value: string, successMessage = m.clipboard_copy_success()) {
  if (!navigator.clipboard?.writeText) {
    toast.error(m.clipboard_copy_error(), {
      description: m.clipboard_permission_error(),
    })
    return
  }

  void navigator.clipboard
    .writeText(value)
    .then(() => {
      toast.success(successMessage)
    })
    .catch((err: unknown) => {
      toast.error(m.clipboard_copy_error(), {
        description: getErrorMessage(err, m.clipboard_permission_error()),
      })
    })
}
