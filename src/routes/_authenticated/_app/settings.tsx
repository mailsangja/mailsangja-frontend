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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { m } from "@/paraglide/messages"
import { useLabels } from "@/queries/labels"

export const Route = createFileRoute("/_authenticated/_app/settings")({
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

  const labelDetailMatch = useMatch({ from: "/_authenticated/_app/settings/label/$labelId", shouldThrow: false })
  const labelId = labelDetailMatch?.params.labelId

  const { data: labels } = useLabels()
  const labelName = labelId ? (labels?.find((l) => String(l.id) === labelId)?.name ?? labelId) : undefined

  const isNested = activeTab !== "general"
  const isLabelDetail = !!labelId

  return (
    <div className="flex min-h-0 flex-1 flex-col p-0">
      <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col gap-0">
        <div className="flex flex-col gap-1 px-6 py-4 sm:pt-5">
          <Breadcrumb>
            <BreadcrumbList className="text-2xl font-semibold [&>li[role=presentation]>svg]:size-5">
              <BreadcrumbItem>
                {isNested ? (
                  <BreadcrumbLink render={<Link to="/settings" />}>{m.settings_title()}</BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="font-semibold">{m.settings_title()}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {activeTab === "label" && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isLabelDetail ? (
                      <BreadcrumbLink render={<Link to="/settings/label" />}>{m.settings_label()}</BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="font-semibold">{m.settings_label()}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </>
              )}
              {activeTab === "account" && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-semibold">{m.settings_mail_account()}</BreadcrumbPage>
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
          <p className="text-sm text-muted-foreground">{m.settings_description()}</p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            if (value === activeTab) {
              return
            }

            void navigate({ to: settingsTabRoutes[value as keyof typeof settingsTabRoutes] })
          }}
          className="min-h-0 flex-1"
        >
          <TabsList variant="line" className="w-full justify-start border-b">
            <TabsTrigger value="general" className="min-w-24 rounded-none px-4">
              <Settings data-icon="inline-start" />
              {m.settings_general()}
            </TabsTrigger>
            <TabsTrigger value="account" className="min-w-24 rounded-none px-4">
              <User data-icon="inline-start" />
              {m.settings_mail_account()}
            </TabsTrigger>
            <TabsTrigger value="label" className="min-w-24 rounded-none px-4">
              <Tag data-icon="inline-start" />
              {m.settings_label()}
            </TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="flex min-h-0 flex-col">
            <ScrollArea className="min-h-0 flex-1">
              <div className="flex flex-col gap-4 px-4 pt-2 pb-4 sm:px-6 sm:pt-4">
                <Outlet />
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
