import { useState } from "react"
import { MoreVertical, Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { getErrorMessage, getHttpStatus } from "@/lib/http-error"
import { useCreateLabelGroup, useDeleteLabelGroup, useUpdateLabelGroup } from "@/mutations/labels"
import { useLabelGroups, useLabels } from "@/queries/labels"
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

function CreateGroupDialog({
  open,
  onOpenChange,
  labels,
  groups,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  labels: LabelListItem[]
  groups: LabelGroupItem[]
}) {
  const [name, setName] = useState("")
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([])
  const createLabelGroup = useCreateLabelGroup()

  function handleCreate() {
    const trimmed = name.trim()
    if (!trimmed) return
    const maxOrder = groups.length > 0 ? Math.max(...groups.map((g) => g.order)) : 0
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
    setSelectedLabelIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
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

function EditGroupDialog({
  open,
  onOpenChange,
  group,
  allLabels,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: LabelGroupItem
  allLabels: LabelListItem[]
}) {
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
    setSelectedLabelIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
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

function GroupDeleteDialog({
  open,
  onOpenChange,
  group,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: LabelGroupItem
}) {
  const deleteLabelGroup = useDeleteLabelGroup()

  function handleDelete() {
    deleteLabelGroup.mutate(group.id, {
      onSuccess: () => {
        onOpenChange(false)
        toast.success(`${group.name} 그룹이 삭제되었습니다`)
      },
      onError: (e) => toast.error(getErrorMessage(e, "라벨 그룹 삭제에 실패했습니다.")),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>삭제</DialogTitle>
        </DialogHeader>
        <p className="text-base text-muted-foreground">
          {group.name} 그룹을 삭제하시겠습니까? 라벨 자체는 삭제되지 않습니다.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteLabelGroup.isPending}>
            삭제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function GroupItem({
  group,
  allLabels,
  isActive,
  onGroupToggle,
}: {
  group: LabelGroupItem
  allLabels: LabelListItem[]
  isActive: boolean
  onGroupToggle: (groupId: string) => void
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const groupLabels = allLabels.filter((l) => group.labelIds.includes(l.id))

  return (
    <SidebarMenuItem onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <SidebarMenuButton
        type="button"
        tooltip={group.name}
        isActive={isActive}
        size="sm"
        className="group-hover/menu-item:bg-sidebar-accent group-hover/menu-item:text-sidebar-accent-foreground"
        onClick={() => onGroupToggle(group.id)}
      >
        <div className="flex shrink-0 items-center">
          {groupLabels.slice(0, 3).map((label, i) => (
            <span
              key={label.id}
              className="size-2.5 rounded-full"
              style={{ backgroundColor: label.colorCode, marginLeft: i === 0 ? 0 : -4 }}
            />
          ))}
          {groupLabels.length === 0 && <span className="size-2.5 rounded-full bg-muted-foreground/30" />}
        </div>
        <span className="truncate">{group.name}</span>
      </SidebarMenuButton>

      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger
          render={<SidebarMenuAction aria-label="그룹 메뉴" className="size-5 hover:bg-sidebar-accent-foreground/15" />}
        >
          {(isHovered || dropdownOpen) && <MoreVertical />}
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" className="min-w-44 ring-foreground/6">
          <DropdownMenuItem
            onClick={() => {
              setEditOpen(true)
              setDropdownOpen(false)
            }}
          >
            라벨 그룹 수정
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-0.5" />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              setDeleteOpen(true)
              setDropdownOpen(false)
            }}
          >
            삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditGroupDialog
        key={String(editOpen)}
        open={editOpen}
        onOpenChange={setEditOpen}
        group={group}
        allLabels={allLabels}
      />

      <GroupDeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} group={group} />
    </SidebarMenuItem>
  )
}

interface NavLabelGroupsProps {
  activeLabelGroupId?: string
  onLabelGroupToggle: (groupId: string) => void
  className?: string
}

export function NavLabelGroups({ activeLabelGroupId, onLabelGroupToggle, className }: NavLabelGroupsProps) {
  const { data: groups = [] } = useLabelGroups()
  const { data: labels = [] } = useLabels()
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <SidebarGroup className={className}>
      <SidebarGroupLabel className="flex items-center justify-between pr-1">
        <span>라벨 그룹</span>
        <Button variant="ghost" size="icon-xs" title="라벨 그룹 추가" onClick={() => setCreateOpen(true)}>
          <Plus />
          <span className="sr-only">라벨 그룹 추가</span>
        </Button>
      </SidebarGroupLabel>

      {groups.length > 0 && (
        <SidebarMenu>
          {groups.map((group) => (
            <GroupItem
              key={group.id}
              group={group}
              allLabels={labels}
              isActive={activeLabelGroupId === group.id}
              onGroupToggle={onLabelGroupToggle}
            />
          ))}
        </SidebarMenu>
      )}

      <CreateGroupDialog open={createOpen} onOpenChange={setCreateOpen} labels={labels} groups={groups} />
    </SidebarGroup>
  )
}
