import { useMutation } from "@tanstack/react-query"

import {
  approveLabelSuggestion,
  createLabel,
  createLabelGroup,
  createLabelSuggestions,
  deleteLabel,
  deleteLabelGroup,
  deleteLabelSuggestion,
  updateLabel,
  updateLabelGroup,
  updateLabelRule,
} from "@/api/labels"
import { queryClient } from "@/lib/query-client"
import { labelGroupKeys, labelKeys, labelSuggestionKeys } from "@/queries/labels"
import type {
  CreateLabelGroupPayload,
  CreateLabelPayload,
  UpdateLabelGroupPayload,
  UpdateLabelPayload,
  UpdateLabelRulePayload,
} from "@/types/label"

function invalidateLabels() {
  void queryClient.invalidateQueries({ queryKey: labelKeys.all() })
}

function invalidateLabelSuggestions() {
  void queryClient.invalidateQueries({ queryKey: labelSuggestionKeys.all() })
}

function invalidateLabelGroups() {
  void queryClient.invalidateQueries({ queryKey: labelGroupKeys.all() })
}

export const labelMutationOptions = {
  create: () => ({
    mutationFn: (data: CreateLabelPayload) => createLabel(data),
    onSuccess: invalidateLabels,
  }),
  update: () => ({
    mutationFn: ({ labelId, data }: { labelId: string; data: UpdateLabelPayload }) => updateLabel(labelId, data),
    onSuccess: invalidateLabels,
  }),
  updateRule: () => ({
    mutationFn: ({ labelId, data }: { labelId: string; data: UpdateLabelRulePayload }) =>
      updateLabelRule(labelId, data),
    onSuccess: invalidateLabels,
  }),
  delete: () => ({
    mutationFn: (labelId: string) => deleteLabel(labelId),
    onSuccess: invalidateLabels,
  }),
}

export const labelGroupMutationOptions = {
  create: () => ({
    mutationFn: (data: CreateLabelGroupPayload) => createLabelGroup(data),
    onSuccess: invalidateLabelGroups,
  }),
  update: () => ({
    mutationFn: ({ labelGroupId, data }: { labelGroupId: string; data: UpdateLabelGroupPayload }) =>
      updateLabelGroup(labelGroupId, data),
    onSuccess: invalidateLabelGroups,
  }),
  delete: () => ({
    mutationFn: (labelGroupId: string) => deleteLabelGroup(labelGroupId),
    onSuccess: invalidateLabelGroups,
  }),
}

export function useCreateLabel() {
  return useMutation(labelMutationOptions.create())
}

export function useUpdateLabel() {
  return useMutation(labelMutationOptions.update())
}

export function useUpdateLabelRule() {
  return useMutation(labelMutationOptions.updateRule())
}

export function useDeleteLabel() {
  return useMutation(labelMutationOptions.delete())
}

export function useCreateLabelGroup() {
  return useMutation(labelGroupMutationOptions.create())
}

export function useUpdateLabelGroup() {
  return useMutation(labelGroupMutationOptions.update())
}

export function useDeleteLabelGroup() {
  return useMutation(labelGroupMutationOptions.delete())
}

export const labelSuggestionMutationOptions = {
  create: () => ({
    mutationFn: () => createLabelSuggestions(),
    onSuccess: invalidateLabelSuggestions,
  }),
  approve: () => ({
    mutationFn: ({ suggestionId, data }: { suggestionId: string; data: CreateLabelPayload }) =>
      approveLabelSuggestion(suggestionId, data),
    onSuccess: () => {
      invalidateLabels()
      invalidateLabelSuggestions()
    },
  }),
  delete: () => ({
    mutationFn: (suggestionId: string) => deleteLabelSuggestion(suggestionId),
    onSuccess: invalidateLabelSuggestions,
  }),
}

export function useCreateLabelSuggestions() {
  return useMutation(labelSuggestionMutationOptions.create())
}

export function useApproveLabelSuggestion() {
  return useMutation(labelSuggestionMutationOptions.approve())
}

export function useDeleteLabelSuggestion() {
  return useMutation(labelSuggestionMutationOptions.delete())
}
