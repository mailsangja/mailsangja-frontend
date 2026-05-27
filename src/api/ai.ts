import { apiClient } from "@/lib/api-client"
import type { AiUsageListResponse, AiUsageType } from "@/types/ai"

export async function getAiUsages(types?: AiUsageType[]): Promise<AiUsageListResponse> {
  return apiClient.get<AiUsageListResponse>("/api/v1/ai/usages", {
    params: { type: types },
  })
}
