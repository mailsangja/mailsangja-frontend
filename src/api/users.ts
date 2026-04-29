import type { RegisterFcmTokenPayload, UnregisterFcmTokenPayload, UpdateDefaultAccountPayload } from "@/types/user"
import type { User } from "@/types/user"

import { apiClient } from "@/lib/api-client"

export async function getUserInfo(): Promise<User> {
  return apiClient.get<User>("/api/v1/users/me")
}

export async function updateDefaultAccount(data: UpdateDefaultAccountPayload): Promise<void> {
  await apiClient.patch<void>("/api/v1/users/me/default-account", data)
}

export async function registerFcmToken(data: RegisterFcmTokenPayload): Promise<void> {
  await apiClient.post<void>("/api/v1/users/me/fcm-token", data)
}

export async function unregisterFcmToken(data: UnregisterFcmTokenPayload): Promise<void> {
  await apiClient.delete<void>("/api/v1/users/me/fcm-token", { body: data })
}
