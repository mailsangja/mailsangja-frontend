import { Outlet, createRootRouteWithContext } from "@tanstack/react-router"

import { RootNotFoundComponent } from "@/components/layout/not-found-page"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import type { RouterContext } from "@/types/router"

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: RootNotFoundComponent,
})

function RootComponent() {
  return (
    <ThemeProvider>
      <Outlet />
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  )
}
