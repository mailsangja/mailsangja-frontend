import { ArrowLeft, Search } from "lucide-react"
import { useRef, useState } from "react"

import { MailErrorState } from "@/components/mail-error-state"
import { ThreadHeader } from "@/components/thread/header"
import { ThreadMessageList } from "@/components/thread/message-list"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useThreadMessageExpansion } from "@/hooks/use-thread-message-expansion"
import { formatRelativeDate } from "@/lib/date"
import { getErrorMessage } from "@/lib/http-error"
import { cn } from "@/lib/utils"
import { useMailSearch, useThread } from "@/queries/emails"
import { useLabels } from "@/queries/labels"
import { useMailAccounts } from "@/queries/mail-accounts"
import type { HybridMailSearchItem, HybridMailSearchScope } from "@/types/email"

const MIN_QUERY_LENGTH = 10

interface SearchResultItemProps {
  item: HybridMailSearchItem
  onClick: () => void
}

function SearchResultItem({ item, onClick }: SearchResultItemProps) {
  const fromLabel = item.from.name ?? item.from.email

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-muted/50"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0 flex-1 truncate text-sm leading-snug font-medium">{item.subject || "제목 없음"}</span>
        <time className="shrink-0 text-xs text-muted-foreground">{formatRelativeDate(item.sentAt)}</time>
      </div>
      <span className="truncate text-xs text-muted-foreground">{fromLabel}</span>
      <p className="line-clamp-2 text-xs text-muted-foreground">{item.snippet}</p>
    </button>
  )
}

interface ThreadDetailViewProps {
  threadId: string
  onBack: () => void
}

function ThreadDetailView({ threadId, onBack }: ThreadDetailViewProps) {
  const { data: thread, isLoading, isError, error, refetch } = useThread(threadId)
  const { data: accounts } = useMailAccounts()
  const { expandedIds, toggleExpanded } = useThreadMessageExpansion({
    threadId,
    messages: thread?.messages ?? [],
    messageId: null,
  })
  const account = thread ? accounts?.find((item) => item.id === thread.accountId) : undefined

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex h-11 shrink-0 items-center gap-1 border-b px-2">
        <Button variant="ghost" size="icon-sm" onClick={onBack} aria-label="검색 결과로 돌아가기">
          <ArrowLeft className="size-4" />
        </Button>
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{thread?.latestSubject ?? ""}</span>
      </div>
      {isLoading ? (
        <div className="flex flex-col gap-4 p-6">
          <Skeleton className="h-7 w-3/4" />
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <Separator />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : isError ? (
        <MailErrorState
          title="스레드를 불러오지 못했어요"
          description={getErrorMessage(error, "잠시 후 다시 시도해 주세요.")}
          onRetry={() => void refetch()}
        />
      ) : thread ? (
        <>
          <ThreadHeader thread={thread} account={account} className="pt-4" />
          <ThreadMessageList
            messages={thread.messages}
            expandedIds={expandedIds}
            onToggle={toggleExpanded}
            accountEmail={account?.emailAddress}
          />
        </>
      ) : null}
    </div>
  )
}

interface SearchResultListProps {
  items: HybridMailSearchItem[]
  onSelect: (threadId: string) => void
}

function SearchResultList({ items, onSelect }: SearchResultListProps) {
  if (items.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted">
          <Search className="size-7 text-muted-foreground/60" />
        </div>
        <div>
          <p className="font-medium text-muted-foreground">관련 메일이 없어요</p>
          <p className="mt-1 text-sm text-muted-foreground">작성 중인 내용과 유사한 메일을 찾지 못했어요.</p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="divide-y">
        {items.map((item) => (
          <SearchResultItem key={item.messageId} item={item} onClick={() => onSelect(item.threadId)} />
        ))}
      </div>
    </ScrollArea>
  )
}

const SCOPE_OPTIONS: { value: HybridMailSearchScope; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "INBOX", label: "받은 메일함" },
  { value: "SENT", label: "보낸 메일함" },
]

interface FilterChipProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

function FilterChip({ active, onClick, children }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs transition-colors",
        active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}

interface ScopeFilterProps {
  value: HybridMailSearchScope
  onChange: (scope: HybridMailSearchScope) => void
}

function ScopeFilter({ value, onChange }: ScopeFilterProps) {
  return (
    <div className="flex shrink-0 items-center gap-1 border-b px-4 py-2">
      {SCOPE_OPTIONS.map((option) => (
        <FilterChip key={option.value} active={value === option.value} onClick={() => onChange(option.value)}>
          {option.label}
        </FilterChip>
      ))}
    </div>
  )
}

