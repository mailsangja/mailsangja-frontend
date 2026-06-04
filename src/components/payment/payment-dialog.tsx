import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { AlertCircle, Check, CheckCircle2, Loader2, Wallet } from "lucide-react"

import type { CreateOrderResponse } from "@/types/payment"
import type { User } from "@/types/user"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { getErrorMessage } from "@/lib/http-error"
import { PortOnePaymentError, requestKakaoPayPayment } from "@/lib/portone"
import { cn } from "@/lib/utils"
import { useCompletePayment, useCreatePaymentOrder } from "@/mutations/payments"
import { m } from "@/paraglide/messages"
import { useMailAccounts } from "@/queries/mail-accounts"

type PaymentStep = "idle" | "creating-order" | "requesting-payment" | "completing" | "success" | "failed"

interface PaymentDialogProps {
  open: boolean
  user: User
  onOpenChange: (open: boolean) => void
}

function formatKrw(amount: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount)
}

function getStepLabel(step: PaymentStep) {
  if (step === "creating-order" || step === "requesting-payment") return m.payment_dialog_processing()
  if (step === "completing") return m.payment_dialog_completing()
  return null
}

function isMissingPortOneEnvError(error: unknown) {
  return error instanceof PortOnePaymentError && error.message.includes("Missing VITE_PORTONE")
}

const paymentSteps = [
  { id: "order", label: m.payment_dialog_step_order() },
  { id: "kakaopay", label: m.payment_dialog_step_kakaopay() },
  { id: "activation", label: m.payment_dialog_step_activation() },
] as const

function getActiveStepIndex(step: PaymentStep) {
  if (step === "requesting-payment") return 1
  if (step === "completing" || step === "success") return 2
  return 0
}

export function PaymentDialog({ open, user, onOpenChange }: PaymentDialogProps) {
  const createOrder = useCreatePaymentOrder()
  const completePayment = useCompletePayment()
  const { data: mailAccounts, isPending: isMailAccountsPending } = useMailAccounts()
  const [step, setStep] = useState<PaymentStep>("idle")
  const [order, setOrder] = useState<CreateOrderResponse | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const isBusy = step === "creating-order" || step === "requesting-payment" || step === "completing"
  const isPayDisabled = isBusy || isMailAccountsPending
  const stepLabel = getStepLabel(step)
  const activeStepIndex = getActiveStepIndex(step)

  function reset() {
    setStep("idle")
    setOrder(null)
    setPaymentId(null)
    setErrorMessage(null)
    createOrder.reset()
    completePayment.reset()
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isBusy) return
    onOpenChange(nextOpen)
    if (!nextOpen) reset()
  }

  async function startPayment() {
    setErrorMessage(null)

    try {
      setStep("creating-order")
      const nextOrder = await createOrder.mutateAsync({ plan: "PRO" })
      setOrder(nextOrder)

      setStep("requesting-payment")
      const result = await requestKakaoPayPayment(
        nextOrder,
        user,
        mailAccounts?.find((mailAccount) => mailAccount.id === user.defaultMailAccountId)?.emailAddress.trim()
      )
      setPaymentId(result.paymentId)

      setStep("completing")
      await completePayment.mutateAsync({ paymentId: result.paymentId })
      setStep("success")
    } catch (error) {
      setStep("failed")
      setErrorMessage(
        isMissingPortOneEnvError(error)
          ? m.payment_dialog_setup_error()
          : getErrorMessage(error, m.payment_dialog_failure_title())
      )
    }
  }

  async function retryComplete() {
    if (!paymentId) {
      await startPayment()
      return
    }

    try {
      setErrorMessage(null)
      setStep("completing")
      await completePayment.mutateAsync({ paymentId })
      setStep("success")
    } catch (error) {
      setStep("failed")
      setErrorMessage(getErrorMessage(error, m.payment_dialog_failure_title()))
    }
  }

  function renderStepIndicator() {
    return (
      <div className="grid grid-cols-3 gap-2">
        {paymentSteps.map((paymentStep, index) => {
          const isActive = index <= activeStepIndex

          return (
            <div key={paymentStep.id} className="flex min-w-0 flex-col gap-2">
              <div className={cn("h-1 rounded-full bg-muted", isActive && "bg-primary")} />
              <span className={cn("truncate text-xs text-muted-foreground", isActive && "text-foreground")}>
                {paymentStep.label}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-5 sm:max-w-lg">
        <DialogHeader>
          <div className="flex flex-col gap-2 pr-8">
            <Badge variant="secondary" className="w-fit">
              {m.payment_dialog_method_kakaopay()}
            </Badge>
            <DialogTitle>{m.payment_dialog_title()}</DialogTitle>
            <DialogDescription>{m.payment_dialog_description()}</DialogDescription>
          </div>
        </DialogHeader>

        {renderStepIndicator()}

        {step === "success" ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border bg-muted/20 px-4 py-8 text-center">
            <CheckCircle2 className="size-10 text-primary" />
            <div className="flex flex-col gap-1">
              <p className="font-medium">{m.payment_dialog_success_title()}</p>
              <p className="text-sm text-muted-foreground">{m.payment_dialog_success_description()}</p>
            </div>
          </div>
        ) : step === "failed" ? (
          <div className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <div className="flex items-center gap-2 font-medium text-destructive">
              <AlertCircle className="size-4" />
              {m.payment_dialog_failure_title()}
            </div>
            <p className="leading-relaxed text-muted-foreground">{errorMessage}</p>
          </div>
        ) : (
          <div className="rounded-xl border bg-background p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <p className="font-medium">{m.payment_dialog_summary_title()}</p>
                <p className="text-sm text-muted-foreground">{m.payment_dialog_notice()}</p>
              </div>
              <Wallet className="size-5 shrink-0 text-primary" />
            </div>
            <Separator className="my-4" />
            <dl className="grid gap-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">{m.payment_dialog_plan_label()}</dt>
                <dd className="font-medium">{m.pricing_plan_pro_name()}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">{m.payment_dialog_amount_label()}</dt>
                <dd className="font-medium">{formatKrw(order?.amount ?? 9900)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">{m.payment_dialog_method_label()}</dt>
                <dd className="font-medium">{m.payment_dialog_method_kakaopay()}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">{m.payment_dialog_activation_label()}</dt>
                <dd className="font-medium">{m.payment_dialog_activation_value()}</dd>
              </div>
            </dl>
          </div>
        )}

        {stepLabel ? (
          <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            {stepLabel}
          </div>
        ) : null}

        <DialogFooter>
          {step === "success" ? (
            <Link
              to="/mail/$mailbox"
              params={{ mailbox: "inbox" }}
              className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
            >
              {m.payment_dialog_go_inbox()}
            </Link>
          ) : step === "failed" ? (
            <>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                {m.payment_dialog_close()}
              </Button>
              <Button type="button" onClick={() => void retryComplete()}>
                {m.payment_dialog_retry()}
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isBusy}>
                {m.payment_dialog_close()}
              </Button>
              <Button type="button" onClick={() => void startPayment()} disabled={isPayDisabled}>
                {isBusy ? (
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                ) : (
                  <Check data-icon="inline-start" />
                )}
                {m.payment_dialog_pay()}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
