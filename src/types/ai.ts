import { m } from "@/paraglide/messages"

export type AiUsageType = "MAIL_DRAFT" | "MAIL_REVIEW" | "LABEL_SUGGESTION"

export function getAiUsageTypeLabel(type: AiUsageType): string {
  switch (type) {
    case "MAIL_DRAFT":
      return m.ai_usage_mail_draft()
    case "MAIL_REVIEW":
      return m.ai_usage_mail_review()
    case "LABEL_SUGGESTION":
      return m.ai_usage_label_suggestion()
  }
}

export interface AiUsageItem {
  type: AiUsageType
  used: number
  limit: number
}

export interface AiUsageListResponse {
  usages: AiUsageItem[]
}
