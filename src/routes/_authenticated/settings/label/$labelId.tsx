import { useState } from "react"
import { Link, createFileRoute } from "@tanstack/react-router"
import { ArrowLeft, Minus, Plus } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LabelFilterDialog } from "@/components/label-filter-dialog"
import { getErrorMessage } from "@/lib/http-error"
import { FIELD_LABELS, OPERATOR_LABELS } from "@/lib/label-rule"
import { useUpdateLabelRule } from "@/mutations/labels"
import { useLabelDetail } from "@/queries/labels"
import type { LabelCondition } from "@/types/label"

export const Route = createFileRoute("/_authenticated/settings/label/$labelId")({
  component: LabelDetailPage,
})

function LabelDetailPage() {
  const { labelId } = Route.useParams()
  const { data: label, isPending, isError } = useLabelDetail(labelId)
  const updateRule = useUpdateLabelRule()
  const [isEditing, setIsEditing] = useState(false)
  const [editGroups, setEditGroups] = useState<{ conditions: LabelCondition[] }[] | null>(null)
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)

  const savedGroups = label?.rule?.groups ?? []
  const displayGroups = editGroups ?? savedGroups
  const totalConditions = displayGroups.reduce((sum, g) => sum + g.conditions.length, 0)

  function startEditing() {
    setEditGroups(savedGroups.map((g) => ({ conditions: [...g.conditions] })))
    setIsEditing(true)
  }

  function cancelEditing() {
    setEditGroups(null)
    setIsEditing(false)
  }

  function handleRemove(groupIndex: number, conditionIndex: number) {
    setEditGroups((prev) =>
      prev!
        .map((g, gi) => (gi === groupIndex ? { conditions: g.conditions.filter((_, ci) => ci !== conditionIndex) } : g))
        .filter((g) => g.conditions.length > 0)
    )
  }

  function handleSave() {
    const groups = editGroups!.filter((g) => g.conditions.length > 0)
    updateRule.mutate(
      {
        labelId,
        data: { rule: { groups } },
      },
      {
        onSuccess: () => {
          setEditGroups(null)
          setIsEditing(false)
          toast.success("필터 규칙이 저장되었습니다.")
        },
        onError: (e) => toast.error(getErrorMessage(e, "필터 규칙 저장에 실패했습니다.")),
      }
    )
  }

  if (isPending) {
    return (
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-6 px-3 pt-1 pb-4">
          <Card>
            <CardHeader>
              <CardTitle>불러오는 중...</CardTitle>
              <CardDescription>라벨 정보를 가져오고 있습니다.</CardDescription>
            </CardHeader>
          </Card>
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

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="flex flex-col gap-6 px-3 pt-1 pb-4">
        <div>
          <Link to="/settings/label" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            <ArrowLeft className="size-4" />
            라벨 목록
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span
                className="inline-block size-3.5 shrink-0 rounded-sm"
                style={{ backgroundColor: label.colorCode }}
              />
              {label.name}
            </CardTitle>
            <CardDescription>이 라벨에 자동으로 분류될 메일의 조건을 설정합니다.</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>필드</TableHead>
                  <TableHead>연산자</TableHead>
                  <TableHead>값</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {totalConditions === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                      설정된 필터 조건이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  displayGroups.flatMap((group, groupIndex) => [
                    ...(groupIndex > 0
                      ? [
                          <TableRow key={`sep-${groupIndex}`} className="hover:bg-transparent">
                            <TableCell colSpan={4} className="py-1 text-center text-xs text-muted-foreground">
                              또는
                            </TableCell>
                          </TableRow>,
                        ]
                      : []),
                    ...group.conditions.map((condition, conditionIndex) => (
                      <TableRow key={`${groupIndex}-${conditionIndex}`}>
                        <TableCell>
                          <Badge variant="secondary" className="font-normal">
                            {FIELD_LABELS[condition.field]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {OPERATOR_LABELS[condition.operator]}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{condition.value}</TableCell>
                        <TableCell>
                          {isEditing && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleRemove(groupIndex, conditionIndex)}
                              aria-label="조건 삭제"
                            >
                              <Minus className="size-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )),
                  ])
                )}
                {!isEditing && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={4} className="p-0">
                      <button
                        type="button"
                        className="flex w-full cursor-pointer items-center justify-center py-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                        onClick={() => setFilterDialogOpen(true)}
                        aria-label="조건 추가"
                      >
                        <Plus className="size-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {!isEditing && (
              <div className="flex justify-end px-4 pt-3">
                <Button variant="outline" size="sm" onClick={startEditing} disabled={totalConditions === 0}>
                  수정하기
                </Button>
              </div>
            )}
          </CardContent>
          {isEditing && (
            <CardFooter className="justify-end gap-2">
              <Button variant="ghost" onClick={cancelEditing} disabled={updateRule.isPending}>
                취소
              </Button>
              <Button onClick={handleSave} disabled={updateRule.isPending}>
                {updateRule.isPending ? "저장 중..." : "저장하기"}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>

      <LabelFilterDialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen} defaultLabelId={labelId} />
    </ScrollArea>
  )
}
