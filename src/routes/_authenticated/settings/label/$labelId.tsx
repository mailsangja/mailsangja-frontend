import { useState, type ElementType } from "react"
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router"
import { BellRing, Bell, BellOff, Plus, X, ChevronLeft, ChevronDown } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { LabelConditionList } from "@/components/label/label-condition-list"
import { LabelDeleteDialog } from "@/components/label/label-delete-dialog"
import { LabelRuleDialog } from "@/components/label/label-rule-dialog"
import { getErrorMessage } from "@/lib/http-error"
import { LABEL_COLORS } from "@/lib/label-colors"
import { cn } from "@/lib/utils"
import { useUpdateLabel, useUpdateLabelRule } from "@/mutations/labels"
import { useLabelDetail } from "@/queries/labels"
import { NOTIFICATION_POLICY_LABELS, type LabelDetail, type NotificationPolicy } from "@/types/label"

export const Route = createFileRoute("/_authenticated/settings/label/$labelId")({
  component: LabelDetailPage,
})

const NOTIFICATION_OPTIONS: { value: NotificationPolicy; icon: ElementType }[] = [
  { value: "URGENT", icon: BellRing },
  { value: "INHERIT", icon: Bell },
  { value: "SILENT", icon: BellOff },
]

function LabelDetailPage() {
  const { labelId } = Route.useParams()
  const { data: label, isPending, isError } = useLabelDetail(labelId)

  if (isPending) {
    return (
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-6 px-3 pt-1 pb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="size-3.5 shrink-0 rounded-sm" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-3.5 w-64" />
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {[0, 1].map((i) => (
                <div key={i} className="overflow-hidden rounded-lg border">
                  <div className="flex items-center justify-between bg-muted/50 px-3 py-1.5">
                    <Skeleton className="h-3.5 w-10" />
                    <Skeleton className="size-7 rounded-md" />
                  </div>
                  <div className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-20 rounded-full" />
                      <Skeleton className="h-3.5 w-8" />
                      <Skeleton className="h-5 w-36 rounded-sm" />
                    </div>
                  </div>
                </div>
              ))}
              <Skeleton className="h-9 w-full rounded-md" />
            </CardContent>
          </Card>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        </div>
      </ScrollArea>
    )
  }

  if (isError || !label) {
    return (
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-6 px-3 pt-1 pb-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">라벨을 불러오지 못했습니다</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </ScrollArea>
    )
  }

  return <LabelDetailContent key={labelId} labelId={labelId} label={label} />
}

