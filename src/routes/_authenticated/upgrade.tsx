import { useEffect, useRef, useState } from "react"
import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router"
import { toast } from "sonner"
import { ArrowLeft, Check, CreditCard, Loader2, ShieldCheck, Sparkles, Wallet } from "lucide-react"

import { PaymentDialog } from "@/components/payment/payment-dialog"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { getErrorMessage } from "@/lib/http-error"
import { useCompletePayment } from "@/mutations/payments"
import { m } from "@/paraglide/messages"
import { useUser } from "@/queries/user"

interface UpgradeSearch {
  paymentId?: string
}

export const Route = createFileRoute("/_authenticated/upgrade")({
  validateSearch: (search: Record<string, unknown>): UpgradeSearch => {
    const paymentId = typeof search.paymentId === "string" ? search.paymentId.trim() : ""
    return paymentId ? { paymentId } : {}
  },
  component: RouteComponent,
})

const pricingPlans = [
  {
    name: m.pricing_plan_free_name(),
    plan: "FREE" as const,
    price: "₩0",
    period: m.pricing_period_month(),
    cta: m.upgrade_pricing_free_cta(),
    featured: false,
    comingSoon: false,
    items: [
      m.pricing_feature_email_accounts_2(),
      m.pricing_feature_ai_labeling(),
      m.pricing_feature_ai_draft(),
      m.pricing_feature_ai_reply(),
    ],
  },
  {
    name: m.pricing_plan_pro_name(),
    plan: "PRO" as const,
    originalPrice: "₩19,900",
    price: "₩9,900",
    period: m.pricing_period_month(),
    cta: m.upgrade_pricing_pro_cta(),
    featured: true,
    comingSoon: false,
    items: [
      m.pricing_feature_email_accounts_unlimited(),
      m.pricing_feature_ai_labeling(),
      m.pricing_feature_ai_draft(),
      m.pricing_feature_ai_reply(),
      m.pricing_feature_ai_usage_unlimited(),
      m.pricing_feature_priority_support(),
    ],
  },
]

const freePlan = pricingPlans.find((plan) => plan.plan === "FREE")
const proPlan = pricingPlans.find((plan) => plan.plan === "PRO")

const trustSignals = [
  { label: m.upgrade_checkout_secure_payment(), icon: ShieldCheck },
  { label: m.payment_dialog_method_kakaopay(), icon: Wallet },
  { label: m.upgrade_checkout_activation(), icon: Sparkles },
]

