import { useMemo, useState } from "react"
import { Bell, BellOff, CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  getPushNotificationPermission,
  getRegisteredFcmToken,
  markFcmTokenRegistered,
  PushNotificationError,
  requestFcmRegistrationToken,
} from "@/lib/fcm"
import { getErrorMessage } from "@/lib/http-error"
import { useRegisterFcmToken } from "@/mutations/user"

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

function getErrorDescription(error: unknown) {
  if (error instanceof PushNotificationError) {
    return error.message
  }

  return getErrorMessage(error, "푸시 알림 등록에 실패했습니다.")
}

export function NotificationSettingsCard() {
  const [permission, setPermission] = useState<NotificationPermissionState>(() => getPermissionState())
  const [registeredToken, setRegisteredToken] = useState<string | null>(() => getRegisteredFcmToken())
  const registerFcmTokenMutation = useRegisterFcmToken()

  const isRegistering = registerFcmTokenMutation.isPending
  const hasRegisteredToken = Boolean(registeredToken)
  const isEnabled = permission === "granted" && hasRegisteredToken
  const statusLabel = getStatusLabel(permission, hasRegisteredToken)
  const statusVariant = getStatusVariant(permission, hasRegisteredToken)

  const description = useMemo(() => {
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
  }, [isEnabled, permission])

  const enableNotifications = async () => {
    try {
      const token = await requestFcmRegistrationToken()
      await registerFcmTokenMutation.mutateAsync({ fcmToken: token })
      markFcmTokenRegistered(token)
      setRegisteredToken(token)
      setPermission(getPermissionState())
      toast.success("푸시 알림이 활성화되었습니다")
    } catch (error) {
      setPermission(getPermissionState())
      toast.error("푸시 알림을 활성화하지 못했습니다", {
        description: getErrorDescription(error),
      })
    }
  }

  const handleSwitchChange = (checked: boolean) => {
    if (checked) {
      void enableNotifications()
      return
    }

    toast.info("브라우저 알림 권한은 사이트 설정에서 변경할 수 있습니다", {
      description: "백엔드에 FCM 토큰 삭제 API가 추가되면 앱 안에서 알림 끄기를 연결할 수 있습니다.",
    })
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
            disabled={isRegistering || permission === "unsupported" || permission === "denied"}
            aria-label="푸시 알림 활성화"
          />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3">
        <Button
          variant={isEnabled ? "outline" : "default"}
          onClick={() => void enableNotifications()}
          disabled={isRegistering || permission === "unsupported" || permission === "denied"}
        >
          {isRegistering ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : isEnabled ? (
            <CheckCircle2 data-icon="inline-start" />
          ) : (
            <Bell data-icon="inline-start" />
          )}
          {isRegistering ? "등록 중..." : isEnabled ? "다시 등록" : "알림 켜기"}
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
