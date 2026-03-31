import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowRight } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"

export const Route = createFileRoute("/")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-6">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold">메일상자</h1>
          <p className="text-xl text-muted-foreground">
            AI 에이전트 기반
            <br />
            메일 인박스 서비스
          </p>
        </div>
        <Link to="/login" className={buttonVariants({ size: "lg" })}>
          시작하기
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  )
}
