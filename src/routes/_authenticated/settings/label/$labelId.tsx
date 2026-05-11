import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/settings/label/$labelId")({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/settings/label/$labelId"!</div>
}
