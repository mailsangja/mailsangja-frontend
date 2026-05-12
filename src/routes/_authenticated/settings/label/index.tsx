import { useState, useRef, useEffect, useMemo } from "react"
import { createFileRoute, Link, useLocation } from "@tanstack/react-router"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { ChevronRight, GripVertical, Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LabelFilterDialog } from "@/components/label-filter-dialog"
import { getErrorMessage } from "@/lib/http-error"
import { useCreateLabel, useUpdateLabel } from "@/mutations/labels"
import { useLabels } from "@/queries/labels"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { LabelListItem } from "@/types/label"

export const Route = createFileRoute("/_authenticated/settings/label/")({
  component: SettingsLabelPage,
})

const LABEL_COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#64748b",
  "#78716c",
  "#6b7280",
]

function ColorPicker({ selected, onSelect }: { selected: string; onSelect: (color: string) => void }) {
  return (
    <div className="grid grid-cols-10 gap-1.5 p-0.5">
      {LABEL_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          className="size-6 rounded-full ring-offset-2 transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          style={{
            backgroundColor: color,
            boxShadow: selected === color ? `0 0 0 2px white, 0 0 0 4px ${color}` : undefined,
          }}
          onClick={() => onSelect(color)}
          aria-label={color}
          aria-pressed={selected === color}
        />
      ))}
    </div>
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

function CreateLabelDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [selectedColor, setSelectedColor] = useState(LABEL_COLORS[0])
  const createLabel = useCreateLabel()

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
        onError: (e) => toast.error(getErrorMessage(e, "라벨 생성에 실패했습니다.")),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        <Plus data-icon="inline-start" />
        라벨 추가
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
            <ColorPicker selected={selectedColor} onSelect={setSelectedColor} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreate} disabled={!name.trim() || createLabel.isPending}>
            만들기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SettingsLabelPage() {
  const { data: serverLabels = [], isPending, isError } = useLabels()
  const updateLabel = useUpdateLabel()
  const location = useLocation()
  const createFilterRef = useRef<HTMLDivElement>(null)
  const [labelOrder, setLabelOrder] = useState<string[]>([])

  const orderedLabels = useMemo(() => {
    const serverMap = new Map(serverLabels.map((l) => [l.id, l]))
    const existing = labelOrder.filter((id) => serverMap.has(id)).map((id) => serverMap.get(id)!)
    const newLabels = serverLabels.filter((l) => !labelOrder.includes(l.id))
    return [...existing, ...newLabels]
  }, [serverLabels, labelOrder])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    if (location.hash === "create-filter") {
      createFilterRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [location.hash])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = orderedLabels.findIndex((l) => l.id === String(active.id))
    const newIndex = orderedLabels.findIndex((l) => l.id === String(over.id))
    if (oldIndex === -1 || newIndex === -1) return

    const newLabels = arrayMove(orderedLabels, oldIndex, newIndex)
    setLabelOrder(newLabels.map((l) => l.id))

    newLabels.forEach((label, i) => {
      if (orderedLabels[i]?.id !== label.id) {
        updateLabel.mutate({ labelId: label.id, data: { order: i } })
      }
    })
  }

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="flex flex-col gap-6 px-3 pt-1 pb-4">
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

        <Card>
          <CardHeader>
            <CardTitle>라벨 추가하기</CardTitle>
            <CardDescription>이름과 색상을 지정해 새 라벨을 만들 수 있습니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateLabelDialog />
          </CardContent>
        </Card>

        <div ref={createFilterRef}>
          <Card>
            <CardHeader>
              <CardTitle>필터 만들기</CardTitle>
              <CardDescription>검색 기준에 맞는 메일에 자동으로 라벨을 적용합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <LabelFilterDialog />
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  )
}
