import type { Plan } from "@/types/user"

export type PaymentPlan = Plan
export type PaymentStatus = "PENDING" | "COMPLETED"

export interface CreateOrderPayload {
  plan: PaymentPlan
}

export interface CreateOrderResponse {
  paymentId: string
  plan: PaymentPlan
  amount: number
  status: PaymentStatus
  createdAt: string
}

export interface CompletePaymentPayload {
  paymentId: string
}

export interface PaymentResult {
  paymentId: string
}
