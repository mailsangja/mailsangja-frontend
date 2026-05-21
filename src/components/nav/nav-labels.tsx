import { useState } from "react"
import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { DndContext, closestCenter } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Check, GripVertical, MoreVertical, Plus, Sparkles, X } from "lucide-react"
import { toast } from "sonner"

import { Button, buttonVariants } from "@/components/ui/button"
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
import { LABEL_COLORS } from "@/lib/label-colors"
import {
  useApproveLabelSuggestion,
  useCreateLabel,
  useCreateLabelSuggestions,
  useDeleteLabel,
  useDeleteLabelSuggestion,
  useUpdateLabel,
} from "@/mutations/labels"
import { emailQueries } from "@/queries/emails"
import { labelQueries, useLabels, useLabelSuggestions, useLabelSuggestionDetail } from "@/queries/labels"
import { LabelFormDialog, type LabelFormData } from "@/components/label-form-dialog"
import { useLabelOrder } from "@/hooks/use-label-order"
import type {
  ConditionField,
  ConditionOperator,
  LabelListItem,
  LabelSuggestion,
  NotificationPolicy,
} from "@/types/label"

const FIELD_LABELS: Record<ConditionField, string> = {
  MAIL_ACCOUNT: "메일 계정",
  FROM_ADDRESS: "보낸 주소",
  FROM_DOMAIN: "보낸 도메인",
  TO_ADDRESS: "받는 주소",
  CC_ADDRESS: "참조",
  SUBJECT: "제목",
  BODY_TEXT: "본문",
  HAS_ATTACHMENT: "첨부파일",
}

const OPERATOR_LABELS: Record<ConditionOperator, string> = {
  EQUALS: "같음",
  CONTAINS: "포함",
  NOT_CONTAINS: "미포함",
  BOOLEAN: "해당함 여부",
}

