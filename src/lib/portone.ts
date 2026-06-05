import type { PaymentResponse } from "@portone/browser-sdk/v2"

import type { CreateOrderResponse, PaymentResult } from "@/types/payment"
import type { User } from "@/types/user"

export class PortOnePaymentError extends Error {
  code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = "PortOnePaymentError"
    this.code = code
  }
}

function getRequiredEnv(name: "VITE_PORTONE_STORE_ID" | "VITE_PORTONE_KAKAOPAY_CHANNEL_KEY") {
  const value = import.meta.env[name]?.trim()

  if (!value) {
    throw new PortOnePaymentError(`Missing ${name}`)
  }

  return value
}

function buildRedirectUrl(paymentId: string) {
  const url = new URL("/upgrade", window.location.origin)
  url.searchParams.set("paymentId", paymentId)
  return url.toString()
}

function normalizePaymentResponse(response: PaymentResponse | undefined): PaymentResult {
  if (!response) {
    throw new PortOnePaymentError("Payment was cancelled.")
  }

  if (response.code) {
    throw new PortOnePaymentError(response.message || "Payment failed.", response.code)
  }

  if (!response.paymentId) {
    throw new PortOnePaymentError("Payment response did not include paymentId.")
  }

  return { paymentId: response.paymentId }
}

export async function requestKakaoPayPayment(
  order: CreateOrderResponse,
  user: User,
  customerEmail?: string
): Promise<PaymentResult> {
  const storeId = getRequiredEnv("VITE_PORTONE_STORE_ID")
  const channelKey = getRequiredEnv("VITE_PORTONE_KAKAOPAY_CHANNEL_KEY")
  const { requestPayment } = await import("@portone/browser-sdk/v2")
  const customer = customerEmail ? { fullName: user.name, email: customerEmail } : { fullName: user.name }

  const response = await requestPayment({
    storeId,
    channelKey,
    paymentId: order.paymentId,
    orderName: "메일상자 PRO",
    totalAmount: order.amount,
    currency: "KRW",
    payMethod: "EASY_PAY",
    customer,
    easyPay: {
      easyPayProvider: "KAKAOPAY",
    },
    redirectUrl: buildRedirectUrl(order.paymentId),
  })

  return normalizePaymentResponse(response)
}
