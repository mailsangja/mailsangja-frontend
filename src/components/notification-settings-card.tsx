import { useState, useSyncExternalStore } from "react"
import { Bell, BellOff, CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { m } from "@/paraglide/messages"
import { useUser } from "@/queries/user"

type NotificationPermissionState = NotificationPermission | "unsupported"

function getPermissionState(): NotificationPermissionState {
  return getPushNotificationPermission()
}

function getStatusLabel(permission: NotificationPermissionState, hasRegisteredToken: boolean) {
  if (permission === "unsupported") {
    return m.notification_status_unsupported()
  }

  if (permission === "denied") {
    return m.notification_status_denied()
  }

  if (permission === "granted") {
    return hasRegisteredToken ? m.notification_status_registered() : m.notification_status_required()
  }

  return m.notification_status_pending()
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
    return m.notification_description_unsupported()
  }

  if (permission === "denied") {
    return m.notification_description_denied()
  }

  if (isEnabled) {
    return m.notification_description_enabled()
  }

  return m.notification_description_disabled()
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
      toast.success(m.notification_enable_success())
    } catch (error) {
      setPermission(getPermissionState())
      toast.error(m.notification_enable_error(), {
        description: getErrorDescription(error, m.notification_register_error()),
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
      toast.success(m.notification_disable_success())
    } catch (error) {
      setPermission(getPermissionState())
      toast.warning(m.notification_disable_success(), {
        description: getErrorDescription(error, m.notification_unregister_error()),
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
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>{m.notification_push_title()}</CardTitle>
          <div className="flex items-center gap-3">
            <Badge variant={statusVariant}>{statusLabel}</Badge>
            <Switch
              checked={isEnabled}
              onCheckedChange={handleSwitchChange}
              disabled={isMutating || !user || permission === "unsupported" || permission === "denied"}
              aria-label={m.notification_enable_aria()}
            />
          </div>
        </div>
        <CardDescription>{description}</CardDescription>
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
          {isMutating
            ? m.notification_processing()
            : isEnabled
              ? m.notification_register_again()
              : m.notification_turn_on()}
        </Button>
        {permission === "denied" ? (
          <Button variant="outline" disabled>
            <BellOff data-icon="inline-start" />
            {m.notification_blocked_by_browser()}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}
