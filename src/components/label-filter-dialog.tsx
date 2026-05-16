import { useState } from "react"
import { ListFilter } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getErrorMessage } from "@/lib/http-error"
import { useUpdateLabelRule } from "@/mutations/labels"
import { useLabelDetail, useLabels } from "@/queries/labels"
import type { LabelCondition } from "@/types/label"

interface FilterCriteria {
  mailAccount: string
  fromAddress: string
  fromDomain: string
  toAddress: string
  ccAddress: string
  subject: string
  bodyText: string
  hasAttachment: boolean
}

const EMPTY_CRITERIA: FilterCriteria = {
  mailAccount: "",
  fromAddress: "",
  fromDomain: "",
  toAddress: "",
  ccAddress: "",
  subject: "",
  bodyText: "",
  hasAttachment: false,
}

function buildConditions(criteria: FilterCriteria): LabelCondition[] {
  const conditions: LabelCondition[] = []
  if (criteria.mailAccount.trim())
    conditions.push({ field: "MAIL_ACCOUNT", operator: "EQUALS", value: criteria.mailAccount.trim() })
  if (criteria.fromAddress.trim())
    conditions.push({ field: "FROM_ADDRESS", operator: "CONTAINS", value: criteria.fromAddress.trim() })
  if (criteria.fromDomain.trim())
    conditions.push({ field: "FROM_DOMAIN", operator: "CONTAINS", value: criteria.fromDomain.trim() })
  if (criteria.toAddress.trim())
    conditions.push({ field: "TO_ADDRESS", operator: "CONTAINS", value: criteria.toAddress.trim() })
  if (criteria.ccAddress.trim())
    conditions.push({ field: "CC_ADDRESS", operator: "CONTAINS", value: criteria.ccAddress.trim() })
  if (criteria.subject.trim())
    conditions.push({ field: "SUBJECT", operator: "CONTAINS", value: criteria.subject.trim() })
  if (criteria.bodyText.trim())
    conditions.push({ field: "BODY_TEXT", operator: "CONTAINS", value: criteria.bodyText.trim() })
  if (criteria.hasAttachment) conditions.push({ field: "HAS_ATTACHMENT", operator: "BOOLEAN", value: "true" })
  return conditions
}

function CriteriaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <span className="py-0.5 text-sm text-muted-foreground">{label}</span>
      {children}
    </>
  )
}

interface LabelFilterDialogProps {
  /** controlled 모드: open이 제공되면 트리거 버튼을 렌더링하지 않습니다 */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** 다이얼로그를 열 때 미리 선택할 라벨 ID */
  defaultLabelId?: string
}

export function LabelFilterDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  defaultLabelId,
}: LabelFilterDialogProps = {}) {
  const isControlled = controlledOpen !== undefined
  const [internalOpen, setInternalOpen] = useState(false)
  const open = isControlled ? controlledOpen! : internalOpen

  const [criteria, setCriteria] = useState<FilterCriteria>(EMPTY_CRITERIA)
  const [labelId, setLabelId] = useState(defaultLabelId ?? "")

  const { data: labels = [] } = useLabels()
  const { data: selectedLabel } = useLabelDetail(labelId)
  const selectedLabelItem = labels.find((l) => l.id === labelId)
  const updateRule = useUpdateLabelRule()

  const conditions = buildConditions(criteria)
  const hasCriteria = conditions.length > 0
  const canCreate = !!labelId && hasCriteria

  function reset() {
    setCriteria(EMPTY_CRITERIA)
    setLabelId(defaultLabelId ?? "")
  }

  function handleOpenChange(o: boolean) {
    if (!isControlled) setInternalOpen(o)
    controlledOnOpenChange?.(o)
    if (!o) reset()
  }

  function handleCreate() {
    if (!canCreate) return
    const existingGroups = selectedLabel?.rule?.groups ?? []
    updateRule.mutate(
      { labelId, data: { rule: { groups: [...existingGroups, { conditions }] } } },
      {
        onSuccess: () => {
          toast.success("필터가 생성되었습니다.")
          handleOpenChange(false)
        },
        onError: (e) => toast.error(getErrorMessage(e, "필터 생성에 실패했습니다.")),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <DialogTrigger render={<Button variant="outline" />}>
          <ListFilter data-icon="inline-start" />
          필터 만들기
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle>필터 만들기</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-2.5">
          <CriteriaRow label="메일 계정">
            <Input
              value={criteria.mailAccount}
              onChange={(e) => setCriteria((c) => ({ ...c, mailAccount: e.target.value }))}
              className="h-8"
              autoFocus
            />
          </CriteriaRow>
          <CriteriaRow label="보낸 주소">
            <Input
              value={criteria.fromAddress}
              onChange={(e) => setCriteria((c) => ({ ...c, fromAddress: e.target.value }))}
              className="h-8"
            />
          </CriteriaRow>
          <CriteriaRow label="보낸 도메인">
            <Input
              value={criteria.fromDomain}
              onChange={(e) => setCriteria((c) => ({ ...c, fromDomain: e.target.value }))}
              className="h-8"
            />
          </CriteriaRow>
          <CriteriaRow label="받는 주소">
            <Input
              value={criteria.toAddress}
              onChange={(e) => setCriteria((c) => ({ ...c, toAddress: e.target.value }))}
              className="h-8"
            />
          </CriteriaRow>
          <CriteriaRow label="참조">
            <Input
              value={criteria.ccAddress}
              onChange={(e) => setCriteria((c) => ({ ...c, ccAddress: e.target.value }))}
              className="h-8"
            />
          </CriteriaRow>
          <CriteriaRow label="제목">
            <Input
              value={criteria.subject}
              onChange={(e) => setCriteria((c) => ({ ...c, subject: e.target.value }))}
              className="h-8"
            />
          </CriteriaRow>
          <CriteriaRow label="본문">
            <Input
              value={criteria.bodyText}
              onChange={(e) => setCriteria((c) => ({ ...c, bodyText: e.target.value }))}
              className="h-8"
            />
          </CriteriaRow>
          <span />
          <label className="flex cursor-pointer items-center gap-2 py-0.5 text-sm">
            <Checkbox
              checked={criteria.hasAttachment}
              onCheckedChange={(checked) => setCriteria((c) => ({ ...c, hasAttachment: checked === true }))}
            />
            첨부파일 있음
          </label>
        </div>

        <div className="flex items-center gap-3 border-t pt-4">
          <span className="shrink-0 text-sm text-muted-foreground">적용할 라벨</span>
          <Select value={labelId} onValueChange={(v) => setLabelId(v ?? "")}>
            <SelectTrigger className="h-8 flex-1">
              {selectedLabelItem ? (
                <span className="flex flex-1 items-center gap-1.5 truncate text-sm">
                  <span
                    className="inline-block size-3 shrink-0 rounded-sm"
                    style={{ backgroundColor: selectedLabelItem.colorCode }}
                  />
                  {selectedLabelItem.name}
                </span>
              ) : (
                <SelectValue placeholder="라벨 선택..." />
              )}
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} className="min-w-32">
              {labels.map((label) => (
                <SelectItem key={label.id} value={label.id}>
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="inline-block size-3 shrink-0 rounded-sm"
                      style={{ backgroundColor: label.colorCode }}
                    />
                    {label.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleCreate} disabled={!canCreate || updateRule.isPending}>
            {updateRule.isPending ? "적용 중..." : "적용"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
