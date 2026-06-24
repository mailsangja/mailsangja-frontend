import { useState, useRef, useEffect, type ElementType, type KeyboardEvent } from "react"
import { createFileRoute, useLocation, useNavigate } from "@tanstack/react-router"
import { DndContext, closestCenter } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Bell, BellOff, BellRing, ChevronDown, GripVertical, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LABEL_COLORS } from "@/lib/label-colors"
import { getErrorMessage } from "@/lib/http-error"
import { useCreateLabel, useDeleteLabelGroup, useUpdateLabel } from "@/mutations/labels"
import { useLabelDetail, useLabels, useLabelGroups } from "@/queries/labels"
import { useLabelOrder } from "@/hooks/use-label-order"
import { cn } from "@/lib/utils"
import { LabelFormDialog, type LabelFormData } from "@/components/label/label-form-dialog"
import { CreateLabelGroupDialog, EditLabelGroupDialog } from "@/components/label/label-group-form-dialog"
import { LabelSettingsPanel } from "@/components/label/label-settings-panel"
import { m } from "@/paraglide/messages"
import {
  getNotificationPolicyLabel,
  type LabelGroupItem,
  type LabelListItem,
  type NotificationPolicy,
} from "@/types/label"

const NOTIFICATION_OPTIONS: { value: NotificationPolicy; icon: ElementType }[] = [
  { value: "URGENT", icon: BellRing },
  { value: "INHERIT", icon: Bell },
  { value: "SILENT", icon: BellOff },
]

export const Route = createFileRoute("/_authenticated/_app/settings/label/")({
  validateSearch: (search: Record<string, unknown>): { labelId?: string } => {
    const labelId = typeof search.labelId === "string" ? search.labelId.trim() : ""
    return labelId ? { labelId } : {}
  },
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

function LabelColorPicker({ label }: { label: LabelListItem }) {
  const updateLabel = useUpdateLabel()
  const [open, setOpen] = useState(false)

  function handleColorChange(colorCode: string) {
    setOpen(false)
    if (colorCode === label.colorCode || updateLabel.isPending) return
    updateLabel.mutate(
      { labelId: label.id, data: { colorCode } },
      {
        onError: (e) => toast.error(getErrorMessage(e, "라벨 색상 변경에 실패했습니다.")),
      }
    )
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="size-4 shrink-0 rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
            style={{ backgroundColor: label.colorCode }}
            aria-label={m.label_color_select()}
            disabled={updateLabel.isPending}
          />
        }
      />
      <DropdownMenuContent className="w-auto p-2">
        <div className="grid grid-cols-5 gap-1.5">
          {LABEL_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className="size-6 cursor-pointer rounded-full transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              style={{
                backgroundColor: color,
                boxShadow: label.colorCode === color ? `0 0 0 2px white, 0 0 0 4px ${color}` : undefined,
              }}
              onClick={() => handleColorChange(color)}
              aria-label={color}
              aria-pressed={label.colorCode === color}
            />
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function EditableLabelName({ label }: { label: LabelListItem }) {
  const updateLabel = useUpdateLabel()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(label.name)

  function commit() {
    const trimmed = name.trim()
    if (!trimmed) {
      setName(label.name)
      setEditing(false)
      return
    }
    if (trimmed === label.name) {
      setEditing(false)
      return
    }
    updateLabel.mutate(
      { labelId: label.id, data: { name: trimmed } },
      {
        onSuccess: () => setEditing(false),
        onError: (e) => {
          setName(label.name)
          toast.error(getErrorMessage(e, "라벨 이름 변경에 실패했습니다."))
        },
      }
    )
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.currentTarget.blur()
    }
    if (e.key === "Escape") {
      setName(label.name)
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        className="h-8 w-48 max-w-72 px-2 text-sm font-medium"
        autoFocus
        disabled={updateLabel.isPending}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        setName(label.name)
        setEditing(true)
      }}
      className="max-w-72 truncate rounded-sm py-1 text-left text-sm font-medium hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      {label.name}
    </button>
  )
}

