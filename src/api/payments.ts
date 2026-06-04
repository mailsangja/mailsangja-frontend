import type { CompletePaymentPayload, CreateOrderPayload, CreateOrderResponse } from "@/types/payment"

import { apiClient } from "@/lib/api-client"

export async function createPaymentOrder(data: CreateOrderPayload): Promise<CreateOrderResponse> {
  return apiClient.post<CreateOrderResponse>("/api/v1/payments", data)
}

export async function completePayment(data: CompletePaymentPayload): Promise<void> {
  await apiClient.post<void>("/api/v1/payments/complete", data)
}
