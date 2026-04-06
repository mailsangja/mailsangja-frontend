import { Outlet, createRootRouteWithContext } from "@tanstack/react-router"

import { ThemeProvider } from "@/components/theme-provider"
import type { RouterContext } from "@/types/router"

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <ThemeProvider>
      <Outlet />
    </ThemeProvider>
  )
}
