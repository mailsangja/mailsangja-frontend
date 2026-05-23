import {
  LABEL_ATTACHMENT_VALUE_LABELS,
  LABEL_CONDITION_FIELD_LABELS,
  LABEL_CONDITION_OPERATOR_LABELS,
  type LabelCondition,
} from "@/types/label"

export function LabelConditionList({ conditions }: { conditions: LabelCondition[] }) {
  return (
    <div className="flex flex-col gap-2">
      {conditions.map((condition, index) => (
        <div
          key={index}
          className="flex flex-wrap items-center gap-1.5 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm"
        >
          <span className="font-medium text-foreground">{LABEL_CONDITION_FIELD_LABELS[condition.field]}</span>
          <span className="text-foreground">
            {condition.field === "HAS_ATTACHMENT"
              ? (LABEL_ATTACHMENT_VALUE_LABELS[condition.value] ?? condition.value)
              : condition.value}
          </span>
          {condition.field !== "HAS_ATTACHMENT" && (
            <span className="text-muted-foreground">{LABEL_CONDITION_OPERATOR_LABELS[condition.operator]}</span>
          )}
        </div>
      ))}
    </div>
  )
}
