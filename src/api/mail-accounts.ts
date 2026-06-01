import type {
  MailAccount,
  MailAccountAuthorizeResponse,
  UpdateMailAccountAppearancePayload,
} from "@/types/mail-account"
import type { AccountIconName } from "@/lib/icon-entries"

import { apiClient } from "@/lib/api-client"

export async function getMailAccounts(): Promise<MailAccount[]> {
  return apiClient.get<MailAccount[]>("/api/v1/mail-accounts")
}

export async function authorizeGoogle(params?: {
  alias?: string
  icon?: AccountIconName
  color?: string
}): Promise<MailAccountAuthorizeResponse> {
  return apiClient.get<MailAccountAuthorizeResponse>("/api/v1/mail-accounts/google/authorize", { params })
}

export async function updateMailAccountAppearance(
  mailAccountId: string,
  data: UpdateMailAccountAppearancePayload
): Promise<void> {
  await apiClient.patch<void>(`/api/v1/mail-accounts/${mailAccountId}`, data)
}

export async function deleteMailAccount(mailAccountId: string): Promise<void> {
  await apiClient.delete<void>(`/api/v1/mail-accounts/${mailAccountId}`)
}

export async function activateMailAccount(mailAccountId: string): Promise<void> {
  await apiClient.patch<void>(`/api/v1/mail-accounts/${mailAccountId}/activate`)
}

export async function deactivateMailAccount(mailAccountId: string): Promise<void> {
  await apiClient.patch<void>(`/api/v1/mail-accounts/${mailAccountId}/deactivate`)
}
