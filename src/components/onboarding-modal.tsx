import { useState } from "react"
import { AlertTriangle, CheckCircle2, Plus, Sparkles, Home, Mail, Code, MoreVertical } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export const ONBOARDING_COMPLETED_KEY = "onboarding_completed"

const TOTAL_STEPS = 7

const STEP_META = [
  { description: "Gmail 계정을 여러 개 연동해 한 인박스에서 관리하세요" },
  { description: "중요한 메일을 놓치지 않도록 즉시 알려드려요" },
  { description: "라벨로 메일을 분류하고 AI 추천도 받아보세요" },
  { description: "연관된 라벨을 하나의 그룹으로 묶어보세요" },
  { description: "프롬프트 한 줄로 완성도 높은 메일을 작성하세요" },
  { description: "발송 전 AI가 어조, 맞춤법, 내용을 꼼꼼하게 살펴봐요" },
  { title: "준비 완료!", description: "계정을 연동하면 바로 메일상자를 사용할 수 있어요" },
]

export function OnboardingModal() {
  const [open, setOpen] = useState(() => !localStorage.getItem(ONBOARDING_COMPLETED_KEY))
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1)

  const navigate = useNavigate()

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true")
    setOpen(false)
  }

  const handleGoToSettings = async () => {
    completeOnboarding()
    await navigate({ to: "/settings/account" })
  }

  const handlePrev = () => setStep((s) => (s - 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7)
  const handleNext = () => setStep((s) => (s + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7)

  const meta = STEP_META[step - 1]

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent showCloseButton={false} className="flex h-100 flex-col gap-0 overflow-hidden p-0 sm:max-w-125">
        {/* 콘텐츠 */}
        <div className="flex flex-1 flex-col gap-5 overflow-hidden px-6 pt-8 pb-0">
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
              <h2 className="text-lg font-semibold">{meta.description}</h2>
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
            이전
          </Button>

          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "size-1.5 rounded-full transition-all duration-300",
                  step === i + 1 ? "bg-primary" : "bg-muted-foreground/25"
                )}
              />
            ))}
          </div>

          <Button size="sm" onClick={handleNext} className={cn(step === TOTAL_STEPS && "invisible")}>
            다음
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
            <p className="text-[10px] text-muted-foreground">Gmail · 연동됨</p>
          </div>
          <CheckCircle2 className="size-4 shrink-0 text-green-500 dark:text-green-400" />
        </div>
      ))}
      <div className="flex items-center gap-3 rounded-xl border border-dashed px-4 py-3">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-dashed border-border/70 bg-muted/40">
          <Plus className="size-4 text-muted-foreground" />
        </span>
        <span className="text-xs text-muted-foreground">계정 추가하기</span>
      </div>
    </div>
  )
}

/* ─── Step 2: 알림 ───────────────────────────────────────────── */

const NOTIFICATIONS = [
  {
    sender: "홍길동",
    subject: "다음 주 미팅 일정 확인 부탁드립니다",
    time: "방금",
  },
  {
    sender: "네이버 쇼핑",
    subject: "주문하신 상품이 오늘 도착 예정이에요",
    time: "3분 전",
  },
  {
    sender: "카드사 결제",
    subject: "5월 구독료 결제가 완료되었습니다",
    time: "15분 전",
  },
]

