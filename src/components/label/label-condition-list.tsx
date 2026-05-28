import {
  getLabelAttachmentValueLabel,
  getLabelConditionFieldLabel,
  getLabelConditionOperatorLabel,
  type LabelCondition,
  type LabelConditionGroup,
} from "@/types/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

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

export function LabelRuleJoiner({ label, className }: { label: "AND" | "OR"; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="h-px flex-1 bg-border" />
      <Badge variant="outline" className="px-3">
        {label}
      </Badge>
      <div className="h-px flex-1 bg-border" />
    </div>
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
          {index < conditions.length - 1 && <LabelRuleJoiner label="AND" className="-my-3" />}
        </div>
      ))}
    </div>
  )
}

interface LabelRuleGroupListProps {
  groups: LabelConditionGroup[]
  className?: string
  groupClassName?: string
  emptyMessage?: React.ReactNode
}

export function LabelRuleGroupList({ groups, className, groupClassName, emptyMessage }: LabelRuleGroupListProps) {
  if (groups.length === 0) {
    return emptyMessage ? <>{emptyMessage}</> : null
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {groups.map((group, groupIndex) => (
        <div key={groupIndex}>
          {groupIndex > 0 && <LabelRuleJoiner label="OR" className="my-1 py-2" />}
          <div className={cn("overflow-hidden rounded-xl border bg-background px-4 shadow-sm", groupClassName)}>
            <LabelConditionList conditions={group.conditions} />
          </div>
        </div>
      ))}
    </div>
  )
}
