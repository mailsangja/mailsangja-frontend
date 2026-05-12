import { useState } from "react"
import { Link, useLocation } from "@tanstack/react-router"
import { ChevronDown, MoreVertical, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import { cn } from "@/lib/utils"
import { parseMailRouteSearch } from "@/lib/mail-routing"
import { useDeleteLabel, useUpdateLabel } from "@/mutations/labels"
import { useCreateLabel } from "@/mutations/labels"
import { useLabels } from "@/queries/labels"
import type { LabelListItem, NotificationPolicy } from "@/types/label"

const LABEL_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
  "#f43f5e", // rose
  "#64748b", // slate
  "#78716c", // stone
  "#6b7280", // gray
]

const NOTIFICATION_OPTIONS: { value: NotificationPolicy; label: string }[] = [
  { value: "URGENT", label: "항상 알림" },
  { value: "INHERIT", label: "기본" },
  { value: "SILENT", label: "알림 안함" },
]

function LabelItem({ label, isActive }: { label: LabelListItem; isActive: boolean }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [renameName, setRenameName] = useState(label.name)

  const updateLabel = useUpdateLabel()
  const deleteLabel = useDeleteLabel()

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
    updateLabel.mutate({ labelId: label.id, data: { name: trimmed } }, { onSuccess: () => setRenameOpen(false) })
  }

  function handleDelete() {
    deleteLabel.mutate(label.id, { onSuccess: () => setDeleteOpen(false) })
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={label.name}
        isActive={isActive}
        size="sm"
        className="group-hover/menu-item:bg-sidebar-accent group-hover/menu-item:text-sidebar-accent-foreground"
        render={<Link to="/mail/$mailbox" params={{ mailbox: "inbox" }} search={{ labelId: label.id }} />}
      >
        <span className="size-3 shrink-0 rounded-sm" style={{ backgroundColor: label.colorCode }} />
        <span className="truncate">{label.name}</span>
        {label.unreadThreadCount > 0 && (
          <span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[10px] leading-none font-medium text-muted-foreground tabular-nums group-hover/menu-item:hidden">
            {label.unreadThreadCount}
          </span>
        )}
      </SidebarMenuButton>

      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger
          render={
            <SidebarMenuAction
              showOnHover
              aria-label="라벨 메뉴"
              className="size-5 hover:bg-sidebar-accent-foreground/15"
            />
          }
        >
          <MoreVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" className="min-w-44 ring-foreground/6">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>색상 변경</DropdownMenuSubTrigger>
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

          <DropdownMenuGroup>
            <DropdownMenuLabel>알림</DropdownMenuLabel>
            {NOTIFICATION_OPTIONS.map(({ value, label: optLabel }) => (
              <DropdownMenuItem key={value} onClick={() => handleNotificationChange(value)}>
                {optLabel}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => {
              setRenameName(label.name)
              setRenameOpen(true)
              setDropdownOpen(false)
            }}
          >
            이름 수정
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link to="/settings/label/$labelId" params={{ labelId: String(label.id) }} />}>
            라벨 규칙 수정
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

      {/* Rename dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>라벨 이름 수정</DialogTitle>
          </DialogHeader>
          <Input
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)}>
              취소
            </Button>
            <Button onClick={handleRename} disabled={!renameName.trim() || updateLabel.isPending}>
              수정
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>라벨 삭제</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{label.name}</span> 라벨을 삭제합니다. 이 작업은 되돌릴 수
            없습니다.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLabel.isPending}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarMenuItem>
  )
}

const LABELS_LIMIT = 4

export function NavLabels({ className }: { className?: string }) {
  const { data: labels = [] } = useLabels()
  const createLabel = useCreateLabel()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [selectedColor, setSelectedColor] = useState(LABEL_COLORS[0])
  const [showAll, setShowAll] = useState(false)
  const location = useLocation()
  const { labelId: activeLabelId } = parseMailRouteSearch(location.search)

  const visibleLabels = showAll ? labels : labels.slice(0, LABELS_LIMIT)
  const hasMore = labels.length > LABELS_LIMIT

  function handleCreate() {
    if (!name.trim()) return
    createLabel.mutate(
      { name: name.trim(), colorCode: selectedColor, notificationPolicy: "INHERIT", order: 0 },
      {
        onSuccess: () => {
          setName("")
          setSelectedColor(LABEL_COLORS[0])
          setOpen(false)
        },
      }
    )
  }

  return (
    <SidebarGroup className={className}>
      <SidebarGroupLabel className="flex items-center justify-between pr-1">
        <span>라벨</span>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon-xs" title="라벨 추가">
              <Plus />
              <span className="sr-only">라벨 추가</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 라벨 만들기</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-2">
              <Input
                placeholder="라벨 이름"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
              />
              <div>
                <p className="mb-2 text-xs text-muted-foreground">색상 선택</p>
                <div className="grid grid-cols-10 gap-1.5">
                  {LABEL_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="size-6 rounded-full ring-offset-2 transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      style={{
                        backgroundColor: color,
                        boxShadow: selectedColor === color ? `0 0 0 2px white, 0 0 0 4px ${color}` : undefined,
                      }}
                      onClick={() => setSelectedColor(color)}
                      aria-label={color}
                      aria-pressed={selectedColor === color}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={!name.trim() || createLabel.isPending}>
                만들기
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarGroupLabel>

      {labels.length > 0 && (
        <SidebarMenu>
          {visibleLabels.map((label) => (
            <LabelItem key={label.id} label={label} isActive={activeLabelId === label.id} />
          ))}
          {hasMore && (
            <SidebarMenuItem>
              <SidebarMenuButton size="sm" onClick={() => setShowAll((v) => !v)}>
                <ChevronDown className={cn("size-4 transition-transform", showAll && "rotate-180")} />
                <span>{showAll ? "접기" : "더보기"}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      )}
    </SidebarGroup>
  )
}
