import { queryOptions, useQuery } from "@tanstack/react-query"

import { getLabelDetail, getLabelGroupDetail, getLabelGroups, getLabels } from "@/api/labels"

export const labelKeys = {
  all: () => ["labels"] as const,
  list: () => [...labelKeys.all(), "list"] as const,
  detail: (id: string) => [...labelKeys.all(), "detail", id] as const,
}

export const labelGroupKeys = {
  all: () => ["label-groups"] as const,
  list: () => [...labelGroupKeys.all(), "list"] as const,
  detail: (id: string) => [...labelGroupKeys.all(), "detail", id] as const,
}

export const labelQueries = {
  list: () =>
    queryOptions({
      queryKey: labelKeys.list(),
      queryFn: getLabels,
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: labelKeys.detail(id),
      queryFn: () => getLabelDetail(id),
      enabled: !!id,
    }),
}

export const labelGroupQueries = {
  list: () =>
    queryOptions({
      queryKey: labelGroupKeys.list(),
      queryFn: getLabelGroups,
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: labelGroupKeys.detail(id),
      queryFn: () => getLabelGroupDetail(id),
      enabled: !!id,
    }),
}

export function useLabels() {
  return useQuery(labelQueries.list())
}

export function useLabelDetail(id: string) {
  return useQuery(labelQueries.detail(id))
}

export function useLabelGroups() {
  return useQuery(labelGroupQueries.list())
}

export function useLabelGroupDetail(id: string) {
  return useQuery(labelGroupQueries.detail(id))
}
