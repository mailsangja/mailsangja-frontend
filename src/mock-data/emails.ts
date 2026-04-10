import type {
  Attachment,
  InboxMessage,
  InboxThreadDetail,
  InboxThreadSummary,
  MarkerSliceResponse,
  SupportedMailboxId,
} from "@/types/email"

const accountIds = {
  gmail: "550e8400-e29b-41d4-a716-446655440001",
  naver: "550e8400-e29b-41d4-a716-446655440002",
} as const

function attachment(id: string, filename: string, mimeType: string, size: number): Attachment {
  return {
    id,
    gmailAttachmentId: `gmail-${id}`,
    filename,
    mimeType,
    size,
  }
}

function message(data: InboxMessage): InboxMessage {
  return data
}

function thread(data: InboxThreadDetail): InboxThreadDetail {
  return data
}

const inboxDetails: InboxThreadDetail[] = [
  thread({
    threadId: "0d5a0c9e-9d26-49d4-b5ff-100000000001",
    gmailThreadId: "gmail-thread-001",
    accountId: accountIds.gmail,
    latestSubject: "프로젝트 킥오프 일정 확정",
    isRead: false,
    lastMessageAt: "2026-04-10T08:40:00+09:00",
    messages: [
      message({
        id: "5f4a0c9e-9d26-49d4-b5ff-200000000001",
        gmailMessageId: "gmail-message-001-1",
        subject: "프로젝트 킥오프 일정 확정",
        direction: "INBOUND",
        fromAddress: "pm@company.com",
        toAddresses: ["mailsangja@gmail.com"],
        ccAddresses: ["design@company.com"],
        snippet: "다음 주 월요일 오전 10시로 킥오프 미팅을 확정했습니다.",
        isRead: false,
        sentAt: "2026-04-10T08:40:00+09:00",
        bodyText: "다음 주 월요일 오전 10시로 킥오프 미팅을 확정했습니다.\n회의 링크는 별도 공유드리겠습니다.",
        bodyHtml:
          "<p>다음 주 월요일 오전 10시로 킥오프 미팅을 확정했습니다.</p><p>회의 링크는 별도 공유드리겠습니다.</p>",
        attachments: [],
      }),
    ],
  }),
  thread({
    threadId: "0d5a0c9e-9d26-49d4-b5ff-100000000002",
    gmailThreadId: "gmail-thread-002",
    accountId: accountIds.naver,
    latestSubject: "견적서 검토 부탁드립니다",
    isRead: true,
    lastMessageAt: "2026-04-09T17:15:00+09:00",
    messages: [
      message({
        id: "5f4a0c9e-9d26-49d4-b5ff-200000000002",
        gmailMessageId: "gmail-message-002-1",
        subject: "견적서 검토 부탁드립니다",
        direction: "INBOUND",
        fromAddress: "sales@vendor.io",
        toAddresses: ["mailsangja@naver.com"],
        ccAddresses: [],
        snippet: "첨부드린 2분기 제안 견적서를 확인 부탁드립니다.",
        isRead: true,
        sentAt: "2026-04-09T17:15:00+09:00",
        bodyText: "첨부드린 2분기 제안 견적서를 확인 부탁드립니다.",
        bodyHtml: "<p>첨부드린 2분기 제안 견적서를 확인 부탁드립니다.</p>",
        attachments: [attachment("30000000-0000-0000-0000-000000000001", "quote-q2.pdf", "application/pdf", 240512)],
      }),
    ],
  }),
  thread({
    threadId: "0d5a0c9e-9d26-49d4-b5ff-100000000003",
    gmailThreadId: "gmail-thread-003",
    accountId: accountIds.gmail,
    latestSubject: "디자인 시안 피드백 요청",
    isRead: true,
    lastMessageAt: "2026-04-09T10:05:00+09:00",
    messages: [
      message({
        id: "5f4a0c9e-9d26-49d4-b5ff-200000000003",
        gmailMessageId: "gmail-message-003-1",
        subject: "디자인 시안 피드백 요청",
        direction: "INBOUND",
        fromAddress: "designer@studio.kr",
        toAddresses: ["mailsangja@gmail.com"],
        ccAddresses: [],
        snippet: "랜딩 페이지 시안을 공유드립니다. 확인 후 코멘트 부탁드립니다.",
        isRead: true,
        sentAt: "2026-04-09T10:05:00+09:00",
        bodyText: "랜딩 페이지 시안을 공유드립니다. 확인 후 코멘트 부탁드립니다.",
        bodyHtml: "<p>랜딩 페이지 시안을 공유드립니다. 확인 후 코멘트 부탁드립니다.</p>",
        attachments: [attachment("30000000-0000-0000-0000-000000000002", "landing-v3.png", "image/png", 180422)],
      }),
    ],
  }),
  thread({
    threadId: "0d5a0c9e-9d26-49d4-b5ff-100000000004",
    gmailThreadId: "gmail-thread-004",
    accountId: accountIds.naver,
    latestSubject: "주간 리포트 공유",
    isRead: false,
    lastMessageAt: "2026-04-08T18:20:00+09:00",
    messages: [
      message({
        id: "5f4a0c9e-9d26-49d4-b5ff-200000000004",
        gmailMessageId: "gmail-message-004-1",
        subject: "주간 리포트 공유",
        direction: "INBOUND",
        fromAddress: "ops@company.com",
        toAddresses: ["mailsangja@naver.com"],
        ccAddresses: ["team@company.com"],
        snippet: "이번 주 운영 지표와 주요 이슈를 정리했습니다.",
        isRead: false,
        sentAt: "2026-04-08T18:20:00+09:00",
        bodyText: "이번 주 운영 지표와 주요 이슈를 정리했습니다.",
        bodyHtml: "<p>이번 주 운영 지표와 주요 이슈를 정리했습니다.</p>",
        attachments: [],
      }),
    ],
  }),
]