function LabelDetailContent({ labelId, label }: { labelId: string; label: LabelDetail }) {
  const navigate = useNavigate()
  const updateLabel = useUpdateLabel()
  const updateRule = useUpdateLabelRule()

  const [ruleDialogOpen, setRuleDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [name, setName] = useState(label.name)
  const [selectedColor, setSelectedColor] = useState(label.colorCode)
  const [notificationPolicy, setNotificationPolicy] = useState<NotificationPolicy>(label.notificationPolicy)

  const groups = label.rule?.groups ?? []
  const [collapsedGroups, setCollapsedGroups] = useState<Set<number>>(new Set())

  function toggleGroup(index: number) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  function handleDeleteGroup(groupIndex: number) {
    setCollapsedGroups((prev) => {
      const next = new Set<number>()
      for (const i of prev) {
        if (i < groupIndex) next.add(i)
        else if (i > groupIndex) next.add(i - 1)
      }
      return next
    })
    const newGroups = groups.filter((_, i) => i !== groupIndex)
    updateRule.mutate(
      { labelId, data: { groups: newGroups } },
      {
        onSuccess: () => toast.success("규칙이 삭제되었습니다."),
        onError: (e) => toast.error(getErrorMessage(e, "규칙 삭제에 실패했습니다.")),
      }
    )
  }

  function handleSaveNotification(policy: NotificationPolicy) {
    setNotificationPolicy(policy)
    updateLabel.mutate(
      { labelId, data: { notificationPolicy: policy } },
      {
        onSuccess: () => toast.success("알림 설정이 변경되었습니다."),
        onError: (e) => {
          setNotificationPolicy(label.notificationPolicy)
          toast.error(getErrorMessage(e, "알림 설정 변경에 실패했습니다."))
        },
      }
    )
  }

  function handleSaveName() {
    const trimmed = name.trim()
    if (!trimmed || trimmed === label.name) return
    updateLabel.mutate(
      { labelId, data: { name: trimmed } },
      {
        onSuccess: () => toast.success("라벨 이름이 변경되었습니다."),
        onError: (e) => {
          setName(label.name)
          toast.error(getErrorMessage(e, "라벨 이름 변경에 실패했습니다."))
        },
      }
    )
  }

  function handleSaveColor() {
    if (selectedColor === label.colorCode) return
    updateLabel.mutate(
      { labelId, data: { colorCode: selectedColor } },
      {
        onSuccess: () => toast.success("라벨 색상이 변경되었습니다."),
        onError: (e) => {
          setSelectedColor(label.colorCode)
          toast.error(getErrorMessage(e, "라벨 색상 변경에 실패했습니다."))
        },
      }
    )
  }

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="flex flex-col gap-4 px-6 pb-4">
        <Link to="/settings/label" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <ChevronLeft className="size-4" />
          뒤로
        </Link>
        <section className="flex flex-col gap-3">
          <Card>
            <CardHeader>
              <CardTitle>라벨 규칙 관리</CardTitle>
              <CardDescription>
                이 라벨에 자동으로 분류될 메일의 규칙을 설정합니다. 규칙이 여러 개이면 하나라도 만족하면 분류됩니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {groups.map((group, groupIndex) => {
                const isExpanded = !collapsedGroups.has(groupIndex)
                return (
                  <div key={groupIndex} className="overflow-hidden rounded-xl border bg-card">
                    <div className="flex items-center gap-1 p-2.5">
                      <button
                        type="button"
                        className="flex min-w-0 flex-1 items-center gap-2 text-left"
                        onClick={() => toggleGroup(groupIndex)}
                      >
                        <ChevronDown
                          className={cn(
                            "size-4 shrink-0 text-muted-foreground transition-transform",
                            isExpanded ? "rotate-0" : "-rotate-90"
                          )}
                        />
                        <span className="text-sm font-medium">규칙 {groupIndex + 1}</span>
                      </button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDeleteGroup(groupIndex)}
                        disabled={updateRule.isPending}
                        aria-label="규칙 삭제"
                      >
                        <X className="size-4 text-muted-foreground" />
                      </Button>
                    </div>
                    {isExpanded && (
                      <div className="border-t px-4 py-3">
                        <LabelConditionList conditions={group.conditions} />
                      </div>
                    )}
                  </div>
                )
              })}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setRuleDialogOpen(true)}
                disabled={updateRule.isPending}
              >
                <Plus className="size-4" />
                규칙 추가
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="flex flex-col gap-3">
          <Card>
            <CardHeader>
              <CardTitle>알림 설정</CardTitle>
              <CardDescription>
                알림 설정은 <strong>항상 알림 ＞ 알림 안함 ＞ 기본</strong> 순으로 우선순위를 가집니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {NOTIFICATION_OPTIONS.map(({ value, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleSaveNotification(value)}
                    disabled={updateLabel.isPending}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors",
                      notificationPolicy === value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="size-3.5" />
                    {NOTIFICATION_POLICY_LABELS[value]}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="flex flex-col gap-3">
          <Card>
            <CardHeader>
              <CardTitle>이름 변경</CardTitle>
              <CardDescription>라벨의 이름을 변경합니다.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                placeholder="라벨 이름"
                className="w-2/5"
              />
              <Button
                onClick={handleSaveName}
                disabled={!name.trim() || name.trim() === label.name || updateLabel.isPending}
              >
                저장
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="flex flex-col gap-3">
          <Card>
            <CardHeader>
              <CardTitle>색상 변경</CardTitle>
              <CardDescription>라벨의 색상을 변경합니다.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="grid grid-cols-10 place-items-center gap-1.5">
                {LABEL_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="size-6 rounded-full ring-offset-2 transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    style={{
                      backgroundColor: color,
                      boxShadow: selectedColor === color ? `0 0 0 2px white, 0 0 0 4px ${color}` : undefined,
                    }}
                    onClick={() => setSelectedColor(color)}
                    aria-label={color}
                    aria-pressed={selectedColor === color}
                  />
                ))}
              </div>
              <Button
                onClick={handleSaveColor}
                disabled={selectedColor === label.colorCode || updateLabel.isPending}
                className="w-full"
              >
                저장
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="flex flex-col gap-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">라벨 삭제</CardTitle>
              <CardDescription>라벨을 삭제하면 해당 라벨이 적용된 메일에서 라벨이 제거됩니다.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
                삭제
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>

      <LabelRuleDialog open={ruleDialogOpen} onOpenChange={setRuleDialogOpen} labelId={labelId} />

      <LabelDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        label={label}
        onSuccess={() => void navigate({ to: "/settings/label" })}
      />
    </ScrollArea>
  )
}
