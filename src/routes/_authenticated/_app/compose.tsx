import { createFileRoute, useLocation } from "@tanstack/react-router"
import { ArrowLeft, SlidersHorizontal } from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"

import { ComposeEmail, type ComposeEmailHandle } from "@/components/compose/compose-email"
import { ComposeReferenceContent } from "@/components/compose/compose-reference-thread-panel"
import { ComposeReviewPanel } from "@/components/compose/compose-review-panel"
import { ComposeSearchPanelContent } from "@/components/compose/compose-search-panel"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useDebounce } from "@/hooks/use-debounce"
import { useIsMobile } from "@/hooks/use-mobile"
import { getHttpStatus } from "@/lib/http-error"
import { formatMailAddressList } from "@/lib/mail-address"
import { cn } from "@/lib/utils"
import { useReviewMail } from "@/mutations/emails"
import { m } from "@/paraglide/messages"
import { emailQueries } from "@/queries/emails"
import { mailAccountQueries, useMailAccounts } from "@/queries/mail-accounts"
import type { MailReviewRequest } from "@/types/email"

interface ComposeRouteSearch {
  from?: string
  thread?: string
  message?: string
}

export const Route = createFileRoute("/_authenticated/_app/compose")({
  validateSearch: (search: Record<string, unknown>): ComposeRouteSearch => {
    const from = typeof search.from === "string" ? search.from.trim() : ""
    const thread = typeof search.thread === "string" ? search.thread.trim() : ""
    const message = typeof search.message === "string" ? search.message.trim() : ""

    return {
      ...(from ? { from } : {}),
      ...(thread ? { thread } : {}),
      ...(message ? { message } : {}),
    }
  },
  loaderDeps: ({ search: { thread, message } }) => ({ thread, message }),
  loader: async ({ context, deps: { thread: threadId, message: messageId } }) => {
    if (!threadId) return null

    const [thread, accounts] = await Promise.all([
      context.queryClient.ensureQueryData(emailQueries.thread(threadId)),
      context.queryClient.ensureQueryData(mailAccountQueries.list()),
    ])

    const replyMessage = messageId
      ? thread.messages.find((message) => message.id === messageId)
      : thread.messages.at(-1)
    if (!replyMessage) return null

    const replyToAddress = replyMessage.replyTo ?? replyMessage.from
    const replyTo = replyToAddress.name ? `${replyToAddress.name} <${replyToAddress.email}>` : replyToAddress.email
    const currentSubject = thread.latestSubject
    const replySubject = /^re:/i.test(currentSubject) ? currentSubject : `Re: ${currentSubject}`
    const fromAccount = accounts.find((a) => a.id === thread.accountId)
    const replyCcAddresses = replyMessage.cc.filter((addr) => addr.email !== fromAccount?.emailAddress)
    const replyCc = replyCcAddresses.length > 0 ? formatMailAddressList(replyCcAddresses) : undefined

    return {
      messageId: replyMessage.id,
      replyTo,
      replySubject,
      replyCc,
      defaultFrom: fromAccount?.emailAddress ?? null,
    }
  },
  component: ComposePage,
})

type LeftPanelTab = "reference" | "search"

interface TabButtonProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative border-b-2 text-sm transition-colors",
        active
          ? "border-foreground font-medium text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}

interface ComposeLeftPanelProps {
  threadId: string | null
  messageId?: string | null
  searchQuery: string
  fromAddress: string | null
}

function ComposeLeftPanel({ threadId, messageId, searchQuery, fromAddress }: ComposeLeftPanelProps) {
  const [tab, setTab] = useState<LeftPanelTab>("reference")
  const [showFilters, setShowFilters] = useState(false)
  const [searchSelectedThreadId, setSearchSelectedThreadId] = useState<string | null>(null)
  const { data: accounts } = useMailAccounts()
  const mailAccountId = fromAddress ? accounts?.find((a) => a.emailAddress === fromAddress)?.id : undefined
  const hasThread = threadId != null

  const handleTabChange = (newTab: LeftPanelTab) => {
    setTab(newTab)
    setSearchSelectedThreadId(null)
  }

  if (!hasThread) {
    return (
      <div className="flex h-full w-full min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex h-11 shrink-0 items-center justify-between border-b px-4">
          {searchSelectedThreadId ? (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setSearchSelectedThreadId(null)}
              aria-label={m.compose_search_back_to_results()}
            >
              <ArrowLeft className="size-4" />
            </Button>
          ) : (
            <>
              <h1 className="text-sm font-medium">{m.compose_related_mail_title()}</h1>
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors",
                  showFilters
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <SlidersHorizontal className="size-3" />
                {m.compose_filter()}
              </button>
            </>
          )}
        </div>
        <ComposeSearchPanelContent
          query={searchQuery}
          mailAccountId={mailAccountId}
          showFilters={showFilters && !searchSelectedThreadId}
          selectedThreadId={searchSelectedThreadId}
          onSelectedThreadIdChange={setSearchSelectedThreadId}
        />
      </div>
    )
  }

  return (
    <div className="flex h-full w-full min-w-0 flex-1 flex-col overflow-hidden">
      <div className="flex h-11 shrink-0 items-stretch gap-4 border-b px-4">
        {searchSelectedThreadId && tab === "search" ? (
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setSearchSelectedThreadId(null)}
              aria-label={m.compose_search_back_to_results()}
            >
              <ArrowLeft className="size-4" />
            </Button>
          </div>
        ) : (
          <>
            <TabButton active={tab === "reference"} onClick={() => handleTabChange("reference")}>
              {m.compose_reference_title()}
            </TabButton>
            <TabButton active={tab === "search"} onClick={() => handleTabChange("search")}>
              {m.compose_related_mail_title()}
            </TabButton>
            {tab === "search" && (
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                className={cn(
                  "ml-auto flex h-6 items-center gap-1 self-center rounded-md px-2 py-1 text-xs transition-colors",
                  showFilters ? "bg-foreground text-background" : "text-muted-foreground"
                )}
              >
                <SlidersHorizontal className="size-3" />
                {m.compose_filter()}
              </button>
            )}
          </>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {tab === "reference" ? (
          <ComposeReferenceContent threadId={threadId} messageId={messageId ?? null} />
        ) : (
          <ComposeSearchPanelContent
            query={searchQuery}
            mailAccountId={mailAccountId}
            showFilters={showFilters && !searchSelectedThreadId}
            selectedThreadId={searchSelectedThreadId}
            onSelectedThreadIdChange={setSearchSelectedThreadId}
          />
        )}
      </div>
    </div>
  )
}

