import { useState } from "react"
import { MoreVertical, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { EditLabelGroupDialog } from "@/components/label/label-group-form-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenuAction, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { getErrorMessage } from "@/lib/http-error"
import { useDeleteLabelGroup } from "@/mutations/labels"
import type { LabelGroupItem, LabelListItem } from "@/types/label"

function LabelGroupDeleteDialog({
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

interface SidebarLabelGroupItemProps {
  group: LabelGroupItem
  allLabels: LabelListItem[]
  isActive: boolean
  onGroupToggle: (groupId: string) => void
}

export function SidebarLabelGroupItem({ group, allLabels, isActive, onGroupToggle }: SidebarLabelGroupItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const groupLabels = allLabels.filter((label) => group.labelIds.includes(label.id))

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
            <Pencil />
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
            <Trash2 />
            삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditLabelGroupDialog
        key={String(editOpen)}
        open={editOpen}
        onOpenChange={setEditOpen}
        group={group}
        allLabels={allLabels}
      />

      <LabelGroupDeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} group={group} />
    </SidebarMenuItem>
  )
}
