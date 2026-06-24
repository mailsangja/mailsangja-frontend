import { m } from "@/paraglide/messages"

export type NotificationPolicy = "URGENT" | "INHERIT" | "SILENT"

export function getNotificationPolicyLabel(policy: NotificationPolicy): string {
  switch (policy) {
    case "URGENT":
      return m.notification_policy_urgent()
    case "INHERIT":
      return m.notification_policy_inherit()
    case "SILENT":
      return m.notification_policy_silent()
  }
}

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

export function getLabelConditionFieldLabel(field: ConditionField): string {
  switch (field) {
    case "MAIL_ACCOUNT":
      return m.condition_field_mail_account()
    case "FROM_ADDRESS":
      return m.condition_field_from_address()
    case "FROM_DOMAIN":
      return m.condition_field_from_domain()
    case "TO_ADDRESS":
      return m.condition_field_to_address()
    case "CC_ADDRESS":
      return m.condition_field_cc_address()
    case "SUBJECT":
      return m.condition_field_subject()
    case "BODY_TEXT":
      return m.condition_field_body_text()
    case "HAS_ATTACHMENT":
      return m.condition_field_has_attachment()
  }
}

export function getLabelConditionOperatorLabel(operator: ConditionOperator): string {
  switch (operator) {
    case "EQUALS":
      return m.condition_operator_equals()
    case "CONTAINS":
      return m.condition_operator_contains()
    case "NOT_CONTAINS":
      return m.condition_operator_not_contains()
    case "BOOLEAN":
      return m.condition_operator_boolean()
  }
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

export const LABEL_ATTACHMENT_OPTIONS = ["true", "false"] as const

export function getLabelAttachmentValueLabel(value: string): string | undefined {
  if (value === "true") return m.condition_attachment_true()
  if (value === "false") return m.condition_attachment_false()
  return undefined
}

export interface LabelListItem extends Label {
  order: number
  notificationPolicy: NotificationPolicy
  isSensitive: boolean
  unreadThreadCount: number
}

export interface LabelDetail extends Label {
  order: number
  isSensitive: boolean
  notificationPolicy: NotificationPolicy
  rule: LabelRule | null
}

export interface CreateLabelPayload {
  name: string
  colorCode: string
  notificationPolicy?: NotificationPolicy
  order?: number
  isSensitive?: boolean
  rule?: LabelRule
}

export interface UpdateLabelPayload {
  name?: string
  colorCode?: string
  notificationPolicy?: NotificationPolicy
  order?: number
  isSensitive?: boolean
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