function NotificationCard({ item }: { item: (typeof NOTIFICATIONS)[0] }) {
  return (
    <div className="flex items-start gap-2.5 rounded-2xl border bg-background/95 px-3 py-2.5 shadow-sm backdrop-blur-sm">
      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl">
        <img src="/favicon-32x32.png" alt="메일상자" className="size-6" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-foreground/80">메일상자</span>
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
  return (
    <div className="flex flex-1 flex-col justify-center space-y-2">
      {NOTIFICATIONS.slice(0, 2).map((item) => (
        <NotificationCard key={item.subject} item={item} />
      ))}
      <div className="relative mb-4">
        <div className="absolute inset-x-4 -bottom-4 h-full rounded-2xl border bg-background/60 shadow-sm" />
        <div className="absolute inset-x-2 -bottom-2 h-full rounded-2xl border bg-background/80 shadow-sm" />
        <div className="relative z-10">
          <NotificationCard item={NOTIFICATIONS[2]} />
        </div>
      </div>
    </div>
  )
}

/* ─── Step 3: 라벨 ───────────────────────────────────────────── */

const MOCK_LABELS = [
  { name: "업무", color: "#E040FB" },
  { name: "뉴스레터", color: "#FFD600" },
  { name: "쇼핑", color: "#76D275" },
  { name: "결제", color: "#F06292" },
  { name: "개인", color: "#F48FB1" },
  { name: "여행", color: "#CE93D8" },
  { name: "구독", color: "#64B5F6" },
]

function Step3Labels() {
  const HOVERED_INDEX = 2

  return (
    <div className="flex flex-1 flex-col justify-center">
      <div className="overflow-hidden rounded-xl bg-background shadow-sm">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs font-semibold">라벨</span>
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
          {MOCK_LABELS.map((label, i) => (
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
  const groups = [
    { name: "업무 관련", labels: MOCK_LABELS.slice(0, 3) },
    { name: "생활", labels: MOCK_LABELS.slice(3) },
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
        <span className="text-xs text-muted-foreground">그룹 추가하기</span>
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
          <p className="text-xs font-semibold">새 메일</p>
        </div>
        <div className="divide-y">
          <div className="flex h-9 items-center gap-3 px-4">
            <span className="w-16 shrink-0 text-[11px] text-muted-foreground">받는 사람</span>
            <span className="text-xs font-medium">hong@example.com</span>
          </div>
          <div className="flex h-9 items-center gap-3 px-4">
            <span className="w-16 shrink-0 text-[11px] text-muted-foreground">제목</span>
            <span className="text-xs">미팅 일정 확인 요청</span>
          </div>
          <div className="flex items-start gap-3 px-4 py-2.5">
            <span className="w-16 shrink-0 text-[11px] text-muted-foreground">내용</span>
            <p className="text-xs text-muted-foreground">안녕하세요, 내일 오후 3시에...</p>
          </div>
        </div>
        <div className="border-t bg-muted/20 p-2.5">
          <div className="overflow-hidden rounded-lg border border-primary/20 bg-background">
            <div className="flex h-8 items-center gap-2 px-3">
              <Sparkles className="size-3 text-primary" />
              <span className="text-[11px] font-medium text-primary">AI 작성 도우미</span>
            </div>
            <div className="flex h-9 items-center border-t bg-muted/30 px-3">
              <p className="text-xs text-muted-foreground">공손한 미팅 확인 메일 작성해줘</p>
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
          <span className="text-xs font-semibold text-primary">AI 검토 결과</span>
        </div>
        <div className="divide-y">
          <div className="flex gap-3 px-4 py-3.5">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="size-3.5 text-amber-500 dark:text-amber-400" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-amber-500 dark:text-amber-400">어조 개선 제안</span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">본문</span>
              </div>
              <p className="text-xs">더 공손한 표현으로 변경하는 것을 권장해요</p>
              <p className="text-xs text-muted-foreground">
                <span className="line-through">확인해주세요</span>
                {" → "}
                <span className="font-medium text-foreground">확인 부탁드립니다</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="size-3.5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-xs">맞춤법 오류가 없어요</p>
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
        <h2 className="text-lg font-semibold">메일상자 사용 준비가 됐어요!</h2>
        <p className="text-sm text-muted-foreground">계정을 연동하면 바로 시작할 수 있어요</p>
      </div>
      <Button className="w-full" size="lg" onClick={onGoToSettings}>
        계정 연동하기
      </Button>
    </div>
  )
}
