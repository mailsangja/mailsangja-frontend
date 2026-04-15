import { Link } from "@tanstack/react-router"
import { ArrowLeft, House, Wrench } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface NotFoundPageProps {
  fullScreen?: boolean
}

export function NotFoundPage({ fullScreen = false }: NotFoundPageProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-background p-6",
        fullScreen ? "min-h-svh" : "min-h-full flex-1"
      )}
    >
      <Card className="w-full max-w-lg border-dashed">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted">
          <Wrench className="size-7 text-muted-foreground" />
        </div>
        <CardHeader className="justify-center text-center">
          <CardTitle className="text-2xl">404 페이지를 찾을 수 없습니다</CardTitle>
          <CardDescription className="max-w-sm">
            요청한 경로를 찾지 못했습니다. 주소가 잘못되었거나 더 이상 제공되지 않는 페이지일 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap justify-center gap-2">
            <Link to="/" className={buttonVariants()}>
              <House className="size-4" />
              홈으로 이동
            </Link>
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="size-4" />
              이전 페이지
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function NotFoundComponent() {
  return <NotFoundPage />
}

export function RootNotFoundComponent() {
  return <NotFoundPage fullScreen />
}