function LabelNotificationControl({ labelId }: { labelId: string }) {
  const { data: label } = useLabelDetail(labelId)
  const updateLabel = useUpdateLabel()
  const [expanded, setExpanded] = useState(false)
  const currentPolicy = label?.notificationPolicy ?? "INHERIT"
  const currentOption = NOTIFICATION_OPTIONS.find((option) => option.value === currentPolicy) ?? NOTIFICATION_OPTIONS[1]
  const CurrentIcon = currentOption.icon

  function handleSelect(notificationPolicy: NotificationPolicy) {
    if (notificationPolicy === currentPolicy || updateLabel.isPending) {
      setExpanded(false)
      return
    }
    updateLabel.mutate(
      { labelId, data: { notificationPolicy } },
      {
        onSuccess: () => setExpanded(false),
        onError: (e) => toast.error(getErrorMessage(e, "알림 설정 변경에 실패했습니다.")),
      }
    )
  }

  if (expanded) {
    return (
      <div
        className="ml-auto flex h-7 shrink-0 overflow-hidden rounded-[min(var(--radius-md),12px)] border"
        onClick={(e) => e.stopPropagation()}
      >
        {NOTIFICATION_OPTIONS.map(({ value, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => handleSelect(value)}
            disabled={updateLabel.isPending}
            className={cn(
              "flex h-7 items-center gap-1 border-r px-2.5 text-[0.8rem] font-medium transition-colors last:border-r-0 disabled:opacity-50",
              currentPolicy === value
                ? "bg-primary/10 font-medium text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-3.5" />
            {getNotificationPolicyLabel(value)}
          </button>
        ))}
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="ml-auto shrink-0"
      onClick={(e) => {
        e.stopPropagation()
        setExpanded(true)
      }}
      disabled={!label || updateLabel.isPending}
    >
      <CurrentIcon data-icon="inline-start" />
      {getNotificationPolicyLabel(currentPolicy)}
    </Button>
  )
}

function SortableLabelItem({
  label,
  open,
  onOpenChange,
}: {
  label: LabelListItem
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: label.id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translateY(${transform.y}px)` : undefined,
        transition,
      }}
    >
      <Collapsible
        open={open}
        onOpenChange={onOpenChange}
        className={cn("transition-opacity", isDragging && "opacity-40")}
      >
        <div className="flex min-h-13 cursor-pointer items-center gap-3 px-4" onClick={() => onOpenChange(!open)}>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="flex cursor-grab touch-none items-center text-muted-foreground/30 hover:text-muted-foreground active:cursor-grabbing"
            aria-label={m.label_reorder()}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </button>
          <LabelColorPicker label={label} />
          <EditableLabelName label={label} />
          {label.isSensitive && (
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {m.label_sensitive_badge()}
            </span>
          )}
          <div className="min-w-0 flex-1" />
          <LabelNotificationControl labelId={label.id} />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onOpenChange(!open)
            }}
            className="flex shrink-0 items-center rounded-sm p-1 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-label={m.label_settings()}
          >
            <ChevronDown className={cn("shrink-0 transition-transform", open && "rotate-180")} />
          </button>
        </div>
        <CollapsibleContent className="border-t">
          <LabelSettingsPanel labelId={label.id} onDeleted={() => onOpenChange(false)} />
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

function SettingsLabelPage() {
  const { data: serverLabels = [], isPending, isError } = useLabels()
  const { orderedLabels, sensors, handleDragEnd } = useLabelOrder(serverLabels)
  const { labelId: activeLabelId } = Route.useSearch()
  const navigate = useNavigate()
  const location = useLocation()
  const createFilterRef = useRef<HTMLDivElement>(null)
  const activeLabelRef = useRef<HTMLDivElement>(null)
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

  useEffect(() => {
    if (!activeLabelId) return
    activeLabelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [activeLabelId])

  function setActiveLabel(labelId: string | undefined) {
    void navigate({
      to: "/settings/label",
      search: labelId ? { labelId } : {},
      replace: true,
    })
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <p className="text-md px-1 font-semibold text-muted-foreground">{m.settings_label()}</p>
        <Card className="pb-0">
          <CardHeader>
            <CardTitle>{m.label_management_title()}</CardTitle>
            <CardDescription>{m.label_management_description()}</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <div className="divide-y border-t">
                {isPending && (
                  <p className="py-3 text-center text-sm text-muted-foreground">{m.label_list_loading()}</p>
                )}
                {isError && <p className="py-3 text-center text-sm text-destructive">{m.label_list_error()}</p>}
                {!isPending && !isError && orderedLabels.length === 0 && (
                  <p className="py-3 text-center text-sm text-muted-foreground">{m.label_list_empty()}</p>
                )}
                <SortableContext items={orderedLabels.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                  {orderedLabels.map((label) => (
                    <div key={label.id} ref={activeLabelId === label.id ? activeLabelRef : undefined}>
                      <SortableLabelItem
                        label={label}
                        open={activeLabelId === label.id}
                        onOpenChange={(open) => setActiveLabel(open ? label.id : undefined)}
                      />
                    </div>
                  ))}
                </SortableContext>
              </div>
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
        <Card className="pb-0">
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
