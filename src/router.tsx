import { createRouter } from "@tanstack/react-router"

import { NotFoundComponent } from "@/components/layout/not-found-page"
import { queryClient } from "@/lib/query-client"
import { routeTree } from "@/routeTree.gen"

export function getRouter() {
  const router = createRouter({
    routeTree,
    defaultPreload: "intent",
    notFoundMode: "fuzzy",
    defaultNotFoundComponent: NotFoundComponent,
    context: {
      queryClient,
    },
  })

  if (typeof window !== "undefined") {
    void import("@/lib/analytics").then(({ initAnalytics, trackPageView }) => {
      initAnalytics()
      trackPageView(router.state.location.href)
      router.subscribe("onResolved", ({ hrefChanged, toLocation }) => {
        if (hrefChanged) {
          trackPageView(toLocation.href)
        }
      })
    })
  }

  return router
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
