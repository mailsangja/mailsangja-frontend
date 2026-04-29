export type Plan = "FREE" | "PRO" | "ENTERPRISE"

export interface User {
  id: string
  name: string
  username: string
  plan: Plan
  creditUsage: number
  defaultMailAccountId?: string
}

export interface UpdateDefaultAccountPayload {
  mailAccountId: string
}

export interface RegisterFcmTokenPayload {
  fcmToken: string
}

export type UnregisterFcmTokenPayload = RegisterFcmTokenPayload
