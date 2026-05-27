export type AiUsageType = "MAIL_DRAFT" | "MAIL_REVIEW" | "LABEL_SUGGESTION"

export const AI_USAGE_TYPE_LABELS: Record<AiUsageType, string> = {
  MAIL_DRAFT: "AI 초안 생성",
  MAIL_REVIEW: "AI 메일 검토",
  LABEL_SUGGESTION: "라벨 제안",
}

export interface AiUsageItem {
  type: AiUsageType
  used: number
  limit: number
}

export interface AiUsageListResponse {
  usages: AiUsageItem[]
}
