import { useState, type ElementType } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Bell,
  BellOff,
  BellRing,
  Check,
  GripVertical,
  MoreVertical,
  Palette,
  Pencil,
  SlidersHorizontal,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { SidebarMenuAction, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { LabelDeleteDialog } from "@/components/label/label-delete-dialog"
import { LABEL_COLORS } from "@/lib/label-colors"
import { getErrorMessage, getHttpStatus } from "@/lib/http-error"
import { cn } from "@/lib/utils"
import { useUpdateLabel } from "@/mutations/labels"
import { labelQueries } from "@/queries/labels"
import { m } from "@/paraglide/messages"
import { getNotificationPolicyLabel, type LabelListItem, type NotificationPolicy } from "@/types/label"

const NOTIFICATION_POLICIES: NotificationPolicy[] = ["URGENT", "INHERIT", "SILENT"]
const notificationPolicyIcons = {
  URGENT: BellRing,
  INHERIT: Bell,
  SILENT: BellOff,
} satisfies Record<NotificationPolicy, ElementType>

interface LabelItemProps {
  label: LabelListItem
  isActive: boolean
  onLabelToggle: (labelId: string) => void
}

export function LabelItem({ label, isActive, onLabelToggle }: LabelItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [renameName, setRenameName] = useState(label.name)

  const updateLabel = useUpdateLabel()
  const { data: labelDetail } = useQuery({ ...labelQueries.detail(label.id), enabled: dropdownOpen })

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: label.id })

  function handleColorChange(color: string) {
    updateLabel.mutate({ labelId: label.id, data: { colorCode: color } })
    setDropdownOpen(false)
  }

  function handleNotificationChange(policy: NotificationPolicy) {
    updateLabel.mutate({ labelId: label.id, data: { notificationPolicy: policy } })
    setDropdownOpen(false)
  }

  function handleRename() {
    const trimmed = renameName.trim()
    if (!trimmed) return
    if (trimmed === label.name) {
      setRenameOpen(false)
      return
    }
    updateLabel.mutate(
      { labelId: label.id, data: { name: trimmed } },
      {
        onSuccess: () => setRenameOpen(false),
        onError: (e) => {
          if (getHttpStatus(e) === 409) {
            toast.error(m.sidebar_label_duplicate_error())
          } else {
            toast.error(getErrorMessage(e, m.label_name_edit_error()))
          }
        },
      }
    )
  }

  return (
    <SidebarMenuItem
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : undefined }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        className="absolute top-1/2 -left-3.5 z-10 -translate-y-1/2 cursor-grab touch-none rounded p-0.5 opacity-0 group-hover/menu-item:opacity-30 hover:opacity-60 active:cursor-grabbing"
        aria-label={m.label_reorder()}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-3" />
      </button>
      <SidebarMenuButton
        type="button"
        tooltip={label.name}
        isActive={isActive}
        size="sm"
        className="group-hover/menu-item:bg-sidebar-accent group-hover/menu-item:text-sidebar-accent-foreground"
        onClick={() => onLabelToggle(label.id)}
      >
        <span className="size-3 shrink-0 rounded-sm" style={{ backgroundColor: label.colorCode }} />
        <span className="truncate">{label.name}</span>
      </SidebarMenuButton>

      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger
          render={
            <SidebarMenuAction aria-label={m.label_menu()} className="size-5 hover:bg-sidebar-accent-foreground/15" />
          }
        >
          {isHovered || dropdownOpen ? (
            <MoreVertical />
          ) : label.unreadThreadCount > 0 ? (
            <span className="px-1.5 py-0.5 text-[10px] leading-none font-medium text-muted-foreground tabular-nums">
              {label.unreadThreadCount}
            </span>
          ) : null}
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" className="min-w-44 ring-foreground/6">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Palette />
              {m.label_color_change_title()}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-auto min-w-0" sideOffset={6}>
              <div className="grid grid-cols-5 gap-1 p-0.5">
                {LABEL_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="size-6 cursor-pointer rounded-full transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none"
                    style={{
                      backgroundColor: color,
                      boxShadow: label.colorCode === color ? `0 0 0 2px white, 0 0 0 4px ${color}` : undefined,
                    }}
                    aria-label={color}
                    aria-pressed={label.colorCode === color}
                    onClick={() => handleColorChange(color)}
                  />
                ))}
              </div>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Bell />
              {m.label_notification_menu()}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent sideOffset={6} className="min-w-36">
              {NOTIFICATION_POLICIES.map((policy) => {
                const Icon = notificationPolicyIcons[policy]

                return (
                  <DropdownMenuItem key={policy} onClick={() => handleNotificationChange(policy)}>
                    <Icon />
                    {getNotificationPolicyLabel(policy)}
                    <Check
                      className={cn(
                        "ml-auto size-3.5 shrink-0",
                        labelDetail?.notificationPolicy !== policy && "invisible"
                      )}
                    />
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator className="my-0.5" />

          <DropdownMenuItem
            onClick={() => {
              setRenameName(label.name)
              setRenameOpen(true)
              setDropdownOpen(false)
            }}
          >
            <Pencil />
            {m.label_name_edit_menu()}
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link to="/settings/label/$labelId" params={{ labelId: String(label.id) }} />}>
            <SlidersHorizontal />
            {m.label_rule_edit_menu()}
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
            {m.common_delete()}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{m.label_name_edit_title()}</DialogTitle>
          </DialogHeader>
          <Input
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)}>
              {m.common_cancel()}
            </Button>
            <Button onClick={handleRename} disabled={!renameName.trim() || updateLabel.isPending}>
              {m.common_edit()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <LabelDeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} label={label} />
    </SidebarMenuItem>
  )
}
