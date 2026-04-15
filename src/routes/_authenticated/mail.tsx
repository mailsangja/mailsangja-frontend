import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/mail")({
  component: MailLayout,
})

function MailLayout() {
  return <Outlet />
}
