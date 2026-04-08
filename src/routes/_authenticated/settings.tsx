import { createFileRoute, Link, Outlet } from "@tanstack/react-router"
import { LogOut, Settings, User } from "lucide-react"

import { MainContent } from "@/components/layout/main-content"
import { Button } from "@/components/ui/button"
import { useLogout } from "@/mutations/auth"
import { useUser } from "@/queries/user"

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsLayout,
})

function SettingsLayout() {
  const { data: user } = useUser()
  const logout = useLogout()

  return (
    <div className="flex min-h-0 flex-1">
      <aside className="flex w-64 shrink-0 flex-col overflow-y-auto">
        <nav className="flex flex-1 flex-col gap-1 p-2">
          <Link
            to="/settings"
            activeOptions={{ exact: true }}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
            activeProps={{ className: "flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm" }}
          >
            <Settings className="size-4" />
            설정
          </Link>
          <Link
            to="/settings/account"
            className="flex items-center gap-2 rounded-md px-3 py-2 pl-7 text-sm hover:bg-accent"
            activeProps={{ className: "flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm pl-7" }}
          >
            <User className="size-4" />
            계정
          </Link>
        </nav>

        <div className="border-t p-4">
          <div className="mb-2 text-sm">
            <p className="font-medium">{user?.name}</p>
            <p className="text-muted-foreground">{user?.username}</p>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={logout}>
            <LogOut className="size-4" />
            로그아웃
          </Button>
        </div>
      </aside>

      <MainContent>
        <Outlet />
      </MainContent>
    </div>
  )
}
