import { useState } from "react"
import { Check } from "lucide-react"

import { authorizeGoogle } from "@/api/mail-accounts"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AccountIcon, ICON_ENTRIES, type AccountIconName } from "@/lib/icon-entries"
import { cn } from "@/lib/utils"

const COLORS = [
  "#EF4444", "#F97316", "#EAB308", "#22C55E",
  "#3B82F6", "#8B5CF6", "#EC4899", "#6B7280",
]

export function AddAccountDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<"logo" | "login">("logo")
  const [selectedIcon, setSelectedIcon] = useState<AccountIconName>(ICON_ENTRIES[0].name)
  const [selectedColor, setSelectedColor] = useState(COLORS[0])
  const [alias, setAlias] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleOpenChange = (value: boolean) => {
    setOpen(value)
    if (!value) {
      setStep("logo")
      setSelectedIcon(ICON_ENTRIES[0].name)
      setSelectedColor(COLORS[0])
      setAlias("")
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      const { authorizationUrl } = await authorizeGoogle({
        alias,
        icon: selectedIcon,
        color: selectedColor,
      })
      window.location.href = authorizationUrl
    } catch {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {step === "logo" ? (
          <>
            <DialogHeader>
              <DialogTitle>아이콘 생성</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col items-center gap-6 py-4">
              <div
                className="flex size-20 items-center justify-center rounded-full"
                style={{ backgroundColor: selectedColor }}
              >
                <AccountIcon name={selectedIcon} className="size-8 text-white" />
              </div>

              <input
                type="text"
                placeholder="예: 회사 메일"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                className="h-9 w-full max-w-xs rounded-md border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
              />

              <div className="space-y-2">
                <p className="text-sm font-medium">아이콘</p>
                <div className="flex flex-wrap gap-2">
                  {ICON_ENTRIES.map(({ name, label, Icon }) => (
                    <button
                      key={name}
                      type="button"
                      title={label}
                      onClick={() => setSelectedIcon(name)}
                      className={cn(
                        "flex size-10 items-center justify-center rounded-lg border transition-colors",
                        selectedIcon === name
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-accent"
                      )}
                    >
                      <Icon className="size-5" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">색상</p>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className="flex size-10 items-center justify-center rounded-full border border-border transition-transform hover:scale-110"
                      style={{ backgroundColor: color }}
                    >
                      {selectedColor === color && (
                        <Check className="size-5 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep("login")} className="hover:bg-primary/80 cursor-pointer">
                다음
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>계정 연결</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col items-center gap-6 py-4">
              {/* 아이콘 미리보기 */}
              <div
                className="flex size-16 items-center justify-center rounded-full"
                style={{ backgroundColor: selectedColor }}
              >
                <AccountIcon name={selectedIcon} className="size-6 text-white" />
              </div>

              <p className="text-sm text-muted-foreground">
                아래 버튼을 눌러 Google 계정을 연결하세요.
              </p>

              <Button
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                {isLoading ? "연결 중..." : "Google 계정으로 로그인"}
              </Button>
            </div>

            <div className="flex justify-start">
              <Button variant="ghost" onClick={() => setStep("logo")}>
                이전
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
