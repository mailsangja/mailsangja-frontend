export type NotificationPolicy = "URGENT" | "INHERIT" | "SILENT"

export type ConditionField =
  | "MAIL_ACCOUNT"
  | "FROM_ADDRESS"
  | "FROM_DOMAIN"
  | "TO_ADDRESS"
  | "CC_ADDRESS"
  | "SUBJECT"
  | "BODY_TEXT"
  | "HAS_ATTACHMENT"

export type ConditionOperator = "EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "BOOLEAN"

export interface LabelCondition {
  field: ConditionField
  operator: ConditionOperator
  value: string
}

export interface LabelConditionGroup {
  conditions: LabelCondition[]
}

export interface LabelRule {
  groups: LabelConditionGroup[]
}

export interface Label {
  id: string
  name: string
  colorCode: string
}

export interface ThreadLabel {
  labelId: string
  name: string
  colorCode: string
}

export const LABEL_CONDITION_FIELD_LABELS: Record<ConditionField, string> = {
  MAIL_ACCOUNT: "메일 계정",
  FROM_ADDRESS: "보낸 주소",
  FROM_DOMAIN: "보낸 도메인",
  TO_ADDRESS: "받는 주소",
  CC_ADDRESS: "참조",
  SUBJECT: "제목",
  BODY_TEXT: "본문",
  HAS_ATTACHMENT: "첨부파일",
}

export const LABEL_CONDITION_OPERATOR_LABELS: Record<ConditionOperator, string> = {
  EQUALS: "같음",
  CONTAINS: "포함",
  NOT_CONTAINS: "미포함",
  BOOLEAN: "해당함 여부",
}

export const LABEL_CONDITION_FIELDS: ConditionField[] = [
  "MAIL_ACCOUNT",
  "FROM_ADDRESS",
  "FROM_DOMAIN",
  "TO_ADDRESS",
  "CC_ADDRESS",
  "SUBJECT",
  "BODY_TEXT",
  "HAS_ATTACHMENT",
]

export const LABEL_FIELD_OPERATORS: Record<ConditionField, ConditionOperator[]> = {
  MAIL_ACCOUNT: ["EQUALS", "CONTAINS", "NOT_CONTAINS"],
  FROM_ADDRESS: ["EQUALS", "CONTAINS", "NOT_CONTAINS"],
  FROM_DOMAIN: ["EQUALS", "CONTAINS", "NOT_CONTAINS"],
  TO_ADDRESS: ["EQUALS", "CONTAINS", "NOT_CONTAINS"],
  CC_ADDRESS: ["EQUALS", "CONTAINS", "NOT_CONTAINS"],
  SUBJECT: ["EQUALS", "CONTAINS", "NOT_CONTAINS"],
  BODY_TEXT: ["CONTAINS", "NOT_CONTAINS"],
  HAS_ATTACHMENT: ["BOOLEAN"],
}

export const LABEL_ATTACHMENT_OPTIONS = [
  { value: "true", label: "포함" },
  { value: "false", label: "포함안함" },
]

export const LABEL_ATTACHMENT_VALUE_LABELS: Record<string, string> = {
  true: "포함",
  false: "포함안함",
}

export interface LabelListItem extends Label {
  order: number
  unreadThreadCount: number
}

export interface LabelDetail extends Label {
  order: number
  notificationPolicy: NotificationPolicy
  rule: LabelRule | null
}

export interface CreateLabelPayload {
  name: string
  colorCode: string
  notificationPolicy?: NotificationPolicy
  order?: number
  rule?: LabelRule
}

export interface UpdateLabelPayload {
  name?: string
  colorCode?: string
  notificationPolicy?: NotificationPolicy
  order?: number
}

export type UpdateLabelRulePayload = LabelRule

export interface LabelGroupItem {
  id: string
  name: string
  order: number
  labelIds: string[]
}

export interface CreateLabelGroupPayload {
  name: string
  labelIds: string[]
  order?: number
}

export interface UpdateLabelGroupPayload {
  name?: string
  labelIds?: string[]
  order?: number
}

export type LabelSuggestion = LabelListItem

export type ApproveLabelSuggestionPayload = CreateLabelPayload
