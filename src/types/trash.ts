export interface TrashMessage {
  messageId: string
  gmailMessageId: string
  direction: "INBOUND" | "OUTBOUND"
  subject: string
  fromAddress: string
  toAddresses: string[]
  snippet: string
  sentAt: string
  deletedAt: string
}

export interface TrashThreadSummary {
  threadId: string
  gmailThreadId: string
  accountId: string
  accountEmail: string
  deletedMessages: TrashMessage[]
}

export interface TrashThreadDetail {
  threadId: string
  gmailThreadId: string
  accountId: string
  accountEmail: string
  messages: TrashMessage[]
}
