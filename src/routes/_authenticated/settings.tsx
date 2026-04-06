import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">설정</h1>
      <p className="mt-2 text-muted-foreground">계정 및 메일 설정을 관리합니다.</p>
    </div>
  )
}
