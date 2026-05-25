import { useState } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Eye, EyeOff, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const registerMutation = useRegister()

  const isFormValid =
    name.trim() !== "" &&
    username.trim() !== "" &&
    password !== "" &&
    passwordConfirm !== "" &&
    password === passwordConfirm &&
    agreedToTerms

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    registerMutation.mutate({ name, username, password })
  }

  return (
    <Card className="bg-transparent">
      <CardHeader className="items-center justify-items-center text-center">
        <CardTitle className="text-xl font-bold tracking-tight">회원가입</CardTitle>
        <CardDescription>새 계정을 만들어 시작하세요</CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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

          <div className="flex items-center gap-2">
            <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(v) => setAgreedToTerms(v === true)} />
            <Label htmlFor="terms" className="gap-1 text-xs leading-relaxed font-normal">
              <Link to="/terms" className="font-medium text-primary hover:underline" target="_blank">
                서비스 이용약관
              </Link>
              및
              <Link to="/privacy" className="font-medium text-primary hover:underline" target="_blank">
                개인정보처리방침
              </Link>
              에 동의합니다.
            </Label>
          </div>

          {registerMutation.isError && (
            <p className="flex items-center gap-1.5 text-sm text-destructive">
              <span className="inline-block size-1.5 shrink-0 rounded-full bg-destructive" />
              회원가입에 실패했습니다. 다시 시도해주세요.
            </p>
          )}

          <Button type="submit" size="lg" className="mt-1 w-full" disabled={!isFormValid || registerMutation.isPending}>
            {registerMutation.isPending && <Loader2 className="animate-spin" />}
            회원가입
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          이미 계정이 있으신가요? &nbsp;
          <Link to="/login" className="font-medium text-primary hover:underline">
            로그인
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
