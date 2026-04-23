import { useMemo, useState } from "react"
import { Loader2, X } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getErrorMessage } from "@/lib/http-error"
import { parseMailAddressInput } from "@/lib/mail-address"
import { useSendMail } from "@/mutations/emails"
import { useActiveMailAccounts } from "@/queries/mail-accounts"
import { useUser } from "@/queries/user"

interface ComposeEmailProps {
  initialFromAddress?: string
}

export function ComposeEmail({ initialFromAddress }: ComposeEmailProps = {}) {
  const navigate = useNavigate()
  const { data: user, isPending: isUserPending } = useUser()
  const { data: activeMailAccounts, isPending: isMailAccountsPending } = useActiveMailAccounts()
  const sendMailMutation = useSendMail()
  const [to, setTo] = useState("")
  const [cc, setCc] = useState("")
  const [bcc, setBcc] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [showCc, setShowCc] = useState(false)
  const [showBcc, setShowBcc] = useState(false)
  const [fromAddress, setFromAddress] = useState<string | null>(initialFromAddress ?? null)

  const activeFromAddressSet = useMemo(
    () => new Set((activeMailAccounts ?? []).map((mailAccount) => mailAccount.emailAddress)),
    [activeMailAccounts]
  )
  const defaultFromAddress =
    activeMailAccounts?.find((mailAccount) => mailAccount.id === user?.defaultMailAccountId)?.emailAddress ??
    activeMailAccounts?.[0]?.emailAddress ??
    null
  const validatedFromAddress = fromAddress && activeFromAddressSet.has(fromAddress) ? fromAddress : null
  const selectedFromAddress = validatedFromAddress ?? defaultFromAddress
  const fromAddressItems = useMemo(
    () =>
      (activeMailAccounts ?? []).map((mailAccount) => ({
        value: mailAccount.emailAddress,
        label: mailAccount.emailAddress,
      })),
    [activeMailAccounts]
  )
  const isFromAddressPending = isUserPending || isMailAccountsPending
  const cannotSend = sendMailMutation.isPending || isFromAddressPending || !selectedFromAddress

  const handleSend = async () => {
    if (isFromAddressPending) {
      toast.error("발신 계정을 불러오는 중입니다")
      return
    }

    if (!selectedFromAddress) {
      toast.error("발신 메일 계정을 먼저 연결해주세요")
      return
    }

    const toRecipients = parseMailAddressInput(to)

    if (toRecipients.length === 0) {
      toast.error("받는 사람을 입력해주세요")
      return
    }

    if (!subject.trim()) {
      toast.error("제목을 입력해주세요")
      return
    }

    try {
      await sendMailMutation.mutateAsync({
        from: selectedFromAddress,
        to: toRecipients,
        cc: parseMailAddressInput(cc),
        bcc: parseMailAddressInput(bcc),
        subject: subject.trim(),
        content: body,
      })
      toast.success("메일이 발송되었습니다")
      await navigate({ to: "/mail/$mailbox", params: { mailbox: "inbox" } })
    } catch (error) {
      toast.error("메일 발송에 실패했습니다", {
        description: getErrorMessage(error, "잠시 후 다시 시도해주세요."),
      })
    }
  }

  const handleClose = () => {
    navigate({ to: "/mail/$mailbox", params: { mailbox: "inbox" } })
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex h-11 shrink-0 items-center justify-between border-b px-4">
        <h1 className="text-sm font-medium">새 메일 작성</h1>
        <Button variant="ghost" size="icon-sm" onClick={handleClose} className="-mr-2" aria-label="메일 작성 닫기">
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex h-10 items-center border-b px-4 py-2">
        <label htmlFor="compose-to" className="w-20 shrink-0 text-sm text-muted-foreground">
          받는 사람
        </label>
        <input
          id="compose-to"
          type="text"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="이메일 주소 입력"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {!showCc && (
          <Button variant="ghost" size="xs" onClick={() => setShowCc(true)}>
            참조
          </Button>
        )}
        {!showBcc && (
          <Button variant="ghost" size="xs" onClick={() => setShowBcc(true)}>
            숨은참조
          </Button>
        )}
      </div>

      {showCc && (
        <div className="flex h-10 items-center border-b px-4 py-2">
          <label htmlFor="compose-cc" className="w-20 shrink-0 text-sm text-muted-foreground">
            참조
          </label>
          <input
            id="compose-cc"
            type="text"
            value={cc}
            onChange={(e) => setCc(e.target.value)}
            placeholder="이메일 주소 입력"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      )}

      {showBcc && (
        <div className="flex h-10 items-center border-b px-4 py-2">
          <label htmlFor="compose-bcc" className="w-20 shrink-0 text-sm text-muted-foreground">
            숨은 참조
          </label>
          <input
            id="compose-bcc"
            type="text"
            value={bcc}
            onChange={(e) => setBcc(e.target.value)}
            placeholder="이메일 주소 입력"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      )}

      <div className="flex h-10 items-center border-b px-4 py-2">
        <label htmlFor="compose-subject" className="w-20 shrink-0 text-sm text-muted-foreground">
          제목
        </label>
        <input
          id="compose-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="메일 제목 입력"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex h-10 items-center border-b px-4 py-2">
        <span id="compose-from-label" className="w-20 shrink-0 text-sm text-muted-foreground">
          보내는 사람
        </span>
        <Select
          value={selectedFromAddress}
          onValueChange={setFromAddress}
          items={fromAddressItems}
          disabled={isFromAddressPending || fromAddressItems.length === 0}
        >
          <SelectTrigger
            aria-labelledby="compose-from-label"
            className="h-auto min-w-0 flex-1 border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0 dark:bg-transparent dark:hover:bg-transparent"
          >
            <SelectValue placeholder={isFromAddressPending ? "발신 계정을 불러오는 중..." : "발신 계정을 선택하세요"} />
          </SelectTrigger>
          <SelectContent align="start" alignItemWithTrigger={false}>
            {(activeMailAccounts ?? []).map((mailAccount) => (
              <SelectItem key={mailAccount.id} value={mailAccount.emailAddress} className="px-3 py-2">
                <span className="flex items-center gap-2">
                  {mailAccount.emailAddress}
                  {mailAccount.id === user?.defaultMailAccountId && <Badge variant="secondary">default</Badge>}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-hidden">
        <label htmlFor="compose-body" className="sr-only">
          메일 본문
        </label>
        <textarea
          id="compose-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="메일 내용을 입력하세요..."
          className="h-full w-full resize-none bg-transparent p-4 text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="shrink-0 border-t px-4 py-3">
        <Button className="w-full" size="lg" onClick={handleSend} disabled={cannotSend}>
          {sendMailMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          보내기
        </Button>
      </div>
    </div>
  )
}
