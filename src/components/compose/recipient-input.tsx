import { useMemo, useState, type ClipboardEvent, type KeyboardEvent } from "react"
import { Loader2, UserRound } from "lucide-react"

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  getMailAddressDisplayName,
  getMailAddressSearchText,
  getUniqueMailAddresses,
  parseMailAddressEntry,
  parseMailRecipients,
} from "@/lib/mail-address"
import { useDebounce } from "@/hooks/use-debounce"
import { useContacts } from "@/queries/contacts"
import type { Contact } from "@/types/contact"
import type { MailAddress } from "@/types/email"

interface RecipientInputProps {
  id: string
  recipients: MailAddress[]
  onRecipientsChange: (recipients: MailAddress[]) => void
  placeholder?: string
}

interface RecipientOption extends MailAddress {
  id: string
  source: "contact" | "manual"
}

function createRecipientOption(contact: Contact): RecipientOption {
  return {
    id: contact.id,
    name: contact.name.trim(),
    email: contact.email.trim(),
    source: "contact",
  }
}

function getRecipientInitial(recipient: MailAddress) {
  return getMailAddressDisplayName(recipient).slice(0, 1).toUpperCase()
}

function hasRecipientSeparator(value: string) {
  return /[,\n;]/.test(value)
}

export function RecipientInput({
  id,
  recipients,
  onRecipientsChange,
  placeholder = "이름 또는 이메일 입력",
}: RecipientInputProps) {
  const anchorRef = useComboboxAnchor()
  const [draft, setDraft] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const keyword = draft.trim()
  const debouncedKeyword = useDebounce(keyword)
  const isDebouncing = keyword !== debouncedKeyword
  const contactsQuery = useContacts({ keyword: debouncedKeyword }, isFocused || isOpen)
  const selectedEmails = useMemo(
    () => new Set(recipients.map((recipient) => recipient.email.toLowerCase())),
    [recipients]
  )
  const draftRecipient = useMemo(() => parseMailAddressEntry(draft), [draft])
  const recipientOptions = useMemo<RecipientOption[]>(() => {
    const contactOptions = (contactsQuery.data ?? [])
      .filter((contact) => !selectedEmails.has(contact.email.trim().toLowerCase()))
      .map(createRecipientOption)
      .slice(0, 8)
    const optionEmails = new Set(contactOptions.map((recipient) => recipient.email.toLowerCase()))
    const draftEmail = draftRecipient?.email.toLowerCase()
    const draftOption =
      draftRecipient && draftEmail && !selectedEmails.has(draftEmail) && !optionEmails.has(draftEmail)
        ? [{ ...draftRecipient, id: `manual:${draftRecipient.email}`, source: "manual" as const }]
        : []

    return [...draftOption, ...contactOptions]
  }, [contactsQuery.data, draftRecipient, selectedEmails])
  const hasInvalidDraft =
    !!keyword &&
    !draftRecipient &&
    !isDebouncing &&
    recipientOptions.length === 0 &&
    !contactsQuery.isPending &&
    !contactsQuery.isError
  const emptyState =
    isDebouncing || contactsQuery.isPending || contactsQuery.isFetching
      ? "loading"
      : contactsQuery.isError
        ? "error"
        : hasInvalidDraft
          ? "invalid"
          : "empty"

  const updateRecipients = (nextRecipients: readonly MailAddress[]) => {
    onRecipientsChange(getUniqueMailAddresses(nextRecipients))
  }

  const commitDraft = () => {
    const nextRecipients = parseMailRecipients(draft)

    if (nextRecipients.length === 0) {
      return false
    }

    updateRecipients([...recipients, ...nextRecipients])
    setDraft("")
    return true
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Tab" || event.key === "," || event.key === ";") {
      if (!draft.trim()) {
        return
      }

      event.preventDefault()
      commitDraft()
      return
    }
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pastedText = event.clipboardData.getData("text")

    if (!hasRecipientSeparator(pastedText)) {
      return
    }

    event.preventDefault()
    updateRecipients([...recipients, ...parseMailRecipients(`${draft}${pastedText}`)])
    setDraft("")
  }

  return (
    <Combobox<MailAddress, true>
      id={id}
      items={recipientOptions}
      filteredItems={recipientOptions}
      multiple
      value={recipients}
      inputValue={draft}
      autoHighlight="always"
      itemToStringLabel={getMailAddressSearchText}
      itemToStringValue={(recipient) => recipient.email}
      isItemEqualToValue={(item, value) => item.email.toLowerCase() === value.email.toLowerCase()}
      onInputValueChange={(value) => setDraft(value)}
      onOpenChange={setIsOpen}
      onValueChange={(value) => {
        updateRecipients(value)
        setDraft("")
      }}
    >
      <ComboboxChips
        ref={anchorRef}
        className="min-h-6 rounded-none border-0 bg-transparent px-0 py-0 shadow-none focus-within:ring-0 dark:bg-transparent"
      >
        <ComboboxValue>
          {recipients.map((recipient) => (
            <Tooltip key={recipient.email}>
              <TooltipTrigger render={<ComboboxChip className="max-w-full font-normal" />}>
                <span className="truncate">{getMailAddressDisplayName(recipient)}</span>
              </TooltipTrigger>
              <TooltipContent>{recipient.email}</TooltipContent>
            </Tooltip>
          ))}
        </ComboboxValue>
        <ComboboxChipsInput
          id={id}
          placeholder={recipients.length === 0 ? placeholder : undefined}
          className="h-6 min-w-36 bg-transparent text-sm placeholder:text-muted-foreground"
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            commitDraft()
            setIsFocused(false)
          }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        />
      </ComboboxChips>
      <ComboboxContent anchor={anchorRef} side="bottom" align="start" className="min-w-72">
        {emptyState === "loading" ? (
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            연락처를 불러오는 중
          </div>
        ) : emptyState === "error" ? (
          <div className="px-3 py-2 text-sm text-muted-foreground">연락처를 불러오지 못했습니다</div>
        ) : emptyState === "invalid" ? (
          <div className="px-3 py-2 text-sm text-muted-foreground">올바른 이메일 형식이 아닙니다</div>
        ) : (
          <ComboboxEmpty>일치하는 연락처가 없습니다</ComboboxEmpty>
        )}
        <ComboboxList>
          {(recipient: RecipientOption) => (
            <ComboboxItem key={recipient.id} value={recipient}>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                {getRecipientInitial(recipient) || <UserRound className="size-4" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{getMailAddressDisplayName(recipient)}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {recipient.source === "manual" ? `${recipient.email} 직접 추가` : recipient.email}
                </span>
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
