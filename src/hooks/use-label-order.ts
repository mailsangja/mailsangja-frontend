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
    const newLabels = serverLabels.filter((l) => !labelOrder.includes(l.id))
    return [...existing, ...newLabels]
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

    newLabels.forEach((label, i) => {
      if (orderedLabels[i]?.id !== label.id) {
        updateLabel.mutate({ labelId: label.id, data: { order: i } })
      }
    })
  }

  return { orderedLabels, sensors, handleDragEnd }
}
