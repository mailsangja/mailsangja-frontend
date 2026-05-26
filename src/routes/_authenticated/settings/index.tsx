import { Link, createFileRoute } from "@tanstack/react-router"
import { Check, Monitor, Moon, Sparkles, Sun } from "lucide-react"

import { NotificationSettingsCard } from "@/components/notification-settings-card"
import { useTheme } from "@/components/theme-provider"
import { DarkPreview, LightPreview, SystemPreview } from "@/components/theme-preview"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useUser } from "@/queries/user"

export const Route = createFileRoute("/_authenticated/settings/")({
  component: SettingsPage,
})

function SettingsPage() {
  const { data: user, isPending: isUserPending } = useUser()
  const { theme, setTheme } = useTheme()

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-4 px-3 pt-1 pb-4">
        <Card>
          <CardHeader>
            <CardTitle>계정 정보</CardTitle>
            <CardDescription>현재 로그인한 사용자와 구독 플랜 정보를 확인합니다.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-3 divide-x">
              <div className="flex flex-col gap-1 pr-4">
                <p className="text-xs text-muted-foreground">이름</p>
                <p className="text-sm font-medium">{isUserPending ? "..." : (user?.name ?? "-")}</p>
              </div>
              <div className="flex flex-col gap-1 px-4">
                <p className="text-xs text-muted-foreground">아이디</p>
                <p className="text-sm font-medium">{user?.username ?? "-"}</p>
              </div>
              <div className="relative flex flex-col gap-1 pl-4">
                {user?.plan === "FREE" && (
                  <Link
                    to="/"
                    className="absolute -top-8 left-2 z-10 inline-flex animate-bounce items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-primary transition-colors hover:bg-primary/20"
                  >
                    <Sparkles className="size-3" />
                    요금제 업그레이드
                    <span className="absolute -bottom-1.75 left-3 size-0 border-x-[6px] border-t-[7px] border-x-transparent border-t-primary/10" />
                  </Link>
                )}
                <p className="text-xs text-muted-foreground">플랜</p>
                <p className="text-sm font-medium">{user?.plan ?? "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <p className="text-md px-1 font-semibold text-muted-foreground">빠른 설정</p>
          <Card>
            <CardHeader>
              <CardTitle>받은 편지함</CardTitle>
              <CardDescription>받은 편지함의 읽기창을 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="py-4 text-center text-sm text-muted-foreground">준비 중입니다.</CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-3">
          <Card>
            <CardHeader>
              <CardTitle>다크모드</CardTitle>
              <CardDescription>서비스의 테마를 선택합니다.</CardDescription>
            </CardHeader>
            <CardContent className="pt-1 pb-5">
              <div className="grid grid-cols-3 gap-3">
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
          <p className="text-md px-1 font-semibold text-muted-foreground">알림</p>
          <NotificationSettingsCard />
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-destructive" disabled>
            회원 탈퇴
          </Button>
        </div>
      </div>
    </ScrollArea>
  )
}
