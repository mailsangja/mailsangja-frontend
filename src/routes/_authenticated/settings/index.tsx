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
import { NotificationSettingsCard } from "@/components/notification-settings-card"
import { useTheme } from "@/components/theme-provider"
import { DarkPreview, LightPreview, SystemPreview } from "@/components/theme-preview"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useAiUsages } from "@/queries/ai"
import { useUser } from "@/queries/user"
import { AI_USAGE_TYPE_LABELS } from "@/types/ai"

export const Route = createFileRoute("/_authenticated/settings/")({
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
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-4 px-6 pb-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>사용자 정보</CardTitle>
              <CardDescription>현재 로그인한 사용자와 구독 플랜 정보를 확인합니다.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-muted-foreground">이름</p>
                  <p className="text-sm font-medium">{isUserPending ? "..." : (user?.name ?? "-")}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-muted-foreground">아이디</p>
                  <p className="text-sm font-medium">{user?.username ?? "-"}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-muted-foreground">플랜</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{user?.plan ?? "-"}</p>
                    {user?.plan === "FREE" && (
                      <Link
                        to="/upgrade"
                        className="inline-flex animate-bounce items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-primary transition-colors hover:bg-primary/20"
                      >
                        <Sparkles className="size-3" />
                        요금제 업그레이드
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
                <CardTitle>AI 기능 사용량</CardTitle>
                <CardDescription>이번 주 AI 기능별 사용 현황입니다.</CardDescription>
              </div>
              <button
                type="button"
                onClick={() => refetchAiUsages()}
                disabled={isAiUsagesPending || isAiUsagesRefetching}
                className="rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                aria-label="사용량 새로고침"
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
                  <p className="text-sm text-muted-foreground">
                    사용량을 불러오지 못했습니다. 새로고침을 눌러 다시 시도해 주세요.
                  </p>
                ) : (
                  aiUsages?.usages.map((item) => {
                    const ratio = item.limit > 0 ? item.used / item.limit : 0
                    const isExhausted = item.used >= item.limit
                    return (
                      <div key={item.type} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{AI_USAGE_TYPE_LABELS[item.type]}</span>
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

        <div id="notification-settings" className="flex flex-col gap-3">
          <p className="text-md px-1 font-semibold text-muted-foreground">알림</p>
          <NotificationSettingsCard />
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-md px-1 font-semibold text-muted-foreground">빠른 설정</p>
          <Card>
            <CardHeader>
              <CardTitle>받은편지함</CardTitle>
              <CardDescription>메일 목록의 표시 방식을 선택합니다.</CardDescription>
            </CardHeader>
            <CardContent className="pt-1 pb-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(
                  [
                    { value: "single", label: "한 줄 보기", icon: List, preview: <InboxSingleLinePreview /> },
                    { value: "double", label: "두 줄 보기", icon: LayoutList, preview: <InboxTwoLinePreview /> },
                  ] as const
                ).map(({ value, label, icon: Icon, preview }) => (
                  <button
                    key={value}
                    type="button"
                    // TODO: 실제 설정 저장 기능 구현 시 주석 해제
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
              <CardTitle>다크모드</CardTitle>
              <CardDescription>서비스의 테마를 선택합니다.</CardDescription>
            </CardHeader>
            <CardContent className="pt-1 pb-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {(
                  [
                    { value: "light", label: "라이트", icon: Sun, preview: <LightPreview /> },
                    { value: "system", label: "시스템", icon: Monitor, preview: <SystemPreview /> },
                    { value: "dark", label: "다크", icon: Moon, preview: <DarkPreview /> },
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
              <CardTitle>메일 미리보기 활성화</CardTitle>
              <CardDescription>메일 위에 마우스를 올리면 내용을 미리 확인할 수 있습니다.</CardDescription>
            </CardHeader>
            <CardContent className="pt-1 pb-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(
                  [
                    { value: "enabled", label: "사용", icon: MousePointerClick },
                    { value: "disabled", label: "미사용", icon: MousePointer },
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
            href="mailto:mailsangja2026@gmail.com?subject=회원 탈퇴 요청"
            className="cursor-pointer text-xs text-muted-foreground hover:text-destructive"
          >
            회원 탈퇴
          </a>
        </div>
      </div>
    </ScrollArea>
  )
}
