import { cn } from "@/lib/utils"
import type { ThreadLabel } from "@/types/label"

export type LabelChipMap = Map<string, Pick<ThreadLabel, "name" | "colorCode">>

interface LabelChipProps {
  label: Pick<ThreadLabel, "name" | "colorCode">
  className?: string
}

interface LabelChipListProps {
  labels: ThreadLabel[]
  labelsColorMap?: LabelChipMap
  hideMissingLabels?: boolean
  className?: string
}

export function LabelChip({ label, className }: LabelChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-background px-1.5 py-0.5 text-xs font-medium text-foreground",
        className
      )}
      style={{ backgroundColor: `color-mix(in srgb, ${label.colorCode} 8%, transparent)` }}
    >
      <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: label.colorCode }} />
      {label.name}
    </span>
  )
}

export function LabelChipList({ labels, labelsColorMap, hideMissingLabels = false, className }: LabelChipListProps) {
  const visibleLabels = hideMissingLabels ? labels.filter((label) => labelsColorMap?.has(label.labelId)) : labels

  if (visibleLabels.length === 0) return null

  return (
    <>
      {visibleLabels.map((label) => {
        const mappedLabel = labelsColorMap?.get(label.labelId)

        return (
          <LabelChip
            key={label.labelId}
            label={{
              name: mappedLabel?.name ?? label.name,
              colorCode: mappedLabel?.colorCode ?? label.colorCode,
            }}
            className={className}
          />
        )
      })}
    </>
  )
}
