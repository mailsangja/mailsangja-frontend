import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

import { LoadingLayout } from "@/components/layout/loading-layout"
import { userQueries } from "@/queries/user"

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(userQueries.me())

    if (!user) {
      throw redirect({ to: "/login" })
    }
  },
  pendingComponent: LoadingLayout,
  component: AuthenticatedRoute,
})

function AuthenticatedRoute() {
  return <Outlet />
}