const sentDetails: InboxThreadDetail[] = [
  thread({
    threadId: "0d5a0c9e-9d26-49d4-b5ff-100000000101",
    gmailThreadId: "gmail-thread-101",
    accountId: accountIds.gmail,
    latestSubject: "Re: 프로젝트 킥오프 일정 확정",
    isRead: true,
    lastMessageAt: "2026-04-10T09:05:00+09:00",
    messages: [
      message({
        id: "5f4a0c9e-9d26-49d4-b5ff-200000000101",
        gmailMessageId: "gmail-message-101-1",
        subject: "Re: 프로젝트 킥오프 일정 확정",
        direction: "OUTBOUND",
        fromAddress: "mailsangja@gmail.com",
        toAddresses: ["pm@company.com"],
        ccAddresses: ["design@company.com"],
        snippet: "월요일 오전 10시 확인했습니다. 자료 준비해서 참석하겠습니다.",
        isRead: true,
        sentAt: "2026-04-10T09:05:00+09:00",
        bodyText: "월요일 오전 10시 확인했습니다. 자료 준비해서 참석하겠습니다.",
        bodyHtml: "<p>월요일 오전 10시 확인했습니다. 자료 준비해서 참석하겠습니다.</p>",
        attachments: [],
      }),
    ],
  }),
  thread({
    threadId: "0d5a0c9e-9d26-49d4-b5ff-100000000102",
    gmailThreadId: "gmail-thread-102",
    accountId: accountIds.naver,
    latestSubject: "회의록 전달드립니다",
    isRead: true,
    lastMessageAt: "2026-04-09T19:45:00+09:00",
    messages: [
      message({
        id: "5f4a0c9e-9d26-49d4-b5ff-200000000102",
        gmailMessageId: "gmail-message-102-1",
        subject: "회의록 전달드립니다",
        direction: "OUTBOUND",
        fromAddress: "mailsangja@naver.com",
        toAddresses: ["lead@company.com", "team@company.com"],
        ccAddresses: [],
        snippet: "오늘 회의에서 논의한 사항을 정리해 공유드립니다.",
        isRead: true,
        sentAt: "2026-04-09T19:45:00+09:00",
        bodyText: "오늘 회의에서 논의한 사항을 정리해 공유드립니다.",
        bodyHtml: "<p>오늘 회의에서 논의한 사항을 정리해 공유드립니다.</p>",
        attachments: [
          attachment(
            "30000000-0000-0000-0000-000000000003",
            "meeting-notes.docx",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            90112
          ),
        ],
      }),
    ],
  }),
  thread({
    threadId: "0d5a0c9e-9d26-49d4-b5ff-100000000103",
    gmailThreadId: "gmail-thread-103",
    accountId: accountIds.gmail,
    latestSubject: "계약서 초안 전달",
    isRead: true,
    lastMessageAt: "2026-04-08T11:10:00+09:00",
    messages: [
      message({
        id: "5f4a0c9e-9d26-49d4-b5ff-200000000103",
        gmailMessageId: "gmail-message-103-1",
        subject: "계약서 초안 전달",
        direction: "OUTBOUND",
        fromAddress: "mailsangja@gmail.com",
        toAddresses: ["legal@partner.com"],
        ccAddresses: ["ceo@partner.com"],
        snippet: "검토 부탁드리며 수정 의견 주시면 반영하겠습니다.",
        isRead: true,
        sentAt: "2026-04-08T11:10:00+09:00",
        bodyText: "검토 부탁드리며 수정 의견 주시면 반영하겠습니다.",
        bodyHtml: "<p>검토 부탁드리며 수정 의견 주시면 반영하겠습니다.</p>",
        attachments: [
          attachment("30000000-0000-0000-0000-000000000004", "contract-draft.pdf", "application/pdf", 512334),
        ],
      }),
    ],
  }),
]

const allDetails = [...inboxDetails, ...sentDetails]

function toSummary(detail: InboxThreadDetail): InboxThreadSummary {
  const lastMessage = detail.messages.at(-1)

  return {
    threadId: detail.threadId,
    gmailThreadId: detail.gmailThreadId,
    accountId: detail.accountId,
    latestSubject: detail.latestSubject,
    participantAddress:
      lastMessage?.direction === "OUTBOUND" ? (lastMessage.toAddresses[0] ?? "") : (lastMessage?.fromAddress ?? ""),
    snippet: lastMessage?.snippet ?? "",
    isRead: detail.isRead,
    lastMessageAt: detail.lastMessageAt,
    attachments: detail.messages.flatMap((message) => message.attachments),
  }
}

export const mockThreadDetails = Object.fromEntries(allDetails.map((detail) => [detail.threadId, detail])) as Record<
  string,
  InboxThreadDetail
>

export const mockThreadSummaries: Record<SupportedMailboxId, InboxThreadSummary[]> = {
  INBOX: inboxDetails.map(toSummary),
  SENT: sentDetails.map(toSummary),
}

export function getMockMailboxThreads(
  mailbox: SupportedMailboxId,
  params: { marker?: string; size?: number } = {}
): MarkerSliceResponse<InboxThreadSummary> {
  const items = mockThreadSummaries[mailbox]
  const size = params.size ?? 50
  const startIndex = params.marker ? items.findIndex((item) => item.threadId === params.marker) + 1 : 0
  const content = items.slice(startIndex, startIndex + size)
  const lastItem = content.at(-1)
  const hasNext = startIndex + size < items.length

  return {
    content,
    nextMarker: hasNext ? (lastItem?.threadId ?? null) : null,
    hasNext,
  }
}
