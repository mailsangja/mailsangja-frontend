import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

import { markThreadAsRead } from "@/api/emails"
import { queryClient } from "@/lib/query-client"
import { emailKeys } from "@/queries/emails"

export function useMarkThreadAsRead() {
  return useMutation({
    mutationFn: (threadId: string) => markThreadAsRead(threadId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: emailKeys.all() })
    },
    onError: () => {
      toast.error("읽음 처리에 실패했습니다")
    },
  })
}
