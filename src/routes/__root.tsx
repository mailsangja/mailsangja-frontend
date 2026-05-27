import { useEffect } from "react"
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router"

import { RootNotFoundComponent } from "@/components/layout/not-found-page"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { getCurrentLocale, getCurrentTextDirection } from "@/lib/i18n"
import type { RouterContext } from "@/types/router"

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: RootNotFoundComponent,
})

function RootComponent() {
  useEffect(() => {
    document.documentElement.lang = getCurrentLocale()
    document.documentElement.dir = getCurrentTextDirection()
  }, [])

  return (
    <ThemeProvider>
      <Outlet />
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  )
}
