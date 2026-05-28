import {
  getLabelAttachmentValueLabel,
  getLabelConditionFieldLabel,
  getLabelConditionOperatorLabel,
  type LabelCondition,
} from "@/types/label"
import { Badge } from "@/components/ui/badge"

function FieldBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-sm font-semibold text-primary">
      {children}
    </span>
  )
}

function ValueBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-amber-500/15 px-2 py-0.5 text-sm font-semibold text-amber-600 dark:text-amber-400">
      {children}
    </span>
  )
}

function OperatorBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-emerald-500/15 px-2 py-0.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
      {children}
    </span>
  )
}

function ConditionSentence({ condition }: { condition: LabelCondition }) {
  const fieldLabel = getLabelConditionFieldLabel(condition.field)

  if (condition.field === "HAS_ATTACHMENT") {
    const valueLabel = getLabelAttachmentValueLabel(condition.value) ?? condition.value
    return (
      <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-base leading-normal">
        <FieldBadge>{fieldLabel}</FieldBadge>
        <span className="text-muted-foreground">이</span>
        <OperatorBadge>{valueLabel}</OperatorBadge>
        <span className="text-foreground">입니다.</span>
      </p>
    )
  }

  if (condition.operator === "EQUALS") {
    return (
      <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-base leading-normal">
        <FieldBadge>{fieldLabel}</FieldBadge>
        <span className="text-muted-foreground">이</span>
        <ValueBadge>{condition.value}</ValueBadge>
        <span className="text-muted-foreground">와</span>
        <OperatorBadge>동일</OperatorBadge>
        <span className="text-foreground">합니다.</span>
      </p>
    )
  }

  if (condition.operator === "CONTAINS") {
    return (
      <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-base leading-normal">
        <FieldBadge>{fieldLabel}</FieldBadge>
        <span className="text-muted-foreground">에</span>
        <ValueBadge>{condition.value}</ValueBadge>
        <span className="text-muted-foreground">이</span>
        <OperatorBadge>{getLabelConditionOperatorLabel(condition.operator)}</OperatorBadge>
        <span className="text-foreground">됩니다.</span>
      </p>
    )
  }

  if (condition.operator === "NOT_CONTAINS") {
    return (
      <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-base leading-normal">
        <FieldBadge>{fieldLabel}</FieldBadge>
        <span className="text-muted-foreground">에</span>
        <ValueBadge>{condition.value}</ValueBadge>
        <span className="text-muted-foreground">이</span>
        <OperatorBadge>{getLabelConditionOperatorLabel(condition.operator)}</OperatorBadge>
        <span className="text-foreground">됩니다.</span>
      </p>
    )
  }

  return null
}

export function LabelConditionList({ conditions }: { conditions: LabelCondition[] }) {
  return (
    <div className="flex flex-col">
      {conditions.map((condition, index) => (
        <div key={index}>
          <div className="py-3">
            <ConditionSentence condition={condition} />
          </div>
          {index < conditions.length - 1 && (
            <div className="-my-3 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <Badge variant="outline" className="px-3">
                AND
              </Badge>
              <div className="h-px flex-1 bg-border" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
