import type { MailAccount } from "@/types/mail-account"

export const mockMailAccounts: MailAccount[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    isActive: true,
    provider: "GMAIL",
    emailAddress: "mailsangja@gmail.com",
    alias: "업무 메일",
    color: "#EA4335",
    icon: "gmail",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    isActive: true,
    provider: "NAVER",
    emailAddress: "mailsangja@naver.com",
    alias: "개인 메일",
    color: "#03C75A",
    icon: "naver",
  },
]
