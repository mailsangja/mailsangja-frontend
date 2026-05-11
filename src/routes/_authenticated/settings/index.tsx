import { Link, createFileRoute } from "@tanstack/react-router"

import { NotificationSettingsCard } from "@/components/notification-settings-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/_authenticated/settings/")({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 px-3 pt-1 pb-4">
      <Card>
        <CardHeader>
          <CardTitle>설정 홈</CardTitle>
          <CardDescription>메일상자 환경과 연결된 계정을 여기서 관리할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <Button variant="outline" render={<Link to="/settings/account" />}>
              계정 설정으로 이동
            </Button>
          </div>
        </CardContent>
      </Card>

      <NotificationSettingsCard />
    </div>
  )
}
