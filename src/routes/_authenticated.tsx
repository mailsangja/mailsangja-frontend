import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router"
import { LogOut, Mail, Settings, Loader2 } from "lucide-react"

import { LoadingLayout } from "@/components/layout/loading-layout"
import { Button } from "@/components/ui/button"
import { useLogout } from "@/mutations/auth"
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
  const logout = useLogout()

  if (!user) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-svh">
      <aside className="flex w-64 flex-col border-r bg-card">
        <div className="flex items-center gap-2 border-b p-4">
          <Mail className="size-5" />
          <span className="font-bold">메일상자</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-2">
          <Link to="/inbox" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent">
            인박스
          </Link>
          <Link to="/settings" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent">
            <Settings className="size-4" />
            설정
          </Link>
        </nav>

        <div className="border-t p-4">
          <div className="mb-2 text-sm">
            <p className="font-medium">{user.name}</p>
            <p className="text-muted-foreground">{user.username}</p>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={logout}>
            <LogOut className="size-4" />
            로그아웃
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
