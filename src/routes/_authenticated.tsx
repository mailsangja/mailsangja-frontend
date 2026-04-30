import { useSyncExternalStore } from "react"
import { Link, createFileRoute, Outlet, redirect, useLocation, useNavigate } from "@tanstack/react-router"
import { Bell, BellOff, Mail, Search } from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { LoadingLayout } from "@/components/layout/loading-layout"
import { PushNotificationListener } from "@/components/push-notification-listener"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { getPushNotificationPermission, getStoredFcmToken, subscribeToFcmToken } from "@/lib/fcm"
import { parseMailRouteSearch } from "@/lib/mail-routing"
import { cn } from "@/lib/utils"
import { userQueries, useUser } from "@/queries/user"
import { parseMailboxId, type PrimaryMailboxId } from "@/types/email"

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

function getMailRouteState(pathname: string, search: unknown) {
  const [, section, mailbox] = pathname.split("/")
  const { query = "", filter = "all", accountId } = parseMailRouteSearch(search)

  return {
    mailbox: section === "mail" && mailbox ? parseMailboxId(mailbox) : null,
    query,
    filter,
    accountId,
  }
}

function NotificationSettingsLink() {
  const { data: user } = useUser()
  const registeredToken = useSyncExternalStore(
    subscribeToFcmToken,
    () => (user ? getStoredFcmToken(user.id) : null),
    () => null
  )
  const isEnabled = getPushNotificationPermission() === "granted" && Boolean(registeredToken)
  const Icon = isEnabled ? Bell : BellOff
  const label = isEnabled ? "푸시 알림 설정, 활성화됨" : "푸시 알림 설정, 비활성화됨"

  return (
    <Link to="/settings" className={buttonVariants({ variant: "ghost", size: "icon" })} aria-label={label}>
      <Icon className={cn("size-5", !isEnabled && "text-muted-foreground")} />
    </Link>
  )
}

function AuthenticatedRouteLayout() {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const { mailbox, query, filter, accountId } = useLocation({
    select: (currentLocation) => getMailRouteState(currentLocation.pathname, currentLocation.search),
  })

  const submitMailSearch = (mailbox: PrimaryMailboxId, nextQuery: string) => {
    void navigate({
      to: "/mail/$mailbox",
      params: { mailbox },
      search: (previous) => ({
        ...previous,
        query: nextQuery || undefined,
        thread: undefined,
      }),
      replace: true,
    })
  }

  return (
    <SidebarProvider className="h-svh flex-col overflow-hidden bg-background">
      <header className="flex h-14 shrink-0 items-center gap-4 bg-sidebar px-4">
        {isMobile ? (
          <SidebarTrigger className="shrink-0" />
        ) : (
          <Link to="/mail/$mailbox" params={{ mailbox: "inbox" }} className="flex shrink-0 items-center gap-2">
            <Mail className="size-5" />
            <span className="font-bold">메일상자</span>
          </Link>
        )}

        <form
          className="relative mx-auto w-full max-w-xl"
          onSubmit={(event) => {
            event.preventDefault()

            const formData = new FormData(event.currentTarget)
            const value = formData.get("query")
            const q = typeof value === "string" ? value.trim() : ""

            if (mailbox) {
              submitMailSearch(mailbox, q)
              return
            }

            void navigate({
              to: "/mail/$mailbox",
              params: { mailbox: "inbox" },
              search: {
                ...(q ? { query: q } : {}),
                ...(accountId ? { accountId } : {}),
              },
            })
          }}
        >
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          {mailbox ? (
            <Input
              key="mail-search"
              name="query"
              aria-label="메일 검색"
              placeholder="메일 검색"
              value={query}
              onChange={(e) => {
                submitMailSearch(mailbox, e.target.value.trim())
              }}
              className="h-9 rounded-md bg-muted/50 pl-9 shadow-none"
            />
          ) : (
            <Input
              key="global-search"
              name="query"
              aria-label="메일 검색"
              placeholder="메일 검색"
              className="h-9 rounded-md bg-muted/50 pl-9 shadow-none"
            />
          )}
        </form>

        <div className="flex shrink-0 items-center gap-1">
          <NotificationSettingsLink />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden bg-sidebar">
        <AppSidebar
          mailbox={mailbox}
          activeAccountId={accountId}
          onMailboxChange={(nextMailbox) => {
            void navigate({
              to: "/mail/$mailbox",
              params: { mailbox: nextMailbox },
              search: {
                ...(mailbox && query ? { query } : {}),
                ...(mailbox && filter === "unread" ? { filter: filter } : {}),
                ...(mailbox && accountId ? { accountId } : {}),
              },
            })
          }}
          onAccountToggle={(nextAccountId) => {
            void navigate({
              to: "/mail/$mailbox",
              params: { mailbox: mailbox ?? "inbox" },
              search: (previous) => ({
                ...previous,
                accountId: previous.accountId === nextAccountId ? undefined : nextAccountId,
                thread: undefined,
              }),
              replace: true,
            })
          }}
          className="top-14 h-[calc(100svh-3.5rem)]"
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="relative m-2 mt-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl bg-background shadow-sm md:ml-0">
            <Outlet />
          </div>
        </div>
      </div>
      <PushNotificationListener />
    </SidebarProvider>
  )
}
