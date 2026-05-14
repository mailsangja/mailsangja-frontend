import { useMemo, useState } from "react"
import { KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable"

import { useUpdateLabel } from "@/mutations/labels"
import type { LabelListItem } from "@/types/label"

export function useLabelOrder(serverLabels: LabelListItem[]) {
  const [labelOrder, setLabelOrder] = useState<string[]>([])
  const updateLabel = useUpdateLabel()

  const orderedLabels = useMemo(() => {
    const serverMap = new Map(serverLabels.map((l) => [l.id, l]))
    const existing = labelOrder.filter((id) => serverMap.has(id)).map((id) => serverMap.get(id)!)
    const newLabels = serverLabels.filter((l) => !labelOrder.includes(l.id)).sort((a, b) => a.order - b.order)

    const result = [...existing]
    for (const label of newLabels) {
      const idx = result.findIndex((l) => l.order > label.order)
      if (idx === -1) result.push(label)
      else result.splice(idx, 0, label)
    }
    return result
  }, [serverLabels, labelOrder])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = orderedLabels.findIndex((l) => l.id === String(active.id))
    const newIndex = orderedLabels.findIndex((l) => l.id === String(over.id))
    if (oldIndex === -1 || newIndex === -1) return

    const newLabels = arrayMove(orderedLabels, oldIndex, newIndex)
    setLabelOrder(newLabels.map((l) => l.id))

    const prev = newIndex > 0 ? newLabels[newIndex - 1] : null
    const next = newIndex < newLabels.length - 1 ? newLabels[newIndex + 1] : null

    let newOrder: number
    if (!prev && !next) return
    else if (!prev) newOrder = next!.order - 1
    else if (!next) newOrder = prev.order + 1
    else newOrder = (prev.order + next.order) / 2

    updateLabel.mutate({ labelId: String(active.id), data: { order: newOrder } })
  }

  return { orderedLabels, sensors, handleDragEnd }
}
