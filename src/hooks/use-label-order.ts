import { KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { useMutation } from "@tanstack/react-query"

import { updateLabel } from "@/api/labels"
import { queryClient } from "@/lib/query-client"
import { labelKeys } from "@/queries/labels"
import type { LabelListItem } from "@/types/label"

export function useLabelOrder(serverLabels: LabelListItem[]) {
  const { mutateAsync } = useMutation({
    mutationFn: ({ labelId, data }: { labelId: string; data: { order: number } }) => updateLabel(labelId, data),
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = serverLabels.findIndex((l) => l.id === String(active.id))
    const newIndex = serverLabels.findIndex((l) => l.id === String(over.id))
    if (oldIndex === -1 || newIndex === -1) return

    const newLabels = arrayMove(serverLabels, oldIndex, newIndex)
    const prevLabels = serverLabels

    // 진행 중인 refetch가 낙관적 업데이트를 덮어쓰지 않도록 취소
    await queryClient.cancelQueries({ queryKey: labelKeys.list() })

    // 캐시를 즉시 업데이트해 모든 구독 컴포넌트에 즉시 반영
    queryClient.setQueryData(labelKeys.list(), newLabels)

    const mutations = newLabels
      .map((label, i) => ({ label, i }))
      .filter(({ label, i }) => prevLabels[i]?.id !== label.id)
      .map(({ label, i }) => mutateAsync({ labelId: label.id, data: { order: i } }))

    try {
      await Promise.all(mutations)
    } catch {
      // 실패 시 이전 순서로 롤백
      queryClient.setQueryData(labelKeys.list(), prevLabels)
    } finally {
      // 모든 mutation 완료 후 단 한 번만 서버와 동기화
      void queryClient.invalidateQueries({ queryKey: labelKeys.all() })
    }
  }

  return { orderedLabels: serverLabels, sensors, handleDragEnd }
}
