import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/inbox")({
  component: InboxPage,
})

function InboxPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">인박스</h1>
      <p className="mt-2 text-muted-foreground">메일상자에 오신 것을 환영합니다.</p>
    </div>
  )
}
