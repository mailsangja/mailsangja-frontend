import { queryOptions, useQuery } from "@tanstack/react-query"

import { getAiModels, getAiUsages } from "@/api/ai"
import type { AiUsageType } from "@/types/ai"

export const aiKeys = {
  all: () => ["ai"] as const,
  models: () => [...aiKeys.all(), "models"] as const,
  usages: (types?: AiUsageType[]) =>
    types ? ([...aiKeys.all(), "usages", types] as const) : ([...aiKeys.all(), "usages"] as const),
}

export const aiQueries = {
  models: () =>
    queryOptions({
      queryKey: aiKeys.models(),
      queryFn: getAiModels,
    }),
  usages: (types?: AiUsageType[]) =>
    queryOptions({
      queryKey: aiKeys.usages(types),
      queryFn: () => getAiUsages(types),
    }),
}

export function useAiModels() {
  return useQuery(aiQueries.models())
}

export function useAiUsages(types?: AiUsageType[]) {
  return useQuery(aiQueries.usages(types))
}
