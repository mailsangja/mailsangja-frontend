import {
  LABEL_ATTACHMENT_VALUE_LABELS,
  LABEL_CONDITION_FIELD_LABELS,
  LABEL_CONDITION_OPERATOR_LABELS,
  type LabelCondition,
} from "@/types/label"

export function LabelConditionList({ conditions }: { conditions: LabelCondition[] }) {
  return (
    <div className="flex flex-col divide-y divide-border/50">
      {conditions.map((condition, index) => (
        <div key={index} className="flex flex-wrap items-baseline gap-2 py-2 text-sm first:pt-0 last:pb-0">
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
            {LABEL_CONDITION_FIELD_LABELS[condition.field]}
          </span>
          <span className="text-sm text-foreground">
            {condition.field === "HAS_ATTACHMENT"
              ? (LABEL_ATTACHMENT_VALUE_LABELS[condition.value] ?? condition.value)
              : condition.value}
          </span>
          {condition.field !== "HAS_ATTACHMENT" && (
            <span className="text-xs text-muted-foreground">{LABEL_CONDITION_OPERATOR_LABELS[condition.operator]}</span>
          )}
        </div>
      ))}
    </div>
  )
}
