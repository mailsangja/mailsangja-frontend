import { useState } from "react"
import { ArrowLeft, ListFilter } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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

export function LabelFilterDialog() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const [criteria, setCriteria] = useState<FilterCriteria>(EMPTY_CRITERIA)
  const [applyLabel, setApplyLabel] = useState(true)
  const [labelId, setLabelId] = useState("")

  const { data: labels = [] } = useLabels()
  const { data: selectedLabel } = useLabelDetail(labelId)
  const selectedLabelItem = labels.find((l) => l.id === labelId)
  const updateRule = useUpdateLabelRule()

  const conditions = buildConditions(criteria)
  const hasCriteria = conditions.length > 0
  const canCreate = applyLabel && !!labelId && hasCriteria

  function reset() {
    setStep(1)
    setCriteria(EMPTY_CRITERIA)
    setApplyLabel(true)
    setLabelId("")
  }

  function handleCreate() {
    if (!canCreate) return
    const existingGroups = selectedLabel?.rule?.groups ?? []
    updateRule.mutate(
      {
        labelId,
        data: { rule: { groups: [...existingGroups, { conditions }] } },
      },
      {
        onSuccess: () => {
          toast.success("필터가 생성되었습니다.")
          setOpen(false)
          reset()
        },
        onError: (e) => toast.error(getErrorMessage(e, "필터 생성에 실패했습니다.")),
      }
    )
  }

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) reset()
      }}
    >
      <PopoverTrigger render={<Button variant="ghost" size="icon-sm" aria-label="필터 만들기" title="필터 만들기" />}>
        <ListFilter className="size-4" />
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={6} className="w-[min(570px,calc(100vw-2rem))] gap-0 p-0">
        {step === 1 ? (
          <div className="p-4">
            <div className="grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-2.5">
              <CriteriaRow label="메일 계정">
                <Input
                  value={criteria.mailAccount}
                  onChange={(e) => setCriteria((c) => ({ ...c, mailAccount: e.target.value }))}
                  className="h-8"
                  autoFocus
                />
              </CriteriaRow>
              <CriteriaRow label="보낸사람">
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
              <CriteriaRow label="받는사람">
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
              <CriteriaRow label="포함하는 단어">
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
            <div className="-mx-4 mt-4 flex justify-end border-t px-4 pt-3">
              <Button variant="ghost" size="sm" onClick={() => setStep(2)} disabled={!hasCriteria}>
                필터 만들기
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="mb-4 flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                className="-ml-1"
                onClick={() => setStep(1)}
                aria-label="이전 단계"
              >
                <ArrowLeft className="size-4" />
              </Button>
              <span className="text-sm font-medium">메일이 검색 기준에 정확히 일치하는 경우</span>
            </div>

            <label className="flex cursor-pointer items-center gap-3">
              <Checkbox
                checked={applyLabel}
                onCheckedChange={(checked) => {
                  setApplyLabel(checked === true)
                  if (checked !== true) setLabelId("")
                }}
              />
              <span className="text-sm">다음 라벨 적용:</span>
              <Select
                value={labelId}
                onValueChange={(v) => {
                  setLabelId(v ?? "")
                  setApplyLabel(true)
                }}
              >
                <SelectTrigger className="h-7 w-64" disabled={!applyLabel}>
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
            </label>

            <div className="-mx-4 mt-4 flex justify-end border-t px-4 pt-3">
              <Button size="sm" onClick={handleCreate} disabled={!canCreate || updateRule.isPending}>
                {updateRule.isPending ? "적용 중..." : "적용"}
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
