import { apiClient } from "@/lib/api-client"
import type { Contact, CreateContactPayload, ListContactsParams, UpdateContactPayload } from "@/types/contact"

export async function getContacts(params: ListContactsParams = {}): Promise<Contact[]> {
  return apiClient.get<Contact[]>("/api/v1/contacts", {
    params: {
      keyword: params.keyword,
    },
  })
}

export async function createContact(data: CreateContactPayload): Promise<Contact> {
  return apiClient.post<Contact>("/api/v1/contacts", data)
}

export async function updateContact(contactId: string, data: UpdateContactPayload): Promise<Contact> {
  return apiClient.patch<Contact>(`/api/v1/contacts/${contactId}`, data)
}

export async function deleteContact(contactId: string): Promise<void> {
  return apiClient.delete<void>(`/api/v1/contacts/${contactId}`)
}
