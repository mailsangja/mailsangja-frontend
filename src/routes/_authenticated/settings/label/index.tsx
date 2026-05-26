import { useState, useRef, useEffect } from "react"
import { createFileRoute, Link, useLocation } from "@tanstack/react-router"
import { DndContext, closestCenter } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { ChevronRight, GripVertical, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getErrorMessage } from "@/lib/http-error"
import { useCreateLabel, useDeleteLabelGroup } from "@/mutations/labels"
import { useLabels, useLabelGroups } from "@/queries/labels"
import { useLabelOrder } from "@/hooks/use-label-order"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LabelFormDialog, type LabelFormData } from "@/components/label/label-form-dialog"
import { CreateLabelGroupDialog, EditLabelGroupDialog } from "@/components/label/label-group-form-dialog"
import type { LabelGroupItem, LabelListItem } from "@/types/label"

export const Route = createFileRoute("/_authenticated/settings/label/")({
  component: SettingsLabelPage,
})

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

function LabelGroupTableRow({ group, allLabels }: { group: LabelGroupItem; allLabels: LabelListItem[] }) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const groupLabels = allLabels.filter((label) => group.labelIds.includes(label.id))

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2.5">
          <div className="flex w-8 shrink-0 items-center">
            {groupLabels.slice(0, 3).map((label, i) => (
              <span
                key={label.id}
                className="size-3 rounded-full"
                style={{ backgroundColor: label.colorCode, marginLeft: i === 0 ? 0 : -6 }}
              />
            ))}
            {groupLabels.length === 0 && (
              <span className="size-3 rounded-full bg-muted-foreground/20 ring-1 ring-background" />
            )}
          </div>
          {group.name}
        </div>
      </TableCell>
      <TableCell className="text-center text-sm text-muted-foreground">{group.labelIds.length}개</TableCell>
      <TableCell className="pr-6 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="그룹 메뉴" />}>
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-36">
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil />
              수정
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-0.5" />
            <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
      <EditLabelGroupDialog
        key={String(editOpen)}
        open={editOpen}
        onOpenChange={setEditOpen}
        group={group}
        allLabels={allLabels}
      />
      <LabelGroupDeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} group={group} />
    </TableRow>
  )
}

function SortableLabelRow({ label }: { label: LabelListItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: label.id })

  return (
    <TableRow
      ref={setNodeRef}
      style={{
        transform: transform ? `translateY(${transform.y}px)` : undefined,
        transition,
        opacity: isDragging ? 0.4 : undefined,
      }}
    >
      <TableCell className="w-8 px-2">
        <button
          type="button"
          className="flex cursor-grab touch-none items-center text-muted-foreground/30 hover:text-muted-foreground active:cursor-grabbing"
          aria-label="드래그하여 순서 변경"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
      </TableCell>
      <TableCell className="text-center">
        <span className="inline-block size-4 rounded-sm" style={{ backgroundColor: label.colorCode }} />
      </TableCell>
      <TableCell className="font-medium">{label.name}</TableCell>
      <TableCell className="pr-6 text-right">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="라벨 설정"
          render={<Link to="/settings/label/$labelId" params={{ labelId: String(label.id) }} />}
        >
          <ChevronRight className="size-4" />
        </Button>
      </TableCell>
    </TableRow>
  )
}

