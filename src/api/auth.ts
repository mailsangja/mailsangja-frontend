import type { LoginPayload } from "@/types/auth"
import type { RegisterPayload } from "@/types/auth"
import type { User } from "@/types/user"

import { apiClient } from "@/lib/api-client"

export async function login(data: LoginPayload): Promise<User> {
  return apiClient.post<User>("/api/v1/auth/login", data)
}

export async function register(data: RegisterPayload): Promise<User> {
  return apiClient.post<User>("/api/v1/auth/register", data)
}
