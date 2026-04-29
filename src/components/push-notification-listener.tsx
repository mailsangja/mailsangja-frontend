import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { emailKeys } from "@/queries/emails"
import { useRegisterFcmToken } from "@/mutations/user"
import { useUser } from "@/queries/user"
import { FCM_TOKEN_CHANGED_EVENT, listenToForegroundFcmMessages, syncFcmToken } from "@/lib/fcm"
import { toNewMailPushData } from "@/types/fcm"

function openNotificationUrl(url: string) {
  const target = new URL(url, window.location.origin)

  if (target.origin !== window.location.origin) {
    window.open(target.href, "_blank", "noopener,noreferrer")
    return
  }

  window.location.assign(`${target.pathname}${target.search}${target.hash}`)
}

export function PushNotificationListener() {
  const queryClient = useQueryClient()
  const { data: user } = useUser()
  const { mutateAsync: registerFcmToken } = useRegisterFcmToken()
  const syncingUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!user || syncingUserIdRef.current === user.id) {
      return
    }

    syncingUserIdRef.current = user.id

    void syncFcmToken(user.id, (fcmToken) => registerFcmToken({ fcmToken })).catch(() => {
      syncingUserIdRef.current = null
    })
  }, [registerFcmToken, user])

  useEffect(() => {
    let unsubscribe = () => {}
    let isMounted = true

    const subscribe = () => {
      unsubscribe()

      void listenToForegroundFcmMessages((payload) => {
        const { title, body, threadDetailUrl } = toNewMailPushData(payload.data)

        void queryClient.invalidateQueries({ queryKey: emailKeys.all() })
        toast(title, {
          description: body,
          action: threadDetailUrl
            ? {
                label: "열기",
                onClick: () => openNotificationUrl(threadDetailUrl),
              }
            : undefined,
        })
      }).then((nextUnsubscribe) => {
        if (!isMounted) {
          nextUnsubscribe()
          return
        }

        unsubscribe = nextUnsubscribe
      })
    }

    subscribe()
    window.addEventListener(FCM_TOKEN_CHANGED_EVENT, subscribe)

    return () => {
      isMounted = false
      window.removeEventListener(FCM_TOKEN_CHANGED_EVENT, subscribe)
      unsubscribe()
    }
  }, [queryClient])

  return null
}