function SettingsLabelPage() {
  const { data: serverLabels = [], isPending, isError } = useLabels()
  const { orderedLabels, sensors, handleDragEnd } = useLabelOrder(serverLabels)
  const location = useLocation()
  const createFilterRef = useRef<HTMLDivElement>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createGroupOpen, setCreateGroupOpen] = useState(false)
  const createLabel = useCreateLabel()
  const { data: labelGroups = [], isPending: isGroupsPending, isError: isGroupsError } = useLabelGroups()

  function handleCreate({ name, colorCode, notificationPolicy }: LabelFormData) {
    createLabel.mutate(
      { name, colorCode, notificationPolicy, order: 0 },
      {
        onSuccess: () => setCreateOpen(false),
        onError: (e) => toast.error(getErrorMessage(e, "라벨 생성에 실패했습니다.")),
      }
    )
  }

  useEffect(() => {
    if (location.hash === "create-filter") {
      const el = createFilterRef.current
      if (!el) return
      el.scrollIntoView({ behavior: "smooth", block: "start" })
      el.classList.add("animate-shake")
      el.addEventListener("animationend", () => el.classList.remove("animate-shake"), { once: true })
    }
  }, [location.hash])

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="flex flex-col gap-4 pb-4">
        <div className="flex flex-col gap-3">
          <p className="text-md px-1 font-semibold text-muted-foreground">라벨</p>
          <Card>
            <CardHeader>
              <CardTitle>라벨 관리</CardTitle>
              <CardDescription>라벨 규칙 등 전반적인 설정을 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8" />
                      <TableHead className="w-10 text-center">색상</TableHead>
                      <TableHead className="w-full">이름</TableHead>
                      <TableHead className="w-16 pr-6 text-right">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isPending && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                          라벨 목록을 불러오는 중입니다.
                        </TableCell>
                      </TableRow>
                    )}
                    {isError && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-sm text-destructive">
                          라벨 목록을 불러오지 못했습니다.
                        </TableCell>
                      </TableRow>
                    )}
                    {!isPending && !isError && orderedLabels.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                          등록된 라벨이 없습니다.
                        </TableCell>
                      </TableRow>
                    )}
                    <SortableContext items={orderedLabels.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                      {orderedLabels.map((label) => (
                        <SortableLabelRow key={label.id} label={label} />
                      ))}
                    </SortableContext>
                  </TableBody>
                </Table>
              </DndContext>
            </CardContent>
          </Card>

          <div ref={createFilterRef}>
            <Card>
              <CardHeader>
                <CardTitle>라벨 추가하기</CardTitle>
                <CardDescription>이름과 색상을 지정해 새 라벨을 만들 수 있습니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={() => setCreateOpen(true)}>
                  <Plus data-icon="inline-start" />
                  라벨 추가
                </Button>
                <LabelFormDialog
                  open={createOpen}
                  onOpenChange={setCreateOpen}
                  title="새 라벨 만들기"
                  submitLabel="만들기"
                  isPending={createLabel.isPending}
                  onSubmit={handleCreate}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-md px-1 font-semibold text-muted-foreground">라벨 그룹</p>
          <Card>
            <CardHeader>
              <CardTitle>라벨 그룹 관리</CardTitle>
              <CardDescription>라벨 그룹 목록을 확인하고 수정하거나 삭제합니다.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-full pl-12.5">이름</TableHead>
                    <TableHead className="w-20 text-center">라벨 수</TableHead>
                    <TableHead className="w-16 pr-6 text-right">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isGroupsPending && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                        라벨 그룹 목록을 불러오는 중입니다.
                      </TableCell>
                    </TableRow>
                  )}
                  {isGroupsError && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-sm text-destructive">
                        라벨 그룹 목록을 불러오지 못했습니다.
                      </TableCell>
                    </TableRow>
                  )}
                  {!isGroupsPending && !isGroupsError && labelGroups.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                        등록된 라벨 그룹이 없습니다.
                      </TableCell>
                    </TableRow>
                  )}
                  {labelGroups.map((group) => (
                    <LabelGroupTableRow key={group.id} group={group} allLabels={serverLabels} />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>라벨 그룹 추가하기</CardTitle>
              <CardDescription>다수의 라벨을 하나의 라벨 그룹으로 묶을 수 있습니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => setCreateGroupOpen(true)}>
                <Plus data-icon="inline-start" />
                라벨 그룹 추가
              </Button>
              <CreateLabelGroupDialog
                open={createGroupOpen}
                onOpenChange={setCreateGroupOpen}
                labels={serverLabels}
                groups={labelGroups}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  )
}
