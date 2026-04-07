import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

import { LoadingLayout } from "@/components/layout/loading-layout"
import { userQueries } from "@/queries/user"

export const Route = createFileRoute("/_guest")({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(userQueries.me())

    if (user) {
      throw redirect({ to: "/inbox" })
    }
  },
  pendingComponent: LoadingLayout,
  component: GuestRouteLayout,
})

function GuestRouteLayout() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  )
}
