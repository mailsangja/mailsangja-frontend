import { useState } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"

import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useLogin } from "@/mutations/auth"

export const Route = createFileRoute("/_guest/login")({
  component: LoginPage,
})

function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const loginMutation = useLogin()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loginMutation.mutate({ username, password })
  }

  return (
    <div className="flex flex-col gap-12">
      <h1 className="text-2xl font-bold">로그인</h1>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="username">아이디</Label>
          <Input
            id="username"
            type="text"
            placeholder="아이디를 입력하세요"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">비밀번호</Label>
          <Input
            id="password"
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        {loginMutation.isError && <p className="text-sm text-destructive">아이디 또는 비밀번호가 올바르지 않습니다.</p>}

        <div className="mt-2 flex flex-col gap-3">
          <Button type="submit" size="lg" className="w-full" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "로그인 중..." : "로그인"}
          </Button>
          <Link to="/signup" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}>
            회원가입
          </Link>
        </div>
      </form>
    </div>
  )
}
