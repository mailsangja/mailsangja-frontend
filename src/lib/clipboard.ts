import { toast } from "sonner"

import { getErrorMessage } from "@/lib/http-error"

export function copyTextToClipboard(value: string, successMessage = "복사했습니다") {
  if (!navigator.clipboard?.writeText) {
    toast.error("복사에 실패했습니다", {
      description: "브라우저의 클립보드 권한을 확인해주세요.",
    })
    return
  }

  void navigator.clipboard
    .writeText(value)
    .then(() => {
      toast.success(successMessage)
    })
    .catch((err: unknown) => {
      toast.error("복사에 실패했습니다", {
        description: getErrorMessage(err, "브라우저의 클립보드 권한을 확인해주세요."),
      })
    })
}
