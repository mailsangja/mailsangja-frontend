import { useEffect } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/_app/settings/label/$labelId")({
  component: LabelDetailRedirect,
})

function LabelDetailRedirect() {
  const { labelId } = Route.useParams()
  const navigate = useNavigate()

  useEffect(() => {
    void navigate({
      to: "/settings/label",
      search: { labelId },
      replace: true,
    })
  }, [labelId, navigate])

  return null
}
