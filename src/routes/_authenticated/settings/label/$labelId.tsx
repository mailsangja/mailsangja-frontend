import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getErrorMessage } from "@/lib/http-error"
import { useUpdateLabelRule } from "@/mutations/labels"
import { useLabelDetail } from "@/queries/labels"
import type { ConditionField, ConditionOperator, LabelCondition } from "@/types/label"

export const Route = createFileRoute("/_authenticated/settings/label/$labelId")({
  component: LabelDetailPage,
})

const FIELD_LABELS: Record<ConditionField, string> = {
  MAIL_ACCOUNT: "메일 계정",
  FROM_ADDRESS: "보낸 사람 (주소)",
  FROM_DOMAIN: "보낸 사람 (도메인)",
  TO_ADDRESS: "받는 사람",
  CC_ADDRESS: "참조",
  SUBJECT: "제목",
  BODY_TEXT: "본문",
  HAS_ATTACHMENT: "첨부파일",
}

const OPERATOR_LABELS: Record<ConditionOperator, string> = {
  EQUALS: "같음",
  CONTAINS: "포함",
  NOT_CONTAINS: "미포함",
  BOOLEAN: "해당함 여부",
}

const FIELD_OPTIONS: { value: ConditionField; label: string }[] = [
  { value: "MAIL_ACCOUNT", label: "메일 계정" },
  { value: "FROM_ADDRESS", label: "보낸 사람 (주소)" },
  { value: "FROM_DOMAIN", label: "보낸 사람 (도메인)" },
  { value: "TO_ADDRESS", label: "받는 사람" },
  { value: "CC_ADDRESS", label: "참조" },
  { value: "SUBJECT", label: "제목" },
  { value: "BODY_TEXT", label: "본문" },
  { value: "HAS_ATTACHMENT", label: "첨부파일" },
]

const OPERATOR_OPTIONS: { value: ConditionOperator; label: string }[] = [
  { value: "CONTAINS", label: "포함" },
  { value: "EQUALS", label: "같음" },
  { value: "NOT_CONTAINS", label: "미포함" },
]

function AddConditionDialog({ onAdd }: { onAdd: (condition: LabelCondition) => void }) {
  const [open, setOpen] = useState(false)
  const [field, setField] = useState<ConditionField>("FROM_ADDRESS")
  const [operator, setOperator] = useState<ConditionOperator>("CONTAINS")
  const [value, setValue] = useState("")

  const isAttachment = field === "HAS_ATTACHMENT"

  function handleFieldChange(newField: ConditionField) {
    setField(newField)
    if (newField === "HAS_ATTACHMENT") {
      setOperator("BOOLEAN")
      setValue("true")
    } else {
      if (operator === "BOOLEAN") setOperator("CONTAINS")
      setValue("")
    }
  }

  function handleAdd() {
    if (!isAttachment && !value.trim()) return
    onAdd({ field, operator: isAttachment ? "BOOLEAN" : operator, value: isAttachment ? "true" : value.trim() })
    setField("FROM_ADDRESS")
    setOperator("CONTAINS")
    setValue("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Plus data-icon="inline-start" />
        조건 추가
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>조건 추가</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label>필드</Label>
            <Select value={field} onValueChange={(v) => handleFieldChange(v as ConditionField)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FIELD_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {!isAttachment && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label>연산자</Label>
                <Select value={operator} onValueChange={(v) => setOperator(v as ConditionOperator)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATOR_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>값</Label>
                <Input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  placeholder="조건 값을 입력하세요"
                  autoFocus
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button onClick={handleAdd} disabled={!isAttachment && !value.trim()}>
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function LabelDetailPage() {
  const { labelId } = Route.useParams()
  const { data: label, isPending, isError } = useLabelDetail(labelId)
  const updateRule = useUpdateLabelRule()
  const [conditions, setConditions] = useState<LabelCondition[] | null>(null)

  const displayConditions = conditions ?? label?.rule?.groups[0]?.conditions ?? []
  const isDirty = conditions !== null

  function handleAdd(condition: LabelCondition) {
    setConditions([...displayConditions, condition])
  }

  function handleRemove(index: number) {
    setConditions(displayConditions.filter((_, i) => i !== index))
  }

  function handleSave() {
    const otherGroups = label?.rule?.groups.slice(1) ?? []
    updateRule.mutate(
      {
        labelId,
        data: { rule: { groups: [{ conditions: displayConditions }, ...otherGroups] } },
      },
      {
        onSuccess: () => {
          setConditions(null)
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
            <CardAction>
              <AddConditionDialog onAdd={handleAdd} />
            </CardAction>
          </CardHeader>
          <CardContent className="px-0">

              <p className="px-4 py-2 text-sm text-muted-foreground">설정된 필터 조건이 없습니다.</p>
            ) : (
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
                  {displayConditions.map((condition, index) => (
                    <TableRow key={index}>
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
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleRemove(index)}
                          aria-label="조건 삭제"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
          {isDirty && (
            <CardFooter className="justify-end gap-2">
              <Button variant="ghost" onClick={() => setConditions(null)} disabled={updateRule.isPending}>
                취소
              </Button>
              <Button onClick={handleSave} disabled={updateRule.isPending}>
                {updateRule.isPending ? "저장 중..." : "저장하기"}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </ScrollArea>
  )
}
