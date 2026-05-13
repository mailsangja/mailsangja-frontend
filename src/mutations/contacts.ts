import { useMutation } from "@tanstack/react-query"

import { createContact, deleteContact, updateContact } from "@/api/contacts"
import { queryClient } from "@/lib/query-client"
import { contactKeys } from "@/queries/contacts"
import type { CreateContactPayload, UpdateContactPayload } from "@/types/contact"

function invalidateContacts() {
  void queryClient.invalidateQueries({ queryKey: contactKeys.all() })
}

export const contactMutationOptions = {
  create: () => ({
    mutationFn: (data: CreateContactPayload) => createContact(data),
    onSuccess: invalidateContacts,
  }),
  update: () => ({
    mutationFn: ({ contactId, data }: { contactId: string; data: UpdateContactPayload }) =>
      updateContact(contactId, data),
    onSuccess: invalidateContacts,
  }),
  delete: () => ({
    mutationFn: (contactId: string) => deleteContact(contactId),
    onSuccess: invalidateContacts,
  }),
}

export function useCreateContact() {
  return useMutation(contactMutationOptions.create())
}

export function useUpdateContact() {
  return useMutation(contactMutationOptions.update())
}

export function useDeleteContact() {
  return useMutation(contactMutationOptions.delete())
}
