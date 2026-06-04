import { useState } from "react"
import { Link, createFileRoute } from "@tanstack/react-router"
import {
  Check,
  LayoutList,
  List,
  Monitor,
  Moon,
  MousePointer,
  MousePointerClick,
  RefreshCw,
  Sparkles,
  Sun,
} from "lucide-react"

import { InboxSingleLinePreview, InboxTwoLinePreview } from "@/components/inbox-preview"
import { LanguageSelect } from "@/components/language-select"
import { NotificationSettingsCard } from "@/components/notification-settings-card"
import { useTheme } from "@/components/theme-provider"
import { DarkPreview, LightPreview, SystemPreview } from "@/components/theme-preview"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { m } from "@/paraglide/messages"
import { useAiUsages } from "@/queries/ai"
import { useUser } from "@/queries/user"
import { getAiUsageTypeLabel } from "@/types/ai"

export const Route = createFileRoute("/_authenticated/_app/settings/")({
  component: SettingsPage,
})

function SettingsPage() {
  const { data: user, isPending: isUserPending } = useUser()
  const {
    data: aiUsages,
    isPending: isAiUsagesPending,
    isError: isAiUsagesError,
    isRefetching: isAiUsagesRefetching,
    refetch: refetchAiUsages,
  } = useAiUsages()
  const { theme, setTheme } = useTheme()
  // TODO: 실제 설정 저장/불러오기 기능은 추후 구현 예정
  const [inboxView, setInboxView] = useState<"single" | "double">("double")
  const [hoverAction, setHoverAction] = useState<"enabled" | "disabled">("enabled")

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>{m.settings_user_info_title()}</CardTitle>
            <CardDescription>{m.settings_user_info_description()}</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground">{m.settings_user_name_label()}</p>
                <p className="text-sm font-medium">{isUserPending ? "..." : (user?.name ?? "-")}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground">{m.settings_user_id_label()}</p>
                <p className="text-sm font-medium">{user?.username ?? "-"}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground">{m.settings_user_plan_label()}</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{user?.plan ?? "-"}</p>
                  {user?.plan === "FREE" && (
                    <Link
                      to="/upgrade"
                      className="inline-flex animate-bounce items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-primary transition-colors hover:bg-primary/20"
                    >
                      <Sparkles className="size-3" />
                      {m.settings_upgrade_plan_link()}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="flex items-start justify-between">
            <div>
              <CardTitle>{m.settings_ai_usage_title()}</CardTitle>
              <CardDescription>{m.settings_ai_usage_description()}</CardDescription>
            </div>
            <button
              type="button"
              onClick={() => refetchAiUsages()}
              disabled={isAiUsagesPending || isAiUsagesRefetching}
              className="rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              aria-label={m.settings_ai_usage_refresh_aria()}
            >
              <RefreshCw className={cn("size-4", isAiUsagesRefetching && "animate-spin")} />
            </button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col gap-3">
              {isAiUsagesPending ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                ))
              ) : isAiUsagesError ? (
                <p className="text-sm text-muted-foreground">{m.settings_ai_usage_error()}</p>
              ) : (
                aiUsages?.usages.map((item) => {
                  const ratio = item.limit > 0 ? item.used / item.limit : 0
                  const isExhausted = item.used >= item.limit
                  return (
                    <div key={item.type} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{getAiUsageTypeLabel(item.type)}</span>
                        <span
                          className={cn(
                            "text-xs tabular-nums",
                            isExhausted ? "text-destructive" : "text-muted-foreground"
                          )}
                        >
                          {Math.min(item.used, item.limit)} / {item.limit}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            isExhausted ? "bg-destructive" : "bg-primary"
                          )}
                          style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-md px-1 font-semibold text-muted-foreground">{m.settings_language_section()}</p>
        <Card>
          <CardHeader>
            <CardTitle>{m.settings_language_title()}</CardTitle>
            <CardDescription>{m.settings_language_description()}</CardDescription>
          </CardHeader>
          <CardContent className="pt-1">
            <LanguageSelect />
          </CardContent>
        </Card>
      </div>

      <div id="notification-settings" className="flex flex-col gap-3">
        <p className="text-md px-1 font-semibold text-muted-foreground">{m.settings_notification_section()}</p>
        <NotificationSettingsCard />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-md px-1 font-semibold text-muted-foreground">{m.settings_quick_settings_section()}</p>
        <Card>
          <CardHeader>
            <CardTitle>{m.settings_inbox_title()}</CardTitle>
            <CardDescription>{m.settings_inbox_description()}</CardDescription>
          </CardHeader>
          <CardContent className="pt-1">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(
                [
                  {
                    value: "single",
                    label: m.settings_inbox_single_line(),
                    icon: List,
                    preview: <InboxSingleLinePreview />,
                  },
                  {
                    value: "double",
                    label: m.settings_inbox_two_line(),
                    icon: LayoutList,
                    preview: <InboxTwoLinePreview />,
                  },
                ] as const
              ).map(({ value, label, icon: Icon, preview }) => (
                <button
                  key={value}
                  type="button"
                  // TODO: Persist this preference when the settings API is ready.
                  onClick={() => setInboxView(value)}
                  aria-pressed={inboxView === value}
                  className={cn(
                    "group flex flex-col gap-2 rounded-xl border-2 p-2.5 text-left transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    inboxView === value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-border/80 hover:bg-muted/40"
                  )}
                >
                  {preview}
                  <div className="mt-auto flex items-center justify-between px-0.5">
                    <span
                      className={cn(
                        "flex items-center gap-1.5 text-xs font-medium",
                        inboxView === value ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      <Icon className="size-3.5" />
                      {label}
                    </span>
                    {inboxView === value && <Check className="size-3.5 text-primary" />}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <Card>
          <CardHeader>
            <CardTitle>{m.settings_theme_title()}</CardTitle>
            <CardDescription>{m.settings_theme_description()}</CardDescription>
          </CardHeader>
          <CardContent className="pt-1">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(
                [
                  { value: "light", label: m.settings_theme_light(), icon: Sun, preview: <LightPreview /> },
                  { value: "system", label: m.settings_theme_system(), icon: Monitor, preview: <SystemPreview /> },
                  { value: "dark", label: m.settings_theme_dark(), icon: Moon, preview: <DarkPreview /> },
                ] as const
              ).map(({ value, label, icon: Icon, preview }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  aria-pressed={theme === value}
                  className={cn(
                    "group flex flex-col gap-2 rounded-xl border-2 p-2.5 text-left transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    theme === value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-border/80 hover:bg-muted/40"
                  )}
                >
                  {preview}
                  <div className="flex items-center justify-between px-0.5">
                    <span
                      className={cn(
                        "flex items-center gap-1.5 text-xs font-medium",
                        theme === value ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      <Icon className="size-3.5" />
                      {label}
                    </span>
                    {theme === value && <Check className="size-3.5 text-primary" />}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <Card>
          <CardHeader>
            <CardTitle>{m.settings_mail_preview_title()}</CardTitle>
            <CardDescription>{m.settings_mail_preview_description()}</CardDescription>
          </CardHeader>
          <CardContent className="pt-1">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(
                [
                  { value: "enabled", label: m.settings_option_enabled(), icon: MousePointerClick },
                  { value: "disabled", label: m.settings_option_disabled(), icon: MousePointer },
                ] as const
              ).map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setHoverAction(value)}
                  aria-pressed={hoverAction === value}
                  className={cn(
                    "flex items-center justify-between rounded-xl border-2 px-3 py-2 text-left transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    hoverAction === value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-border/80 hover:bg-muted/40"
                  )}
                >
                  <span
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium",
                      hoverAction === value ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <Icon className="size-4" />
                    {label}
                  </span>
                  {hoverAction === value && <Check className="size-4 text-primary" />}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pr-4">
        <a
          href={`mailto:mailsangja2026@gmail.com?subject=${encodeURIComponent(
            m.settings_account_deletion_email_subject()
          )}`}
          className="cursor-pointer text-xs text-muted-foreground hover:text-destructive"
        >
          {m.settings_account_deletion_link()}
        </a>
      </div>
    </>
  )
}
