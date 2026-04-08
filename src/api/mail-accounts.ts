import type { MailAccountAuthorizeResponse } from "@/types/mail-account"
import type { MailAccount } from "@/types/mail-account"
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
