import type { ConditionField, ConditionOperator, LabelCondition } from "@/types/label"

const FIELD_LABELS: Record<ConditionField, string> = {
  MAIL_ACCOUNT: "메일 계정",
  FROM_ADDRESS: "보낸 주소",
  FROM_DOMAIN: "보낸 도메인",
  TO_ADDRESS: "받는 주소",
  CC_ADDRESS: "참조",
  SUBJECT: "제목",
  BODY_TEXT: "본문",
  HAS_ATTACHMENT: "첨부파일",
}

const OPERATOR_LABELS: Record<ConditionOperator, string> = {
  EQUALS: "같음",
  CONTAINS: "포함",
  NOT_CONTAINS: "미포함",
  BOOLEAN: "해당함 여부",
}

const ATTACHMENT_VALUE_LABELS: Record<string, string> = {
  true: "포함",
  false: "포함안함",
}

export function LabelConditionList({ conditions }: { conditions: LabelCondition[] }) {
  return (
    <div className="flex flex-col gap-2">
      {conditions.map((condition, index) => (
        <div
          key={index}
          className="flex flex-wrap items-center gap-1.5 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm"
        >
          <span className="font-medium text-foreground">{FIELD_LABELS[condition.field]}</span>
          <span className="text-foreground">
            {condition.field === "HAS_ATTACHMENT"
              ? (ATTACHMENT_VALUE_LABELS[condition.value] ?? condition.value)
              : condition.value}
          </span>
          {condition.field !== "HAS_ATTACHMENT" && (
            <span className="text-muted-foreground">{OPERATOR_LABELS[condition.operator]}</span>
          )}
        </div>
      ))}
    </div>
  )
}
