import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/_app/mail/")({
  beforeLoad: () => {
    throw redirect({
      to: "/mail/$mailbox",
      params: { mailbox: "inbox" },
      replace: true,
    })
  },
})
