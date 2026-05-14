import { useState } from "react"
import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { DndContext, closestCenter } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Check, ChevronDown, GripVertical, ListFilter, MoreVertical, Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { getErrorMessage, getHttpStatus } from "@/lib/http-error"
import { useCreateLabel, useDeleteLabel, useUpdateLabel } from "@/mutations/labels"
import { emailQueries } from "@/queries/emails"
import { labelQueries, useLabels } from "@/queries/labels"
import { useLabelOrder } from "@/hooks/use-label-order"
import type { ConditionField, ConditionOperator, LabelListItem, NotificationPolicy } from "@/types/label"

const FIELD_LABELS: Record<ConditionField, string> = {
  MAIL_ACCOUNT: "메일 계정",
  FROM_ADDRESS: "보낸 주소",
  FROM_DOMAIN: "보낸 도메인",
  TO_ADDRESS: "받는 주소",
  CC_ADDRESS: "참조",
  SUBJECT: "제목",
  BODY_TEXT: "포함하는 단어",
  HAS_ATTACHMENT: "첨부파일",
}

const OPERATOR_LABELS: Record<ConditionOperator, string> = {
  EQUALS: "같음",
  CONTAINS: "포함",
  NOT_CONTAINS: "미포함",
  BOOLEAN: "해당함 여부",
}

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

function LabelItem({
  label,
  isActive,
  onLabelToggle,
}: {
  label: LabelListItem
  isActive: boolean
  onLabelToggle: (labelId: string) => void
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [renameName, setRenameName] = useState(label.name)

  const navigate = useNavigate()
  const search = useSearch({ strict: false })
  const updateLabel = useUpdateLabel()
  const deleteLabel = useDeleteLabel()
  const { data: labelDetail } = useQuery({ ...labelQueries.detail(label.id), enabled: dropdownOpen || deleteOpen })
  const { data: threadCountData } = useQuery({ ...emailQueries.labelCount(label.id), enabled: deleteOpen })

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
            toast.error("이미 존재하는 라벨입니다.")
          } else {
            toast.error(getErrorMessage(e, "라벨 이름 수정에 실패했습니다."))
          }
        },
      }
    )
  }

  function handleDelete() {
    deleteLabel.mutate(label.id, {
      onSuccess: () => {
        setDeleteOpen(false)
        toast.success(`${label.name} 라벨이 삭제되었습니다`)
        if ("labelId" in search && search.labelId === label.id) {
          void navigate({ to: "/mail/$mailbox", params: { mailbox: "inbox" }, replace: true })
        }
      },
    })
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
        aria-label="드래그하여 순서 변경"
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
          render={<SidebarMenuAction aria-label="라벨 메뉴" className="size-5 hover:bg-sidebar-accent-foreground/15" />}
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

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>알림</DropdownMenuSubTrigger>
            <DropdownMenuSubContent sideOffset={6} className="min-w-36">
              {NOTIFICATION_OPTIONS.map(({ value, label: optLabel }) => (
                <DropdownMenuItem key={value} onClick={() => handleNotificationChange(value)}>
                  <Check
                    className={cn("size-3.5 shrink-0", labelDetail?.notificationPolicy !== value && "invisible")}
                  />
                  {optLabel}
                </DropdownMenuItem>
              ))}
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
          <div className="space-y-3">
            {threadCountData?.totalCount != null && threadCountData.totalCount > 0 && (
              <p className="text-base text-muted-foreground">
                {label.name} 라벨을 대화 {threadCountData.totalCount}개에서 제거하고 삭제하시겠습니까?
              </p>
            )}
            {labelDetail?.rule?.groups && labelDetail.rule.groups.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">적용 중인 필터 규칙</p>
                <div className="space-y-1 rounded-md border bg-muted/40 px-3 py-2 text-xs">
                  {labelDetail.rule.groups.flatMap((group, gi) => [
                    ...(gi > 0 ? [<hr key={`sep-${gi}`} className="my-1 border-border" />] : []),
                    ...group.conditions.map((cond, ci) => (
                      <p key={`${gi}-${ci}`} className="text-muted-foreground">
                        <span className="font-medium text-foreground">{FIELD_LABELS[cond.field]}</span>{" "}
                        {OPERATOR_LABELS[cond.operator]}{" "}
                        {cond.operator !== "BOOLEAN" && (
                          <span className="font-mono text-foreground">&quot;{cond.value}&quot;</span>
                        )}
                      </p>
                    )),
                  ])}
                </div>
              </div>
            )}
          </div>
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

interface NavLabelsProps {
  activeLabelId?: string
  onLabelToggle: (labelId: string) => void
  className?: string
}

export function NavLabels({ activeLabelId, onLabelToggle, className }: NavLabelsProps) {
  const { data: serverLabels = [] } = useLabels()
  const createLabel = useCreateLabel()
  const { orderedLabels, sensors, handleDragEnd } = useLabelOrder(serverLabels)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [selectedColor, setSelectedColor] = useState(LABEL_COLORS[0])
  const [showAll, setShowAll] = useState(false)

  const visibleLabels = showAll ? orderedLabels : orderedLabels.slice(0, LABELS_LIMIT)
  const hasMore = orderedLabels.length > LABELS_LIMIT

  function handleCreate() {
    if (!name.trim()) return
    const nameToCreate = name.trim()
    const colorToCreate = selectedColor
    setName("")
    setSelectedColor(LABEL_COLORS[0])
    createLabel.mutate(
      { name: nameToCreate, colorCode: colorToCreate, notificationPolicy: "INHERIT", order: 0 },
      {
        onSuccess: () => setOpen(false),
        onError: (e) => {
          if (getHttpStatus(e) === 409) {
            toast.error("이미 존재하는 라벨입니다.")
          } else {
            toast.error(getErrorMessage(e, "라벨 생성에 실패했습니다."))
          }
        },
      }
    )
  }

  return (
    <SidebarGroup className={className}>
      <SidebarGroupLabel className="flex items-center justify-between pr-1">
        <span>라벨</span>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon-xs"
            title="필터 만들기"
            render={<Link to="/settings/label" hash="create-filter" />}
          >
            <ListFilter />
            <span className="sr-only">필터 만들기</span>
          </Button>
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
        </div>
      </SidebarGroupLabel>

      {orderedLabels.length > 0 && (
        <SidebarMenu>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={visibleLabels.map((l) => l.id)} strategy={verticalListSortingStrategy}>
              {visibleLabels.map((label) => (
                <LabelItem
                  key={label.id}
                  label={label}
                  isActive={activeLabelId === label.id}
                  onLabelToggle={onLabelToggle}
                />
              ))}
            </SortableContext>
          </DndContext>
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
