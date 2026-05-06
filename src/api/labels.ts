import { apiClient } from "@/lib/api-client"
import type {
  CreateLabelGroupPayload,
  CreateLabelPayload,
  LabelDetail,
  LabelGroupItem,
  LabelListItem,
  UpdateLabelGroupPayload,
  UpdateLabelPayload,
  UpdateLabelRulePayload,
} from "@/types/label"

export async function getLabels(): Promise<LabelListItem[]> {
  return apiClient.get<LabelListItem[]>("/api/v1/labels")
}

export async function getLabelDetail(labelId: string): Promise<LabelDetail> {
  return apiClient.get<LabelDetail>(`/api/v1/labels/${labelId}`)
}

export async function createLabel(data: CreateLabelPayload): Promise<LabelDetail> {
  return apiClient.post<LabelDetail>("/api/v1/labels", data)
}

export async function updateLabel(labelId: string, data: UpdateLabelPayload): Promise<LabelDetail> {
  return apiClient.patch<LabelDetail>(`/api/v1/labels/${labelId}`, data)
}

export async function updateLabelRule(labelId: string, data: UpdateLabelRulePayload): Promise<LabelDetail> {
  return apiClient.patch<LabelDetail>(`/api/v1/labels/${labelId}/rule`, data)
}

export async function deleteLabel(labelId: string): Promise<void> {
  return apiClient.delete<void>(`/api/v1/labels/${labelId}`)
}

export async function getLabelGroups(): Promise<LabelGroupItem[]> {
  return apiClient.get<LabelGroupItem[]>("/api/v1/label-groups")
}

export async function getLabelGroupDetail(labelGroupId: string): Promise<LabelGroupItem> {
  return apiClient.get<LabelGroupItem>(`/api/v1/label-groups/${labelGroupId}`)
}

export async function createLabelGroup(data: CreateLabelGroupPayload): Promise<LabelGroupItem> {
  return apiClient.post<LabelGroupItem>("/api/v1/label-groups", data)
}

export async function updateLabelGroup(labelGroupId: string, data: UpdateLabelGroupPayload): Promise<LabelGroupItem> {
  return apiClient.patch<LabelGroupItem>(`/api/v1/label-groups/${labelGroupId}`, data)
}

export async function deleteLabelGroup(labelGroupId: string): Promise<void> {
  return apiClient.delete<void>(`/api/v1/label-groups/${labelGroupId}`)
}
