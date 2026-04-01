import { createFileRoute, Link } from "@tanstack/react-router"

import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/login")({
  component: LoginPage,
})

function LoginPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <div className="flex w-full max-w-sm flex-col gap-12">
        <h1 className="text-2xl font-bold">로그인</h1>

        <form
          className="flex flex-col gap-4"
          // TODO: API 연결 - 로그인 요청
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="username">아이디</Label>
            <Input id="username" type="text" placeholder="아이디를 입력하세요" autoComplete="username" required />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              autoComplete="current-password"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <input type="checkbox" className="size-3.5 accent-primary" />
              로그인 상태유지
            </label>
            <div className="flex gap-2 text-sm">
              {/* TODO: API 연결 - 아이디 찾기 페이지 라우트 연결 */}
              <Link to="/" className="text-muted-foreground underline-offset-4 hover:underline">
                아이디 찾기
              </Link>
              {/* TODO: API 연결 - 비밀번호 찾기 페이지 라우트 연결 */}
              <Link to="/" className="text-muted-foreground underline-offset-4 hover:underline">
                비밀번호 찾기
              </Link>
            </div>
          </div>

          <div className="mt-2 flex flex-col gap-3">
            <Button type="submit" size="lg" className="w-full">
              로그인
            </Button>
            <Link to="/signup" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}>
              회원가입
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
