import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { getErrorMessage, getHttpStatus } from "@/lib/http-error"
import { useCreateLabelGroup, useUpdateLabelGroup } from "@/mutations/labels"
import type { LabelGroupItem, LabelListItem } from "@/types/label"

function LabelPickerList({
  labels,
  selectedIds,
  onToggle,
}: {
  labels: LabelListItem[]
  selectedIds: string[]
  onToggle: (id: string) => void
}) {
  if (labels.length === 0) {
    return <div className="rounded-md border px-3 py-4 text-center text-xs text-muted-foreground">라벨이 없습니다</div>
  }
  return (
    <div className="max-h-48 space-y-0.5 overflow-y-auto rounded-md border p-1">
      {labels.map((label) => (
        <label key={label.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-muted">
          <Checkbox checked={selectedIds.includes(label.id)} onCheckedChange={() => onToggle(label.id)} />
          <span className="size-3 shrink-0 rounded-sm" style={{ backgroundColor: label.colorCode }} />
          <span className="truncate text-sm">{label.name}</span>
        </label>
      ))}
    </div>
  )
}

function LabelGroupFormDialog({
  open,
  onOpenChange,
  title,
  submitLabel,
  name,
  onNameChange,
  selectedLabelIds,
  onToggle,
  labels,
  onSubmit,
  isPending,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  submitLabel: string
  name: string
  onNameChange: (name: string) => void
  selectedLabelIds: string[]
  onToggle: (id: string) => void
  labels: LabelListItem[]
  onSubmit: () => void
  isPending: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <Input
            placeholder="그룹 이름"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            autoFocus
          />
          <div>
            <p className="mb-2 text-xs text-muted-foreground">라벨 선택</p>
            <LabelPickerList labels={labels} selectedIds={selectedLabelIds} onToggle={onToggle} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={onSubmit} disabled={!name.trim() || isPending}>
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface CreateLabelGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  labels: LabelListItem[]
  groups: LabelGroupItem[]
}

export function CreateLabelGroupDialog({ open, onOpenChange, labels, groups }: CreateLabelGroupDialogProps) {
  const [name, setName] = useState("")
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([])
  const createLabelGroup = useCreateLabelGroup()

  function handleCreate() {
    const trimmed = name.trim()
    if (!trimmed) return
    const maxOrder = groups.length > 0 ? Math.max(...groups.map((group) => group.order)) : 0
    createLabelGroup.mutate(
      { name: trimmed, labelIds: selectedLabelIds, order: maxOrder + 1 },
      {
        onSuccess: () => {
          onOpenChange(false)
          setName("")
          setSelectedLabelIds([])
          toast.success(`${trimmed} 그룹이 생성되었습니다`)
        },
        onError: (e) => {
          if (getHttpStatus(e) === 409) {
            toast.error("이미 존재하는 라벨 그룹입니다.")
          } else {
            toast.error(getErrorMessage(e, "라벨 그룹 생성에 실패했습니다."))
          }
        },
      }
    )
  }

  function toggleLabel(id: string) {
    setSelectedLabelIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  return (
    <LabelGroupFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="새 라벨 그룹 만들기"
      submitLabel="만들기"
      name={name}
      onNameChange={setName}
      selectedLabelIds={selectedLabelIds}
      onToggle={toggleLabel}
      labels={labels}
      onSubmit={handleCreate}
      isPending={createLabelGroup.isPending}
    />
  )
}

interface EditLabelGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: LabelGroupItem
  allLabels: LabelListItem[]
}

export function EditLabelGroupDialog({ open, onOpenChange, group, allLabels }: EditLabelGroupDialogProps) {
  const [name, setName] = useState(group.name)
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>(group.labelIds)
  const updateLabelGroup = useUpdateLabelGroup()

  function handleUpdate() {
    const trimmed = name.trim()
    if (!trimmed) return
    updateLabelGroup.mutate(
      { labelGroupId: group.id, data: { name: trimmed, labelIds: selectedLabelIds } },
      {
        onSuccess: () => {
          onOpenChange(false)
          toast.success(`${trimmed} 그룹이 수정되었습니다`)
        },
        onError: (e) => {
          if (getHttpStatus(e) === 409) {
            toast.error("이미 존재하는 라벨 그룹입니다.")
          } else {
            toast.error(getErrorMessage(e, "라벨 그룹 수정에 실패했습니다."))
          }
        },
      }
    )
  }

  function toggleLabel(id: string) {
    setSelectedLabelIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  return (
    <LabelGroupFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="라벨 그룹 수정"
      submitLabel="수정"
      name={name}
      onNameChange={setName}
      selectedLabelIds={selectedLabelIds}
      onToggle={toggleLabel}
      labels={allLabels}
      onSubmit={handleUpdate}
      isPending={updateLabelGroup.isPending}
    />
  )
}
