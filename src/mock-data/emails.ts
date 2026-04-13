import type {
  Attachment,
  InboxMessage,
  InboxThreadDetail,
  InboxThreadSummary,
  MailAddress,
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

function address(email: string, name?: string): MailAddress {
  return {
    email,
    name,
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
        from: address("pm@company.com", "프로젝트 PM"),
        to: [address("mailsangja@gmail.com", "메일상자")],
        cc: [address("design@company.com", "디자인팀")],
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
        from: address("sales@vendor.io", "Vendor Sales"),
        to: [address("mailsangja@naver.com", "메일상자 네이버")],
        cc: [],
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
        from: address("designer@studio.kr", "스튜디오 디자이너"),
        to: [address("mailsangja@gmail.com", "메일상자")],
        cc: [],
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
        from: address("ops@company.com", "운영팀"),
        to: [address("mailsangja@naver.com", "메일상자 네이버")],
        cc: [address("team@company.com", "팀 공용")],
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
        from: address("mailsangja@gmail.com", "메일상자"),
        to: [address("pm@company.com", "프로젝트 PM")],
        cc: [address("design@company.com", "디자인팀")],
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
        from: address("mailsangja@naver.com", "메일상자 네이버"),
        to: [address("lead@company.com", "팀 리드"), address("team@company.com", "팀 공용")],
        cc: [],
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
        from: address("mailsangja@gmail.com", "메일상자"),
        to: [address("legal@partner.com", "파트너 법무")],
        cc: [address("ceo@partner.com", "파트너 대표")],
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
  const participant =
    lastMessage?.direction === "OUTBOUND" ? (lastMessage.to[0] ?? address("")) : (lastMessage?.from ?? address(""))

  return {
    threadId: detail.threadId,
    gmailThreadId: detail.gmailThreadId,
    accountId: detail.accountId,
    latestSubject: detail.latestSubject,
    participant,
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
