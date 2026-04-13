import { useState } from "react"
import { Link, createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { Bell, Mail, Search } from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { LoadingLayout } from "@/components/layout/loading-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { InboxContext } from "@/contexts/inbox-context"
import { useIsMobile } from "@/hooks/use-mobile"
import { userQueries } from "@/queries/user"
import type { PrimaryMailboxId } from "@/types/email"

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
  const [activeMailbox, setActiveMailbox] = useState<PrimaryMailboxId>("INBOX")
  const [searchQuery, setSearchQuery] = useState("")
  const isMobile = useIsMobile()

  return (
    <InboxContext.Provider value={{ activeMailbox, setActiveMailbox, searchQuery, setSearchQuery }}>
      <SidebarProvider className="h-svh flex-col overflow-hidden bg-background">
        <header className="flex h-14 shrink-0 items-center gap-4 bg-sidebar px-4">
          {isMobile ? (
            <SidebarTrigger className="shrink-0" />
          ) : (
            <Link to="/inbox" className="flex shrink-0 items-center gap-2">
              <Mail className="size-5" />
              <span className="font-bold">메일상자</span>
            </Link>
          )}

          <div className="relative mx-auto w-full max-w-xl">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="메일 검색"
              placeholder="메일 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 rounded-md bg-muted/50 pl-9 shadow-none"
            />
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="알림">
              <Bell className="size-5" />
            </Button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 overflow-hidden bg-sidebar">
          <AppSidebar
            activeMailbox={activeMailbox}
            onMailboxChange={setActiveMailbox}
            className="top-14 h-[calc(100svh-3.5rem)]"
          />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="relative m-2 mt-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl bg-background shadow-sm md:ml-0">
              <Outlet />
            </div>
          </div>
        </div>
      </SidebarProvider>
    </InboxContext.Provider>
  )
}
