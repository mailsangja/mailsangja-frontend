import { useState, useSyncExternalStore } from "react"
import { Bell, BellOff, CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  disableFcm,
  enableFcm,
  getPushNotificationPermission,
  getStoredFcmToken,
  PushNotificationError,
  subscribeToFcmToken,
} from "@/lib/fcm"
import { getErrorMessage } from "@/lib/http-error"
import { useRegisterFcmToken, useUnregisterFcmToken } from "@/mutations/user"
import { useUser } from "@/queries/user"

type NotificationPermissionState = NotificationPermission | "unsupported"

function getPermissionState(): NotificationPermissionState {
  return getPushNotificationPermission()
}

function getStatusLabel(permission: NotificationPermissionState, hasRegisteredToken: boolean) {
  if (permission === "unsupported") {
    return "지원 안 함"
  }

  if (permission === "denied") {
    return "차단됨"
  }

  if (permission === "granted") {
    return hasRegisteredToken ? "등록됨" : "등록 필요"
  }

  return "대기 중"
}

function getStatusVariant(permission: NotificationPermissionState, hasRegisteredToken: boolean) {
  if (permission === "granted" && hasRegisteredToken) {
    return "secondary" as const
  }

  if (permission === "denied" || permission === "unsupported") {
    return "destructive" as const
  }

  return "outline" as const
}

function getErrorDescription(error: unknown, fallbackMessage: string) {
  if (error instanceof PushNotificationError) {
    return error.message
  }

  return getErrorMessage(error, fallbackMessage)
}

function getDescription(permission: NotificationPermissionState, isEnabled: boolean) {
  if (permission === "unsupported") {
    return "현재 브라우저 또는 Firebase 설정에서는 웹 푸시 알림을 사용할 수 없습니다."
  }

  if (permission === "denied") {
    return "브라우저에서 알림 권한이 차단되어 있습니다. 브라우저 사이트 설정에서 권한을 변경해야 합니다."
  }

  if (isEnabled) {
    return "새 메일 알림을 받을 수 있도록 이 브라우저의 FCM 디바이스 토큰이 등록되어 있습니다."
  }

  return "이 브라우저에서 새 메일 알림을 받으려면 알림 권한을 허용하고 디바이스 토큰을 등록해야 합니다."
}

export function NotificationSettingsCard() {
  const { data: user } = useUser()
  const [permission, setPermission] = useState<NotificationPermissionState>(() => getPermissionState())
  const registeredToken = useSyncExternalStore(
    subscribeToFcmToken,
    () => (user ? getStoredFcmToken(user.id) : null),
    () => null
  )
  const registerFcmTokenMutation = useRegisterFcmToken()
  const unregisterFcmTokenMutation = useUnregisterFcmToken()

  const isMutating = registerFcmTokenMutation.isPending || unregisterFcmTokenMutation.isPending
  const hasRegisteredToken = Boolean(registeredToken)
  const isEnabled = permission === "granted" && hasRegisteredToken
  const statusLabel = getStatusLabel(permission, hasRegisteredToken)
  const statusVariant = getStatusVariant(permission, hasRegisteredToken)
  const description = getDescription(permission, isEnabled)

  const enableNotifications = async () => {
    if (!user) {
      return
    }

    try {
      await enableFcm(user.id, (fcmToken) => registerFcmTokenMutation.mutateAsync({ fcmToken }))
      setPermission(getPermissionState())
      toast.success("푸시 알림이 활성화되었습니다")
    } catch (error) {
      setPermission(getPermissionState())
      toast.error("푸시 알림을 활성화하지 못했습니다", {
        description: getErrorDescription(error, "푸시 알림 등록에 실패했습니다."),
      })
    }
  }

  const disableNotifications = async () => {
    if (!user) {
      return
    }

    try {
      await disableFcm(user.id, (fcmToken) => unregisterFcmTokenMutation.mutateAsync({ fcmToken }))
      setPermission(getPermissionState())
      toast.success("푸시 알림이 비활성화되었습니다")
    } catch (error) {
      setPermission(getPermissionState())
      toast.warning("푸시 알림이 비활성화되었습니다", {
        description: getErrorDescription(error, "서버의 FCM 토큰 삭제 요청이 실패했습니다."),
      })
    }
  }

  const handleSwitchChange = (checked: boolean) => {
    if (checked) {
      void enableNotifications()
      return
    }

    void disableNotifications()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>푸시 알림</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction className="flex items-center gap-3">
          <Badge variant={statusVariant}>{statusLabel}</Badge>
          <Switch
            checked={isEnabled}
            onCheckedChange={handleSwitchChange}
            disabled={isMutating || !user || permission === "unsupported" || permission === "denied"}
            aria-label="푸시 알림 활성화"
          />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3">
        <Button
          variant={isEnabled ? "outline" : "default"}
          onClick={() => void enableNotifications()}
          disabled={isMutating || !user || permission === "unsupported" || permission === "denied"}
        >
          {isMutating ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : isEnabled ? (
            <CheckCircle2 data-icon="inline-start" />
          ) : (
            <Bell data-icon="inline-start" />
          )}
          {isMutating ? "처리 중..." : isEnabled ? "다시 등록" : "알림 켜기"}
        </Button>
        {permission === "denied" ? (
          <Button variant="outline" disabled>
            <BellOff data-icon="inline-start" />
            브라우저에서 차단됨
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}
