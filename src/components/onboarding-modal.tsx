import { useState } from "react"
import { AlertTriangle, CheckCircle2, Plus, Sparkles, Home, Mail, Code, MoreVertical } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { m } from "@/paraglide/messages"

export const ONBOARDING_COMPLETED_KEY = "onboarding_completed"

const TOTAL_STEPS = 7

const SLIDE_KEYFRAMES = `
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(14px); }
    to   { opacity: 1; transform: translateX(0);    }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-14px); }
    to   { opacity: 1; transform: translateX(0);     }
  }
`

export function OnboardingModal() {
  const [open, setOpen] = useState(
    () => typeof window !== "undefined" && !localStorage.getItem(ONBOARDING_COMPLETED_KEY)
  )
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1)
  const [animKey, setAnimKey] = useState(0)
  const [direction, setDirection] = useState<"forward" | "backward">("forward")

  const navigate = useNavigate()

  const STEP_DESCRIPTIONS = [
    m.onboarding_step1_description(),
    m.onboarding_step2_description(),
    m.onboarding_step3_description(),
    m.onboarding_step4_description(),
    m.onboarding_step5_description(),
    m.onboarding_step6_description(),
  ]

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true")
    setOpen(false)
  }

  const handleGoToSettings = async () => {
    completeOnboarding()
    await navigate({ to: "/settings/account" })
  }

  const handlePrev = () => {
    setDirection("backward")
    setAnimKey((k) => k + 1)
    setStep((s) => (s - 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7)
  }

  const handleNext = () => {
    setDirection("forward")
    setAnimKey((k) => k + 1)
    setStep((s) => (s + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7)
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <style>{SLIDE_KEYFRAMES}</style>
      <DialogContent showCloseButton={false} className="flex h-105 flex-col gap-0 overflow-hidden p-0 sm:max-w-125">
        {/* 콘텐츠 */}
        <div
          key={animKey}
          className="flex flex-1 flex-col gap-5 overflow-hidden px-6 pt-8 pb-0"
          style={{ animation: `${direction === "forward" ? "slideInRight" : "slideInLeft"} 0.22s ease-out` }}
        >
          {/* 비주얼 미리보기 */}
          {step === 1 && <Step1GmailConnect />}
          {step === 2 && <Step2Notifications />}
          {step === 3 && <Step3Labels />}
          {step === 4 && <Step4LabelGroups />}
          {step === 5 && <Step5Compose />}
          {step === 6 && <Step6AiReview />}
          {step === 7 && <Step7Complete onGoToSettings={() => void handleGoToSettings()} />}

          {/* 텍스트 설명 */}
          {step !== TOTAL_STEPS && (
            <div className="pb-1 text-center">
              <h2 className="text-lg font-semibold">{STEP_DESCRIPTIONS[step - 1]}</h2>
            </div>
          )}
        </div>

        {/* 네비게이션 */}
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            className={cn("text-muted-foreground", step === 1 && "invisible")}
          >
            {m.onboarding_prev()}
          </Button>

          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "size-1.5 rounded-full transition-all duration-300",
                  step === i + 1 ? "w-3.5 bg-primary" : "bg-muted-foreground/25"
                )}
              />
            ))}
          </div>

          <Button size="sm" onClick={handleNext} className={cn(step === TOTAL_STEPS && "invisible")}>
            {m.onboarding_next()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ─── Step 1: Gmail 계정 연동 ─────────────────────────────────── */

function Step1GmailConnect() {
  const accounts = [
    { color: "#36C0EB", label: "work@gmail.com", icon: <Home className="size-4" /> },
    { color: "#ED64A7", label: "personal@gmail.com", icon: <Mail className="size-4" /> },
    { color: "#8B5CF6", label: "mailsangja2026@gmail.com", icon: <Code className="size-4" /> },
  ]

  return (
    <div className="flex flex-1 flex-col justify-center space-y-2">
      {accounts.map((account) => (
        <div
          key={account.label}
          className="flex items-center gap-3 rounded-xl border bg-background px-4 py-3 shadow-xs"
        >
          <span
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
            style={{ backgroundColor: account.color }}
          >
            {account.icon}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{account.label}</p>
            <p className="text-[10px] text-muted-foreground">{m.onboarding_step1_connected_status()}</p>
          </div>
          <CheckCircle2 className="size-4 shrink-0 text-green-500 dark:text-green-400" />
        </div>
      ))}
      <div className="flex items-center gap-3 rounded-xl border border-dashed px-4 py-3">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-dashed border-border/70 bg-muted/40">
          <Plus className="size-4 text-muted-foreground" />
        </span>
        <span className="text-xs text-muted-foreground">{m.onboarding_step1_add_account()}</span>
      </div>
    </div>
  )
}

/* ─── Step 2: 알림 ───────────────────────────────────────────── */

type NotificationItem = { sender: string; subject: string; time: string }

function getNotifications(): NotificationItem[] {
  return [
    {
      sender: m.onboarding_step2_notification_sender_1(),
      subject: m.onboarding_step2_notification_subject_1(),
      time: m.onboarding_step2_notification_time_1(),
    },
    {
      sender: m.onboarding_step2_notification_sender_2(),
      subject: m.onboarding_step2_notification_subject_2(),
      time: m.onboarding_step2_notification_time_2(),
    },
    {
      sender: m.onboarding_step2_notification_sender_3(),
      subject: m.onboarding_step2_notification_subject_3(),
      time: m.onboarding_step2_notification_time_3(),
    },
  ]
}

function NotificationCard({ item }: { item: NotificationItem }) {
  return (
    <div className="flex items-start gap-2.5 rounded-2xl border bg-background/95 px-3 py-2.5 shadow-sm backdrop-blur-sm">
      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl">
        <img src="/favicon-32x32.png" alt={m.app_name()} className="size-6" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-foreground/80">{m.app_name()}</span>
          </div>
          <span className="shrink-0 text-[10px] text-muted-foreground">{item.time}</span>
        </div>
        <p className="mt-0.5 text-xs leading-snug font-semibold">{item.sender}</p>
        <p className="line-clamp-1 text-[11px] text-muted-foreground">{item.subject}</p>
      </div>
    </div>
  )
}

function Step2Notifications() {
  const notifications = getNotifications()
  return (
    <div className="flex flex-1 flex-col justify-center space-y-2">
      {notifications.slice(0, 2).map((item) => (
        <NotificationCard key={item.subject} item={item} />
      ))}
      <div className="relative mb-4">
        <div className="absolute inset-x-4 -bottom-4 h-full rounded-2xl border bg-background/60 shadow-sm" />
        <div className="absolute inset-x-2 -bottom-2 h-full rounded-2xl border bg-background/80 shadow-sm" />
        <div className="relative z-10">
          <NotificationCard item={notifications[2]} />
        </div>
      </div>
    </div>
  )
}

/* ─── Step 3: 라벨 ───────────────────────────────────────────── */

function getMockLabels() {
  return [
    { name: m.onboarding_step3_label_work(), color: "#E040FB" },
    { name: m.onboarding_step3_label_newsletter(), color: "#FFD600" },
    { name: m.onboarding_step3_label_shopping(), color: "#76D275" },
    { name: m.onboarding_step3_label_payment(), color: "#F06292" },
    { name: m.onboarding_step3_label_personal(), color: "#F48FB1" },
    { name: m.onboarding_step3_label_travel(), color: "#CE93D8" },
    { name: m.onboarding_step3_label_subscription(), color: "#64B5F6" },
  ]
}

function Step3Labels() {
  const HOVERED_INDEX = 2
  const mockLabels = getMockLabels()

  return (
    <div className="flex flex-1 flex-col justify-center">
      <div className="overflow-hidden rounded-xl bg-background shadow-sm">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs font-semibold">{m.sidebar_labels()}</span>
          <div className="flex items-center gap-0.5">
            <span className="flex size-6 items-center justify-center rounded-full border-2 border-primary/40 bg-primary/5 text-primary">
              <Sparkles className="size-3" />
            </span>
            <span className="flex size-6 items-center justify-center rounded-md text-muted-foreground">
              <Plus className="size-3.5" />
            </span>
          </div>
        </div>
        <div>
          {mockLabels.map((label, i) => (
            <div
              key={label.name}
              className={cn("flex items-center gap-2 px-3 py-1.5", i === HOVERED_INDEX && "rounded-sm bg-muted/60")}
            >
              <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: label.color }} />
              <span className="flex-1 truncate text-xs">{label.name}</span>
              {i === HOVERED_INDEX && <MoreVertical className="size-3.5 shrink-0 text-muted-foreground" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Step 4: 라벨 그룹 ──────────────────────────────────────── */

function LabelChip({ name, color }: { name: string; color: string }) {
  return (
    <span className="flex items-center gap-1 rounded-full border bg-muted/40 px-2 py-0.5 text-[11px] font-medium">
      <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      {name}
    </span>
  )
}

function Step4LabelGroups() {
  const mockLabels = getMockLabels()
  const groups = [
    { name: m.onboarding_step4_group_work(), labels: mockLabels.slice(0, 3) },
    { name: m.onboarding_step4_group_life(), labels: mockLabels.slice(3) },
  ]

  return (
    <div className="flex flex-1 flex-col justify-center space-y-2">
      {groups.map((group) => (
        <div key={group.name} className="rounded-xl border bg-background px-4 py-3 shadow-xs">
          <div className="mb-2.5 flex items-center gap-2">
            <div className="flex shrink-0 items-center">
              {group.labels.map((label, i) => (
                <span
                  key={label.name}
                  className="size-3 rounded-full border-background"
                  style={{ backgroundColor: label.color, marginLeft: i > 0 ? -6 : 0 }}
                />
              ))}
            </div>
            <span className="text-xs font-semibold">{group.name}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {group.labels.map((label) => (
              <LabelChip key={label.name} {...label} />
            ))}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-3 rounded-xl border border-dashed px-4 py-3">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-dashed border-border/70 bg-muted/40">
          <Plus className="size-4 text-muted-foreground" />
        </span>
        <span className="text-xs text-muted-foreground">{m.onboarding_step4_add_group()}</span>
      </div>
    </div>
  )
}

/* ─── Step 5: AI 메일 작성 ───────────────────────────────────── */

function Step5Compose() {
  return (
    <div className="flex flex-1 flex-col justify-center">
      <div className="overflow-hidden rounded-xl border bg-background shadow-xs">
        <div className="flex h-10 items-center border-b bg-muted/30 px-4">
          <p className="text-xs font-semibold">{m.compose_new_mail()}</p>
        </div>
        <div className="divide-y">
          <div className="flex h-9 items-center gap-3 px-4">
            <span className="w-16 shrink-0 text-[11px] text-muted-foreground">{m.compose_field_to()}</span>
            <span className="text-xs font-medium">hong@example.com</span>
          </div>
          <div className="flex h-9 items-center gap-3 px-4">
            <span className="w-16 shrink-0 text-[11px] text-muted-foreground">{m.compose_field_subject()}</span>
            <span className="text-xs">{m.onboarding_step5_mock_subject()}</span>
          </div>
          <div className="flex items-start gap-3 px-4 py-2.5">
            <span className="w-16 shrink-0 text-[11px] text-muted-foreground">{m.onboarding_step5_body_label()}</span>
            <p className="text-xs text-muted-foreground">{m.onboarding_step5_mock_body()}</p>
          </div>
        </div>
        <div className="border-t bg-muted/20 p-2.5">
          <div className="overflow-hidden rounded-lg border border-primary/20 bg-background">
            <div className="flex h-8 items-center gap-2 px-3">
              <Sparkles className="size-3 text-primary" />
              <span className="text-[11px] font-medium text-primary">{m.compose_ai_draft()}</span>
            </div>
            <div className="flex h-9 items-center border-t bg-muted/30 px-3">
              <p className="text-xs text-muted-foreground">{m.onboarding_step5_mock_prompt()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Step 6: AI 메일 검토 ───────────────────────────────────── */

function Step6AiReview() {
  return (
    <div className="flex flex-1 flex-col justify-center">
      <div className="overflow-hidden rounded-xl border bg-background shadow-xs">
        <div className="flex h-10 items-center gap-2 border-b bg-primary/5 px-4">
          <Sparkles className="size-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary">{m.compose_review_result_title()}</span>
        </div>
        <div className="divide-y">
          <div className="flex gap-3 px-4 py-3.5">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="size-3.5 text-amber-500 dark:text-amber-400" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-amber-500 dark:text-amber-400">
                  {m.onboarding_step6_tone_suggest_title()}
                </span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {m.mail_review_field_body()}
                </span>
              </div>
              <p className="text-xs">{m.onboarding_step6_tone_suggest_message()}</p>
              <p className="text-xs text-muted-foreground">
                <span className="line-through">{m.onboarding_step6_original_text()}</span>
                {" → "}
                <span className="font-medium text-foreground">{m.onboarding_step6_suggested_text()}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="size-3.5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-xs">{m.onboarding_step6_no_spelling_errors()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Step 7: 준비 완료 ──────────────────────────────────────── */

function Step7Complete({ onGoToSettings }: { onGoToSettings: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <div className="relative flex size-20 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
        <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="size-10 text-primary" />
        </div>
      </div>
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold">{m.onboarding_step7_title()}</h2>
        <p className="text-sm text-muted-foreground">{m.onboarding_step7_description()}</p>
      </div>
      <Button className="w-full" size="lg" onClick={onGoToSettings}>
        {m.onboarding_step7_cta()}
      </Button>
    </div>
  )
}
