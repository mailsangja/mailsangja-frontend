import { Link, createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { Bell, Loader2, Mail, Search, Settings } from "lucide-react"

import { LoadingLayout } from "@/components/layout/loading-layout"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useUser, userQueries } from "@/queries/user"

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(userQueries.me())

    if (!user) {
      throw redirect({ to: "/login" })
    }
  },
  pendingComponent: LoadingLayout,
  component: AuthenticatedRouteLayout,
})

function AuthenticatedRouteLayout() {
  const { data: user } = useUser()

  if (!user) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-svh flex-col bg-background">
      <header className="flex items-center gap-4 px-4 pt-3 pb-2">
        <div className="flex shrink-0 items-center gap-2">
          <Mail className="size-5" />
          <span className="font-bold">메일상자</span>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            aria-label="메일 검색"
            placeholder="메일 검색"
            className="h-9 w-full rounded-md bg-muted/50 pr-3 pl-9 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="icon">
            <Bell className="size-5" />
          </Button>
          <Link to="/settings" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "ml-1")}>
            <Settings className="size-5" />
          </Link>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  )
}
