import { queryOptions, useQuery } from "@tanstack/react-query"

import { getAiUsages } from "@/api/ai"
import type { AiUsageType } from "@/types/ai"

export const aiKeys = {
  all: () => ["ai"] as const,
  usages: (types?: AiUsageType[]) =>
    types ? ([...aiKeys.all(), "usages", types] as const) : ([...aiKeys.all(), "usages"] as const),
}

export const aiQueries = {
  usages: (types?: AiUsageType[]) =>
    queryOptions({
      queryKey: aiKeys.usages(types),
      queryFn: () => getAiUsages(types),
    }),
}

export function useAiUsages(types?: AiUsageType[]) {
  return useQuery(aiQueries.usages(types))
}
