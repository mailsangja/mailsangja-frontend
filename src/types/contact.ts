export interface Contact {
  id: string
  name: string
  email: string
}

export interface ListContactsParams {
  keyword?: string
}

export interface CreateContactPayload {
  name: string
  email: string
}

export interface UpdateContactPayload {
  name: string
}
