import { useMemo, useState, type ClipboardEvent, type KeyboardEvent, type MouseEvent } from "react"
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
  getMailAddressKey,
  getMailAddressSearchText,
  getUniqueMailAddresses,
  parseMailAddressEntry,
  parseMailRecipients,
} from "@/lib/mail-address"
import { useDebounce } from "@/hooks/use-debounce"
import { useContacts } from "@/queries/contacts"
import { m } from "@/paraglide/messages"
import type { Contact } from "@/types/contact"
import type { MailAddress } from "@/types/email"
import { RecipientEditDialog } from "./recipient-edit-dialog"

interface RecipientInputProps {
  id: string
  recipients: MailAddress[]
  onRecipientsChange: (recipients: MailAddress[]) => void
  placeholder?: string
  disabled?: boolean
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
  placeholder = m.compose_recipient_placeholder(),
  disabled = false,
}: RecipientInputProps) {
  const anchorRef = useComboboxAnchor()
  const [draft, setDraft] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [editingRecipientEmail, setEditingRecipientEmail] = useState<string | null>(null)
  const keyword = draft.trim()
  const debouncedKeyword = useDebounce(keyword)
  const isDebouncing = keyword !== debouncedKeyword
  const contactsQuery = useContacts({ keyword: debouncedKeyword }, !disabled && (isFocused || isOpen))
  const selectedEmails = useMemo(() => new Set(recipients.map(getMailAddressKey)), [recipients])
  const editingRecipient = useMemo(
    () => recipients.find((recipient) => getMailAddressKey(recipient) === editingRecipientEmail) ?? null,
    [editingRecipientEmail, recipients]
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
    if (disabled) {
      return
    }

    onRecipientsChange(getUniqueMailAddresses(nextRecipients))
  }

  const commitDraft = () => {
    if (disabled) {
      return false
    }

    const nextRecipients = parseMailRecipients(draft)

    if (nextRecipients.length === 0) {
      return false
    }

    updateRecipients([...recipients, ...nextRecipients])
    setDraft("")
    return true
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) {
      return
    }

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
    if (disabled) {
      return
    }

    const pastedText = event.clipboardData.getData("text")

    if (!hasRecipientSeparator(pastedText)) {
      return
    }

    event.preventDefault()
    updateRecipients([...recipients, ...parseMailRecipients(`${draft}${pastedText}`)])
    setDraft("")
  }

  const closeRecipientEditor = () => {
    setEditingRecipientEmail(null)
  }

  const openRecipientEditor = (recipient: MailAddress) => {
    if (disabled) {
      return
    }

    setIsOpen(false)
    setEditingRecipientEmail(getMailAddressKey(recipient))
  }

  const handleRecipientChipClick = (event: MouseEvent, recipient: MailAddress) => {
    if (event.target instanceof Element && event.target.closest('[data-slot="combobox-chip-remove"]')) {
      return
    }

    openRecipientEditor(recipient)
  }

  const saveEditedRecipient = (recipient: MailAddress) => {
    if (!editingRecipientEmail) {
      return
    }

    updateRecipients(recipients.map((r) => (getMailAddressKey(r) === editingRecipientEmail ? recipient : r)))
    closeRecipientEditor()
  }

  return (
    <>
      <Combobox<MailAddress, true>
        id={id}
        items={recipientOptions}
        filteredItems={recipientOptions}
        multiple
        value={recipients}
        open={disabled ? false : isOpen}
        inputValue={draft}
        autoHighlight="always"
        itemToStringLabel={getMailAddressSearchText}
        itemToStringValue={(recipient) => recipient.email}
        isItemEqualToValue={(item, value) => getMailAddressKey(item) === getMailAddressKey(value)}
        onInputValueChange={(value) => {
          if (!disabled) {
            setDraft(value)
          }
        }}
        onOpenChange={(open) => {
          setIsOpen(disabled ? false : open)
        }}
        onValueChange={(value) => {
          updateRecipients(value)
          if (!disabled) {
            setDraft("")
          }
        }}
      >
        <ComboboxChips
          ref={anchorRef}
          className="min-h-6 rounded-none border-0 bg-transparent px-0 py-0 shadow-none focus-within:ring-0 dark:bg-transparent"
        >
          <ComboboxValue>
            {recipients.map((recipient) => (
              <Tooltip key={recipient.email}>
                <TooltipTrigger
                  render={
                    <ComboboxChip
                      className={disabled ? "max-w-full font-normal" : "max-w-full cursor-pointer font-normal"}
                      showRemove={!disabled}
                      onClick={(event) => handleRecipientChipClick(event, recipient)}
                    />
                  }
                >
                  <span className="truncate">{getMailAddressDisplayName(recipient)}</span>
                </TooltipTrigger>
                <TooltipContent>{recipient.email}</TooltipContent>
              </Tooltip>
            ))}
          </ComboboxValue>
          <ComboboxChipsInput
            id={id}
            placeholder={recipients.length === 0 ? placeholder : undefined}
            disabled={disabled}
            className="h-6 min-w-36 bg-transparent text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
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
              {m.compose_contacts_loading()}
            </div>
          ) : emptyState === "error" ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">{m.compose_contacts_load_error()}</div>
          ) : emptyState === "invalid" ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">{m.compose_recipient_invalid_email()}</div>
          ) : (
            <ComboboxEmpty>{m.compose_contacts_empty()}</ComboboxEmpty>
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
                    {recipient.source === "manual"
                      ? m.compose_recipient_add_manual({ email: recipient.email })
                      : recipient.email}
                  </span>
                </span>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      <RecipientEditDialog
        key={editingRecipientEmail ?? "closed-recipient-editor"}
        id={id}
        recipient={editingRecipient}
        recipients={recipients}
        onClose={closeRecipientEditor}
        onSave={saveEditedRecipient}
      />
    </>
  )
}
