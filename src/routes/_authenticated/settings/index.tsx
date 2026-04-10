import { Link, createFileRoute } from "@tanstack/react-router"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/_authenticated/settings/")({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
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

      <Card>
        <CardHeader>
          <CardTitle>준비 중인 항목</CardTitle>
          <CardDescription>알림 설정, 라벨 관리 같은 일반 설정은 이후 단계에서 추가될 예정입니다.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
