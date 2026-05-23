import { useState, useRef, useEffect } from "react"
import { createFileRoute, Link, useLocation } from "@tanstack/react-router"
import { DndContext, closestCenter } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { ChevronRight, GripVertical, Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getErrorMessage } from "@/lib/http-error"
import { useCreateLabel } from "@/mutations/labels"
import { useLabels } from "@/queries/labels"
import { useLabelOrder } from "@/hooks/use-label-order"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LabelFormDialog, type LabelFormData } from "@/components/label/label-form-dialog"
import type { LabelListItem } from "@/types/label"

export const Route = createFileRoute("/_authenticated/settings/label/")({
  component: SettingsLabelPage,
})

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
  const createLabel = useCreateLabel()

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
    </ScrollArea>
  )
}