interface AccountFilterProps {
  accounts: { id: string; alias: string | null; emailAddress: string }[]
  selectedId: string | undefined
  onChange: (id: string | undefined) => void
}

function AccountFilter({ accounts, selectedId, onChange }: AccountFilterProps) {
  if (accounts.length <= 1) return null

  return (
    <div className="flex shrink-0 scrollbar-none items-center gap-1 overflow-x-auto border-b px-4 py-2">
      <FilterChip active={selectedId === undefined} onClick={() => onChange(undefined)}>
        전체 계정
      </FilterChip>
      {accounts.map((account) => (
        <FilterChip
          key={account.id}
          active={selectedId === account.id}
          onClick={() => onChange(selectedId === account.id ? undefined : account.id)}
        >
          {account.alias ?? account.emailAddress}
        </FilterChip>
      ))}
    </div>
  )
}

interface LabelFilterProps {
  labels: { id: string; name: string; colorCode: string }[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

function LabelFilter({ labels, selectedIds, onChange }: LabelFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const dragOrigin = useRef<{ x: number; scrollLeft: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  if (labels.length === 0) return null

  const toggle = (id: string) => {
    if (isDragging) return
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id])
  }

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    dragOrigin.current = { x: e.pageX, scrollLeft: scrollRef.current?.scrollLeft ?? 0 }
  }

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragOrigin.current || !scrollRef.current) return
    const dx = e.pageX - dragOrigin.current.x
    if (!isDragging && Math.abs(dx) > 4) setIsDragging(true)
    scrollRef.current.scrollLeft = dragOrigin.current.scrollLeft - dx
  }

  const stopDrag = () => {
    dragOrigin.current = null
    setIsDragging(false)
  }

  return (
    <div
      ref={scrollRef}
      className="flex shrink-0 scrollbar-none items-center gap-1 overflow-x-auto border-b px-4 py-2"
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
    >
      {labels.map((label) => (
        <FilterChip key={label.id} active={selectedIds.includes(label.id)} onClick={() => toggle(label.id)}>
          <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: label.colorCode }} />
          {label.name}
        </FilterChip>
      ))}
    </div>
  )
}

export interface ComposeSearchPanelContentProps {
  query: string
  mailAccountId?: string
  showFilters: boolean
}

export function ComposeSearchPanelContent({ query, showFilters }: ComposeSearchPanelContentProps) {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [scope, setScope] = useState<HybridMailSearchScope>("ALL")
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>(undefined)
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([])
  const isQueryReady = query.trim().length >= MIN_QUERY_LENGTH

  const { data: accounts } = useMailAccounts()
  const { data: labels } = useLabels()

  const activeAccounts = accounts?.filter((a) => a.isActive) ?? []

  const { data, isLoading, isError, error, refetch } = useMailSearch(
    {
      q: query,
      mailAccountId: selectedAccountId,
      scope,
      size: 20,
      labelId: selectedLabelIds.length > 0 ? selectedLabelIds : undefined,
    },
    isQueryReady
  )

  if (selectedThreadId) {
    return <ThreadDetailView threadId={selectedThreadId} onBack={() => setSelectedThreadId(null)} />
  }

  const renderContent = () => {
    if (!isQueryReady) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <Search className="size-7 text-muted-foreground/60" />
          </div>
          <div>
            <p className="font-medium text-muted-foreground">관련 메일</p>
            <p className="mt-1 text-sm text-muted-foreground">본문을 10자 이상 입력하면 유사한 메일을 찾아드려요.</p>
          </div>
        </div>
      )
    }

    if (isLoading) {
      return (
        <div className="flex flex-col gap-3 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-lg border p-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      )
    }

    if (isError) {
      return (
        <MailErrorState
          title="검색에 실패했어요"
          description={getErrorMessage(error, "잠시 후 다시 시도해 주세요.")}
          onRetry={() => void refetch()}
        />
      )
    }

    return <SearchResultList items={data?.content ?? []} onSelect={setSelectedThreadId} />
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {showFilters && (
        <>
          <ScopeFilter value={scope} onChange={setScope} />
          <AccountFilter accounts={activeAccounts} selectedId={selectedAccountId} onChange={setSelectedAccountId} />
          <LabelFilter labels={labels ?? []} selectedIds={selectedLabelIds} onChange={setSelectedLabelIds} />
        </>
      )}
      {renderContent()}
    </div>
  )
}