function ComposePage() {
  const isMobile = useIsMobile()
  const { from, thread, message } = Route.useSearch()
  const loaderData = Route.useLoaderData()
  const replyDraftSuggestion = useLocation({
    select: (location) => location.state.replyDraftSuggestion ?? null,
  })
  const navigate = Route.useNavigate()
  const reviewMutation = useReviewMail()
  const [isReviewPanelOpen, setIsReviewPanelOpen] = useState(false)
  const [bodyText, setBodyText] = useState("")
  const composeEmailRef = useRef<ComposeEmailHandle>(null)
  const forceReviewRef = useRef(false)
  const debouncedBodyText = useDebounce(bodyText, 500)

  const handleFromAddressChange = (nextFrom: string | null) => {
    navigate({
      search: (prev) => ({ ...prev, from: nextFrom ?? undefined }),
      state: true,
      replace: true,
    })
  }

  const fromAddress = from ?? loaderData?.defaultFrom ?? null
  const initialSubject = replyDraftSuggestion?.subject ?? loaderData?.replySubject
  const initialBody = replyDraftSuggestion?.body

  const fireReview = (request: MailReviewRequest) => {
    const toastId = toast.loading(m.compose_review_loading())
    reviewMutation.mutate(request, {
      onSettled: () => toast.dismiss(toastId),
      onError: (error) => {
        if (getHttpStatus(error) === 429) {
          toast.error(m.compose_review_quota_exceeded())
        }
      },
    })
  }

  const handleReview = (request: MailReviewRequest) => {
    setIsReviewPanelOpen(true)
    const force = forceReviewRef.current
    forceReviewRef.current = false
    if (!reviewMutation.isPending && (force || !isMobile || !reviewMutation.data)) {
      fireReview(request)
    }
  }

  const handleReReview = () => {
    if (reviewMutation.isPending) return
    forceReviewRef.current = true
    composeEmailRef.current?.requestReview()
  }

  const handleCloseReviewPanel = () => {
    setIsReviewPanelOpen(false)
  }

  if (isMobile) {
    return (
      <div className="flex min-h-0 w-full min-w-0 flex-1 overflow-hidden">
        <ComposeEmail
          fromAddress={fromAddress}
          onFromAddressChange={handleFromAddressChange}
          messageId={loaderData?.messageId}
          initialTo={loaderData?.replyTo}
          initialSubject={initialSubject}
          initialCc={loaderData?.replyCc}
          initialBody={initialBody}
          onReview={handleReview}
          isReviewing={reviewMutation.isPending}
          onBodyTextChange={setBodyText}
          ref={composeEmailRef}
        />
        <Sheet
          open={isReviewPanelOpen}
          onOpenChange={(open) => {
            if (!open) setIsReviewPanelOpen(false)
          }}
        >
          <SheetContent side="bottom" showCloseButton={false} className="max-h-[70vh] gap-0 p-0">
            <ComposeReviewPanel
              isReviewing={reviewMutation.isPending}
              reviewResult={reviewMutation.data ?? null}
              reviewError={reviewMutation.isError}
              onClose={handleCloseReviewPanel}
              onReReview={handleReReview}
            />
          </SheetContent>
        </Sheet>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 overflow-hidden">
      <div className="min-h-0 min-w-0 basis-1/2 border-r-0">
        {isReviewPanelOpen ? (
          <ComposeReviewPanel
            isReviewing={reviewMutation.isPending}
            reviewResult={reviewMutation.data ?? null}
            reviewError={reviewMutation.isError}
            onClose={handleCloseReviewPanel}
          />
        ) : (
          <ComposeLeftPanel
            threadId={thread ?? null}
            messageId={message ?? null}
            searchQuery={debouncedBodyText}
            fromAddress={fromAddress}
          />
        )}
      </div>
      <Separator orientation="vertical" />
      <div className="min-h-0 min-w-0 basis-2/3">
        <ComposeEmail
          fromAddress={fromAddress}
          onFromAddressChange={handleFromAddressChange}
          messageId={loaderData?.messageId}
          initialTo={loaderData?.replyTo}
          initialSubject={initialSubject}
          initialCc={loaderData?.replyCc}
          initialBody={initialBody}
          onReview={handleReview}
          isReviewing={reviewMutation.isPending}
          onBodyTextChange={setBodyText}
          ref={composeEmailRef}
        />
      </div>
    </div>
  )
}
