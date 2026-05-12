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

export interface LabelListItem {
  id: string
  name: string
  colorCode: string
  order: number
  unreadThreadCount: number
}

export interface LabelDetail {
  id: string
  name: string
  colorCode: string
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

export interface UpdateLabelRulePayload {
  rule: LabelRule
}

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