function LabelDeleteDialog({
  open,
  onOpenChange,
  label,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  label: LabelListItem
}) {
  const navigate = useNavigate()
  const search = useSearch({ strict: false })
  const deleteLabel = useDeleteLabel()
  const { data: labelDetail, isLoading: isLoadingDetail } = useQuery({
    ...labelQueries.detail(label.id),
    enabled: open,
  })
  const { data: threadCountData, isLoading: isLoadingCount } = useQuery({
    ...emailQueries.labelCount(label.id),
    enabled: open,
  })
  const isInfoLoading = isLoadingDetail || isLoadingCount

  function handleDelete() {
    deleteLabel.mutate(label.id, {
      onSuccess: () => {
        onOpenChange(false)
        toast.success(`${label.name} 라벨이 삭제되었습니다`)
        if ("labelId" in search && search.labelId === label.id) {
          void navigate({ to: "/mail/$mailbox", params: { mailbox: "inbox" }, replace: true })
        }
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>라벨 삭제</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {isInfoLoading ? (
            <div className="space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          ) : (
            <>
              {threadCountData?.totalCount != null && (
                <p className="text-base text-muted-foreground">
                  {label.name} 라벨을 대화 {threadCountData.totalCount}개에서 제거하고 삭제하시겠습니까?
                </p>
              )}
              {labelDetail?.rule?.groups && (
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
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteLabel.isPending || isInfoLoading}>
            삭제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

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
            toast.error("이미 존재하는 라벨입니다.")
          } else {
            toast.error(getErrorMessage(e, "라벨 이름 수정에 실패했습니다."))
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

      <LabelDeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} label={label} />
    </SidebarMenuItem>
  )
}

function SuggestionItem({ suggestion }: { suggestion: LabelSuggestion }) {
  const [approveOpen, setApproveOpen] = useState(false)
  const deleteSuggestion = useDeleteLabelSuggestion()
  const navigate = useNavigate()
  const approveLabelSuggestion = useApproveLabelSuggestion()
  const { data: detail } = useLabelSuggestionDetail(suggestion.id, approveOpen)
  const groups = detail?.rule?.groups ?? []

  function handleReject() {
    deleteSuggestion.mutate(suggestion.id, {
      onError: (e) => toast.error(getErrorMessage(e, "라벨 제안 거부에 실패했습니다.")),
    })
  }

  function handleApprove({ name, colorCode, notificationPolicy }: LabelFormData) {
    const rule = groups.length > 0 ? { groups } : undefined
    approveLabelSuggestion.mutate(
      { suggestionId: suggestion.id, data: { name, colorCode, notificationPolicy, order: suggestion.order, rule } },
      {
        onSuccess: (label) => {
          setApproveOpen(false)
          toast.success(`${name} 라벨이 추가되었습니다`)
          void navigate({ to: "/settings/label/$labelId", params: { labelId: label.id } })
        },
        onError: (e) => {
          if (getHttpStatus(e) === 409) {
            toast.error("이미 존재하는 라벨입니다.")
          } else {
            toast.error(getErrorMessage(e, "라벨 추가에 실패했습니다."))
          }
        },
      }
    )
  }

  return (
    <SidebarMenuItem className="ai-suggestion-item group/suggestion">
      <SidebarMenuButton type="button" size="sm" tooltip={suggestion.name} onClick={() => setApproveOpen(true)}>
        <span className="size-3 shrink-0 rounded-sm" style={{ backgroundColor: suggestion.colorCode }} />
        <span className="truncate">{suggestion.name}</span>
      </SidebarMenuButton>

      <div className="absolute top-1/2 right-1 flex -translate-y-1/2 items-center gap-0.5 transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within/suggestion:opacity-100 [@media(hover:hover)]:group-hover/suggestion:opacity-100">
        <button
          type="button"
          className="flex size-5 items-center justify-center rounded text-muted-foreground hover:text-green-600"
          aria-label="승인"
          onClick={(e) => {
            e.stopPropagation()
            setApproveOpen(true)
          }}
        >
          <Check className="size-3.5" />
        </button>
        <button
          type="button"
          className="flex size-5 items-center justify-center rounded text-muted-foreground hover:text-destructive"
          aria-label="거부"
          onClick={(e) => {
            e.stopPropagation()
            handleReject()
          }}
          disabled={deleteSuggestion.isPending}
        >
          <X className="size-3.5" />
        </button>
      </div>

      <LabelFormDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        title="AI 추천 라벨 추가"
        defaultName={suggestion.name}
        defaultColor={suggestion.colorCode}
        groups={groups}
        onSubmit={handleApprove}
        isPending={approveLabelSuggestion.isPending}
        submitLabel="추가하기"
        submitDisabled={!detail}
      />
    </SidebarMenuItem>
  )
}

interface NavLabelsProps {
  activeLabelId?: string
  onLabelToggle: (labelId: string) => void
  className?: string
}

export function NavLabels({ activeLabelId, onLabelToggle, className }: NavLabelsProps) {
  const { data: serverLabels = [] } = useLabels()
  const { data: suggestions = [] } = useLabelSuggestions()
  const createLabel = useCreateLabel()
  const createSuggestions = useCreateLabelSuggestions()
  const { orderedLabels, sensors, handleDragEnd } = useLabelOrder(serverLabels)
  const [open, setOpen] = useState(false)

  function handleCreate({ name, colorCode, notificationPolicy }: LabelFormData) {
    const maxOrder = serverLabels.length > 0 ? Math.max(...serverLabels.map((l) => l.order)) : 0
    createLabel.mutate(
      { name, colorCode, notificationPolicy, order: maxOrder + 1 },
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
          <button
            type="button"
            title="AI 라벨 추천 받기"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-xs" }),
              "text-primary hover:bg-primary/10 hover:text-primary",
              createSuggestions.isPending && "animate-pulse"
            )}
            onClick={() => {
              const toastId = toast.loading("AI 추천 라벨을 생성 중입니다...")
              createSuggestions.mutate(undefined, {
                onSuccess: () => toast.success("AI 추천 라벨 생성이 완료되었습니다!", { id: toastId }),
                onError: (e) => toast.error(getErrorMessage(e, "AI 추천 라벨 생성에 실패했습니다."), { id: toastId }),
              })
            }}
            disabled={createSuggestions.isPending}
          >
            <Sparkles className="ai-sparkle-icon size-3.5" />
            <span className="sr-only">AI 라벨 추천 받기</span>
          </button>
          <Button variant="ghost" size="icon-xs" title="라벨 추가" onClick={() => setOpen(true)}>
            <Plus />
            <span className="sr-only">라벨 추가</span>
          </Button>
        </div>
      </SidebarGroupLabel>

      {orderedLabels.length > 0 && (
        <SidebarMenu>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={orderedLabels.map((l) => l.id)} strategy={verticalListSortingStrategy}>
              {orderedLabels.map((label) => (
                <LabelItem
                  key={label.id}
                  label={label}
                  isActive={activeLabelId === label.id}
                  onLabelToggle={onLabelToggle}
                />
              ))}
            </SortableContext>
          </DndContext>
        </SidebarMenu>
      )}

      {suggestions.length > 0 && (
        <SidebarMenu className="mt-1">
          {suggestions.map((suggestion) => (
            <SuggestionItem key={suggestion.id} suggestion={suggestion} />
          ))}
        </SidebarMenu>
      )}

      <LabelFormDialog
        open={open}
        onOpenChange={setOpen}
        title="새 라벨 만들기"
        submitLabel="만들기"
        isPending={createLabel.isPending}
        onSubmit={handleCreate}
      />
    </SidebarGroup>
  )
}
