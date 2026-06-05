import { useMutation } from "@tanstack/react-query"

import type { CompletePaymentPayload, CreateOrderPayload } from "@/types/payment"

import { completePayment, createPaymentOrder } from "@/api/payments"
import { queryClient } from "@/lib/query-client"
import { aiKeys } from "@/queries/ai"
import { userKeys } from "@/queries/user"

export const paymentMutationOptions = {
  createOrder: () => ({
    mutationFn: (data: CreateOrderPayload) => createPaymentOrder(data),
  }),
  complete: () => ({
    mutationFn: (data: CompletePaymentPayload) => completePayment(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.all() })
      void queryClient.invalidateQueries({ queryKey: aiKeys.all() })
    },
  }),
}

export function useCreatePaymentOrder() {
  return useMutation(paymentMutationOptions.createOrder())
}

export function useCompletePayment() {
  return useMutation(paymentMutationOptions.complete())
}
