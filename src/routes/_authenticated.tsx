import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { Loader2 } from "lucide-react"

import { LoadingLayout } from "@/components/layout/loading-layout"
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

  return <Outlet />
}
