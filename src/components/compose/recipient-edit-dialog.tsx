import { useMemo, useState } from "react"
import { Loader2, UserRound } from "lucide-react"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getMailAddressDisplayName, getMailAddressKey, parseMailAddressEntry } from "@/lib/mail-address"
import { useDebounce } from "@/hooks/use-debounce"
import { useContacts } from "@/queries/contacts"
import { m } from "@/paraglide/messages"
import type { Contact } from "@/types/contact"
import type { MailAddress } from "@/types/email"

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

interface RecipientEditDialogProps {
  id: string
  recipient: MailAddress | null
  recipients: MailAddress[]
  onClose: () => void
  onSave: (recipient: MailAddress) => void
}

export function RecipientEditDialog({ id, recipient, recipients, onClose, onSave }: RecipientEditDialogProps) {
  const [editingEmail, setEditingEmail] = useState(() => recipient?.email.trim() ?? "")
  const [editingName, setEditingName] = useState(() => recipient?.name?.trim() ?? "")
  const recipientEmailKey = recipient ? getMailAddressKey(recipient) : null
  const editingEmailKeyword = editingEmail.trim()
  const debouncedEditingEmailKeyword = useDebounce(editingEmailKeyword)
  const isEditingDebouncing = editingEmailKeyword !== debouncedEditingEmailKeyword
  const contactsQuery = useContacts({ keyword: debouncedEditingEmailKeyword }, !!recipient)
  const editingEmailValue = useMemo<RecipientOption | null>(() => {
    if (!editingEmailKeyword) return null

    const editingNameValue = editingName.trim()
    return {
      id: `editing:${editingEmailKeyword.toLowerCase()}`,
      email: editingEmailKeyword,
      ...(editingNameValue ? { name: editingNameValue } : {}),
      source: "manual",
    }
  }, [editingEmailKeyword, editingName])
  const contactOptions = useMemo<RecipientOption[]>(() => {
    if (!recipientEmailKey) return []
    const otherSelectedEmails = new Set(
      recipients.filter((r) => getMailAddressKey(r) !== recipientEmailKey).map(getMailAddressKey)
    )

    return (contactsQuery.data ?? [])
      .filter((contact) => !otherSelectedEmails.has(contact.email.trim().toLowerCase()))
      .map(createRecipientOption)
      .slice(0, 8)
  }, [contactsQuery.data, recipients, recipientEmailKey])
  const emptyState =
    isEditingDebouncing || contactsQuery.isPending || contactsQuery.isFetching
      ? "loading"
      : contactsQuery.isError
        ? "error"
        : "empty"

  const handleSubmit = () => {
    const parsedAddress = parseMailAddressEntry(editingEmail)
    if (!parsedAddress) {
      return
    }

    const newEmail = parsedAddress.email.trim()
    const newName = editingName.trim() || parsedAddress.name?.trim()
    onSave(newName ? { email: newEmail, name: newName } : { email: newEmail })
  }

  return (
    <Dialog
      open={!!recipient}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            handleSubmit()
          }}
        >
          <DialogHeader>
            <DialogTitle>{m.compose_recipient_edit_title()}</DialogTitle>
            <DialogDescription>{m.compose_recipient_edit_description()}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">{m.compose_recipient_email_label()}</label>
              <Combobox<RecipientOption, false>
                items={contactOptions}
                filteredItems={contactOptions}
                value={editingEmailValue}
                inputValue={editingEmail}
                autoHighlight="always"
                itemToStringLabel={(option) => option.email}
                itemToStringValue={(option) => option.email}
                isItemEqualToValue={(item, value) => getMailAddressKey(item) === getMailAddressKey(value)}
                onInputValueChange={setEditingEmail}
                onValueChange={(option) => {
                  if (option) {
                    setEditingEmail(option.email)
                    setEditingName(option.name?.trim() ?? "")
                  }
                }}
              >
                <ComboboxInput showTrigger={false} />
                <ComboboxContent side="bottom" align="start" className="min-w-72">
                  {emptyState === "loading" ? (
                    <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" />
                      {m.compose_contacts_loading()}
                    </div>
                  ) : emptyState === "error" ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">{m.compose_contacts_load_error()}</div>
                  ) : (
                    <ComboboxEmpty>{m.compose_contacts_empty()}</ComboboxEmpty>
                  )}
                  <ComboboxList>
                    {(option: RecipientOption) => (
                      <ComboboxItem key={option.id} value={option}>
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                          {getRecipientInitial(option) || <UserRound className="size-4" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{getMailAddressDisplayName(option)}</span>
                          <span className="block truncate text-xs text-muted-foreground">{option.email}</span>
                        </span>
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
            <div className="grid gap-1.5">
              <label htmlFor={`${id}-recipient-edit-name`} className="text-sm font-medium">
                {m.compose_recipient_name_label()}
              </label>
              <Input
                id={`${id}-recipient-edit-name`}
                value={editingName}
                onChange={(event) => setEditingName(event.target.value)}
                placeholder={m.compose_recipient_name_placeholder()}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {m.common_cancel()}
            </Button>
            <Button type="submit">{m.common_save()}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
