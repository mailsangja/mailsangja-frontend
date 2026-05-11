import { createFileRoute, Link, Outlet, useLocation, useMatch, useNavigate } from "@tanstack/react-router"
import { Settings, Tag, User } from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLabels } from "@/queries/labels"

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

  const labelDetailMatch = useMatch({ from: "/_authenticated/settings/label/$labelId", shouldThrow: false })
  const labelId = labelDetailMatch?.params.labelId

  const { data: labels } = useLabels()
  const labelName = labelId ? (labels?.find((l) => String(l.id) === labelId)?.name ?? labelId) : undefined

  const isNested = activeTab !== "general"
  const isLabelDetail = !!labelId

  return (
    <div className="flex min-h-0 flex-1 flex-col p-6">
      <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col gap-6">
        <div className="flex flex-col gap-1">
          <Breadcrumb>
            <BreadcrumbList className="text-2xl font-semibold [&>li[role=presentation]>svg]:size-5">
              <BreadcrumbItem>
                {isNested ? (
                  <BreadcrumbLink render={<Link to="/settings" />}>설정</BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="font-semibold">설정</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {activeTab === "label" && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isLabelDetail ? (
                      <BreadcrumbLink render={<Link to="/settings/label" />}>라벨</BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="font-semibold">라벨</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </>
              )}
              {activeTab === "account" && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-semibold">계정</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
              {isLabelDetail && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-semibold">{labelName}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
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
