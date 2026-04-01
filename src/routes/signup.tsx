import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const Route = createFileRoute("/signup")({
  component: SignInPage,
})

function SignInPage() {
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")

  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)

  // TODO: API 연결 - 아이디 중복 확인
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "available" | "taken">("idle")

  const isFormValid = name.trim() !== "" && username.trim() !== "" && password !== "" && passwordConfirm !== ""

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <div className="flex w-full max-w-md flex-col gap-12">
        <h1 className="text-2xl font-bold">회원가입</h1>

        <form
          className="flex flex-col gap-6"
          // TODO: API 연결 - 회원가입 요청
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">
              이름<span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="username">
              아이디<span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="username"
                type="text"
                placeholder="아이디"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setUsernameStatus("idle")
                }}
                className="flex-1"
                required
              />
            </div>
            {usernameStatus === "available" && <p className="text-xs text-green-600">사용 가능한 아이디입니다</p>}
            {usernameStatus === "taken" && <p className="text-xs text-destructive">이미 사용중인 아이디입니다</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">
              비밀번호<span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password-confirm">
              비밀번호 확인<span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password-confirm"
                type={showPasswordConfirm ? "text" : "password"}
                placeholder="비밀번호 확인"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="pr-10"
                required
              />
              <button
                type="button"
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPasswordConfirm((v) => !v)}
                tabIndex={-1}
              >
                {showPasswordConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" size="lg" className="mt-4 w-full" disabled={!isFormValid}>
            회원가입
          </Button>
        </form>
      </div>
    </div>
  )
}
