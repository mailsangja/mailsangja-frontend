export type Provider = "GMAIL" | "NAVER"

export interface MailAccount {
  id: string
  isActive: boolean
  provider: Provider
  emailAddress: string
  alias: string
  color: string
  icon: string
  reauthorizationRequired: boolean
}

export interface MailAccountAuthorizeResponse {
  authorizationUrl: string
}

export interface UpdateMailAccountAppearancePayload {
  alias?: string
  icon?: string
  color?: string
}
