import { createFileRoute, Link } from "@tanstack/react-router"
import { LogOut } from "lucide-react"

import { MainContent } from "@/components/layout/main-content"
import { Button } from "@/components/ui/button"
import { useLogout } from "@/mutations/auth"
import { useUser } from "@/queries/user"

export const Route = createFileRoute("/_authenticated/inbox")({
  component: InboxPage,
})

function InboxPage() {
  const { data: user } = useUser()
  const logout = useLogout()

  return (
    <div className="flex min-h-0 flex-1">
      <aside className="flex w-64 shrink-0 flex-col overflow-y-auto">
        <nav className="flex flex-1 flex-col gap-1 p-2">
          <Link to="/inbox" className="flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm">
            인박스
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
        <div className="p-8">
          <h1 className="text-2xl font-bold">인박스</h1>
          <p className="mt-2 text-muted-foreground">메일상자에 오신 것을 환영합니다.</p>
        </div>
      </MainContent>
    </div>
  )
}
