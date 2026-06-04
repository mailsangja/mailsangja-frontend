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
import { LabelFormDialog, type LabelFormData } from "@/components/label/label-form-dialog"
import { CreateLabelGroupDialog, EditLabelGroupDialog } from "@/components/label/label-group-form-dialog"
import { m } from "@/paraglide/messages"
import type { LabelGroupItem, LabelListItem } from "@/types/label"

export const Route = createFileRoute("/_authenticated/_app/settings/label/")({
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
        toast.success(m.label_group_delete_success({ name: group.name }))
      },
      onError: (e) => toast.error(getErrorMessage(e, m.label_group_delete_error())),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{m.common_delete()}</DialogTitle>
        </DialogHeader>
        <p className="text-base text-muted-foreground">{m.label_group_delete_confirmation({ name: group.name })}</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {m.common_cancel()}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteLabelGroup.isPending}>
            {m.common_delete()}
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
      <TableCell className="text-center text-sm text-muted-foreground">
        {m.label_group_label_count({ count: group.labelIds.length })}
      </TableCell>
      <TableCell className="pr-6 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={m.label_group_menu()} />}>
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-36">
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil />
              {m.common_edit()}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-0.5" />
            <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 />
              {m.common_delete()}
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
          aria-label={m.label_reorder()}
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
          aria-label={m.label_settings()}
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
        onError: (e) => toast.error(getErrorMessage(e, m.sidebar_label_create_error())),
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
    <>
      <div className="flex flex-col gap-3">
        <p className="text-md px-1 font-semibold text-muted-foreground">{m.settings_label()}</p>
        <Card>
          <CardHeader>
            <CardTitle>{m.label_management_title()}</CardTitle>
            <CardDescription>{m.label_management_description()}</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8" />
                    <TableHead className="w-10 text-center">{m.label_color_column()}</TableHead>
                    <TableHead className="w-full">{m.common_name()}</TableHead>
                    <TableHead className="w-16 pr-6 text-right">{m.label_actions_column()}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                        {m.label_list_loading()}
                      </TableCell>
                    </TableRow>
                  )}
                  {isError && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-sm text-destructive">
                        {m.label_list_error()}
                      </TableCell>
                    </TableRow>
                  )}
                  {!isPending && !isError && orderedLabels.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                        {m.label_list_empty()}
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
              <CardTitle>{m.label_add_section_title()}</CardTitle>
              <CardDescription>{m.label_add_section_description()}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => setCreateOpen(true)}>
                <Plus data-icon="inline-start" />
                {m.sidebar_label_add()}
              </Button>
              <LabelFormDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                title={m.sidebar_label_create_title()}
                submitLabel={m.sidebar_label_create_submit()}
                isPending={createLabel.isPending}
                onSubmit={handleCreate}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-md px-1 font-semibold text-muted-foreground">{m.sidebar_label_groups()}</p>
        <Card>
          <CardHeader>
            <CardTitle>{m.label_group_management_title()}</CardTitle>
            <CardDescription>{m.label_group_management_description()}</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-full pl-12.5">{m.common_name()}</TableHead>
                  <TableHead className="w-20 text-center">{m.label_group_count_column()}</TableHead>
                  <TableHead className="w-16 pr-6 text-right">{m.label_actions_column()}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isGroupsPending && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                      {m.label_group_list_loading()}
                    </TableCell>
                  </TableRow>
                )}
                {isGroupsError && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-sm text-destructive">
                      {m.label_group_list_error()}
                    </TableCell>
                  </TableRow>
                )}
                {!isGroupsPending && !isGroupsError && labelGroups.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                      {m.label_group_list_empty()}
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
            <CardTitle>{m.label_group_add_section_title()}</CardTitle>
            <CardDescription>{m.label_group_add_section_description()}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => setCreateGroupOpen(true)}>
              <Plus data-icon="inline-start" />
              {m.sidebar_label_group_add()}
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
    </>
  )
}
