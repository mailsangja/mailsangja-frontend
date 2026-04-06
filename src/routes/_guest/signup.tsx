import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRegister } from "@/mutations/auth"

export const Route = createFileRoute("/_guest/signup")({
  component: SignUpPage,
})

function SignUpPage() {
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)

  const registerMutation = useRegister()

  const isFormValid =
    name.trim() !== "" &&
    username.trim() !== "" &&
    password !== "" &&
    passwordConfirm !== "" &&
    password === passwordConfirm

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    registerMutation.mutate({ name, username, password })
  }

  return (
    <div className="flex flex-col gap-12">
      <h1 className="text-2xl font-bold">회원가입</h1>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
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
          <Input
            id="username"
            type="text"
            placeholder="아이디"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex-1"
            required
          />
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

        {registerMutation.isError && (
          <p className="text-sm text-destructive">회원가입에 실패했습니다. 다시 시도해주세요.</p>
        )}

        <Button type="submit" size="lg" className="mt-4 w-full" disabled={!isFormValid || registerMutation.isPending}>
          {registerMutation.isPending ? "가입 중..." : "회원가입"}
        </Button>
      </form>
    </div>
  )
}
