import { Link } from "@tanstack/react-router"
import { ArrowLeft, House, Wrench } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { m } from "@/paraglide/messages"

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
          <CardTitle className="text-2xl">{m.not_found_title()}</CardTitle>
          <CardDescription className="max-w-sm">{m.not_found_description()}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap justify-center gap-2">
            <Link to="/" className={buttonVariants()}>
              <House className="size-4" />
              {m.common_home()}
            </Link>
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="size-4" />
              {m.common_previous_page()}
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
