import { apiClient } from "@/lib/api-client"
import type { AiModelListResponse, AiUsageListResponse, AiUsageType } from "@/types/ai"

export async function getAiUsages(types?: AiUsageType[]): Promise<AiUsageListResponse> {
  return apiClient.get<AiUsageListResponse>("/api/v1/ai/usages", {
    params: { type: types },
  })
}

export async function getAiModels(): Promise<AiModelListResponse> {
  return apiClient.get<AiModelListResponse>("/api/v1/ai/models")
}
