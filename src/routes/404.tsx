import { createFileRoute } from "@tanstack/react-router"

import { RootNotFoundComponent } from "@/components/layout/not-found-page"

export const Route = createFileRoute("/404")({
  component: RootNotFoundComponent,
})