function RouteComponent() {
  const router = useRouter()
  const navigate = useNavigate({ from: "/upgrade" })
  const search = Route.useSearch()
  const { data: user, isPending: isUserPending } = useUser()
  const { mutateAsync: completeRedirectPayment } = useCompletePayment()
  const completedRedirectPaymentIdRef = useRef<string | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)

  useEffect(() => {
    if (!search.paymentId) return
    if (completedRedirectPaymentIdRef.current === search.paymentId) return

    completedRedirectPaymentIdRef.current = search.paymentId
    const toastId = toast.loading(m.payment_redirect_completing())

    completeRedirectPayment({ paymentId: search.paymentId })
      .then(() => {
        toast.success(m.payment_redirect_success(), { id: toastId })
        void navigate({
          search: {},
          replace: true,
        })
      })
      .catch((error: unknown) => {
        toast.error(m.payment_redirect_error(), {
          id: toastId,
          description: getErrorMessage(error, m.payment_redirect_error()),
        })
      })
  }, [completeRedirectPayment, navigate, search.paymentId])

  return (
    <div className="min-h-svh animate-in overflow-x-hidden bg-muted/20 duration-200 fade-in slide-in-from-right-2">
      <button
        className={buttonVariants({ variant: "ghost", size: "icon", className: "absolute top-4 left-4" })}
        onClick={() => router.history.back()}
        aria-label={m.upgrade_back_aria()}
      >
        <ArrowLeft className="size-4" />
      </button>
      <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-8 px-5 py-16 sm:px-8 lg:px-10">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex max-w-2xl flex-col gap-3">
                <h1 className="text-3xl leading-tight font-semibold tracking-normal sm:text-4xl">
                  {m.upgrade_checkout_title()}
                </h1>
                <p className="text-base text-muted-foreground">{m.upgrade_checkout_subtitle()}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {trustSignals.map((signal) => {
                  const Icon = signal.icon

                  return (
                    <div
                      key={signal.label}
                      className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground"
                    >
                      <Icon className="size-4 text-primary" />
                      <span>{signal.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {proPlan ? (
              <section className="rounded-xl border bg-background p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-semibold">{proPlan.name}</h2>
                        <Badge>{m.upgrade_checkout_discount_label()}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{m.upgrade_checkout_included_title()}</p>
                    </div>
                    <div className="flex flex-col gap-1 sm:items-end">
                      {"originalPrice" in proPlan && proPlan.originalPrice ? (
                        <span className="text-sm text-muted-foreground line-through">{proPlan.originalPrice}</span>
                      ) : null}
                      <div className="flex items-end gap-1">
                        <span className="text-4xl font-semibold">{proPlan.price}</span>
                        <span className="pb-1 text-sm text-muted-foreground">{proPlan.period}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {proPlan.items.map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2 text-sm"
                      >
                        <Check className="size-4 shrink-0 text-primary" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            {freePlan ? (
              <section className="rounded-xl border bg-muted/20 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{freePlan.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {freePlan.price}
                        {freePlan.period}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{m.upgrade_checkout_free_summary()}</p>
                  </div>
                  <Link
                    to="/mail/$mailbox"
                    params={{ mailbox: "inbox" }}
                    className={buttonVariants({ size: "lg", variant: "outline", className: "w-full sm:w-auto" })}
                  >
                    {freePlan.cta}
                  </Link>
                </div>
              </section>
            ) : null}
          </div>

          {proPlan ? (
            <aside className="rounded-xl border bg-background p-5 shadow-sm lg:sticky lg:top-8">
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{m.upgrade_checkout_order_title()}</h2>
                    <p className="text-sm text-muted-foreground">{proPlan.name}</p>
                  </div>
                  <CreditCard className="size-5 text-primary" />
                </div>

                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">{m.upgrade_checkout_subtotal_label()}</span>
                    <span className="font-medium">
                      {"originalPrice" in proPlan && proPlan.originalPrice ? proPlan.originalPrice : proPlan.price}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">{m.upgrade_checkout_discount_label()}</span>
                    <span className="font-medium text-primary">{proPlan.price}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">{m.payment_dialog_method_label()}</span>
                    <span className="font-medium">{m.payment_dialog_method_kakaopay()}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex items-end justify-between gap-4">
                  <span className="text-sm text-muted-foreground">{m.upgrade_checkout_total_label()}</span>
                  <div className="flex flex-row items-baseline gap-1 text-right">
                    <div className="text-2xl font-semibold">{proPlan.price}</div>
                    <div className="text-xs text-muted-foreground">{proPlan.period}</div>
                  </div>
                </div>

                <Button
                  type="button"
                  size="lg"
                  className="w-full"
                  disabled={isUserPending || !user || user.plan === "PRO"}
                  onClick={() => setPaymentDialogOpen(true)}
                >
                  {isUserPending ? (
                    <Loader2 data-icon="inline-start" className="animate-spin" />
                  ) : (
                    <Wallet data-icon="inline-start" />
                  )}
                  {user?.plan === "PRO" ? m.upgrade_pricing_current_plan_cta() : proPlan.cta}
                </Button>

                <p className="text-xs leading-relaxed text-muted-foreground">{m.upgrade_pricing_notice()}</p>
              </div>
            </aside>
          ) : null}
        </section>
      </main>
      {user ? <PaymentDialog open={paymentDialogOpen} user={user} onOpenChange={setPaymentDialogOpen} /> : null}
    </div>
  )
}
