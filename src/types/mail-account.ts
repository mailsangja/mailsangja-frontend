export type Provider = "GMAIL" | "NAVER"

export interface MailAccount {
  id: string
  isActive: boolean
  provider: Provider
  emailAddress: string
  alias: string
  color: string
  icon: string
}

export interface MailAccountAuthorizeResponse {
  authorizationUrl: string
}
