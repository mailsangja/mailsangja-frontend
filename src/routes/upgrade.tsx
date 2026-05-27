import { createFileRoute, Link, useRouter } from "@tanstack/react-router"
import { ArrowLeft, Check } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/upgrade")({
  component: RouteComponent,
})

const pricingPlans = [
  {
    name: m.pricing_plan_free_name(),
    price: "₩0",
    period: m.pricing_period_month(),
    cta: m.upgrade_pricing_free_cta(),
    ctaTo: "/mail/inbox",
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
    originalPrice: "₩19,900",
    price: "₩9,900",
    period: m.pricing_period_month(),
    cta: m.upgrade_pricing_pro_cta(),
    // Switch this link when the plan checkout page is implemented.
    ctaTo: "/mail/inbox",
    featured: true,
    comingSoon: true,
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

function RouteComponent() {
  const router = useRouter()

  return (
    <div className="min-h-svh animate-in overflow-x-hidden bg-background duration-200 fade-in slide-in-from-right-2">
      <button
        className={buttonVariants({ variant: "ghost", size: "icon", className: "absolute top-4 left-4" })}
        onClick={() => router.history.back()}
        aria-label={m.upgrade_back_aria()}
      >
        <ArrowLeft className="size-4" />
      </button>
      <main className="mx-auto h-screen max-w-3xl px-6 py-14">
        <div className="mb-10 space-y-3 text-center">
          <h1 className="text-3xl font-bold">{m.pricing_title()}</h1>
          <p className="text-muted-foreground">{m.pricing_subtitle()}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col space-y-6 rounded-2xl border p-8 text-left ${plan.featured ? "pricing-card-featured" : "bg-background shadow-sm"}`}
            >
              {plan.comingSoon && (
                <span className="absolute top-4 right-4 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {m.pricing_coming_soon()}
                </span>
              )}
              <div className="space-y-1">
                <p className={`text-sm font-medium ${plan.featured ? "text-primary" : "text-muted-foreground"}`}>
                  {plan.name}
                </p>
                <div className="space-y-1">
                  {"originalPrice" in plan && plan.originalPrice && (
                    <p className="text-sm text-muted-foreground line-through">{plan.originalPrice}</p>
                  )}
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="mb-1 text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                </div>
              </div>
              <ul className="flex-1 space-y-3">
                {plan.items.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <Check className="size-4 shrink-0 text-primary" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to={plan.ctaTo}
                className={buttonVariants({
                  size: "lg",
                  variant: plan.featured ? "default" : "outline",
                  className: "w-full",
                })}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-12 space-y-3 text-center">
          <p className="text-sm text-muted-foreground">{m.upgrade_pricing_notice()}</p>
        </div>
      </main>
    </div>
  )
}
