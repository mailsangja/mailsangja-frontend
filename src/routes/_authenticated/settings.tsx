import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router"
import { Settings, Tag, User } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsLayout,
})

const settingsTabRoutes = {
  general: "/settings",
  account: "/settings/account",
  label: "/settings/label",
} as const

function SettingsLayout() {
  const pathname = useLocation({ select: (location) => location.pathname })
  const navigate = useNavigate()
  const activeTab = pathname.startsWith(settingsTabRoutes.account)
    ? "account"
    : pathname.startsWith(settingsTabRoutes.label)
      ? "label"
      : "general"

  return (
    <div className="flex min-h-0 flex-1 flex-col p-6">
      <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">설정</h1>
          <p className="text-sm text-muted-foreground">메일상자 계정 및 메일 환경을 한 곳에서 관리합니다.</p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            if (value === activeTab) {
              return
            }

            void navigate({ to: settingsTabRoutes[value as keyof typeof settingsTabRoutes] })
          }}
          className="min-h-0 flex-1 gap-6"
        >
          <TabsList variant="line" className="w-full justify-start border-b">
            <TabsTrigger value="general" className="min-w-24 rounded-none px-4">
              <Settings data-icon="inline-start" />
              일반
            </TabsTrigger>
            <TabsTrigger value="account" className="min-w-24 rounded-none px-4">
              <User data-icon="inline-start" />
              계정
            </TabsTrigger>
            <TabsTrigger value="label" className="min-w-24 rounded-none px-4">
              <Tag data-icon="inline-start" />
              라벨
            </TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="flex min-h-0 flex-col">
            <Outlet />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
