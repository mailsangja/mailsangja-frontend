import type { UpdateDefaultAccountPayload } from "@/types/user"
import type { User } from "@/types/user"

import { apiClient } from "@/lib/api-client"

export async function getUserInfo(): Promise<User> {
  return apiClient.get<User>("/api/v1/users/me")
}

export async function updateDefaultAccount(data: UpdateDefaultAccountPayload): Promise<void> {
  await apiClient.patch<void>("/api/v1/users/me/default-account", data)
}
