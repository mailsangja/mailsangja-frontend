import { createFileRoute, Link, redirect } from "@tanstack/react-router"
import { ArrowRight, ArrowUp, Check, ChevronDown, Mail, PenLine, Reply, Sparkles, Tag } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { LanguageSelect } from "@/components/language-select"
import { buttonVariants } from "@/components/ui/button"
import { m } from "@/paraglide/messages"
import { userQueries } from "@/queries/user"

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(userQueries.me())
    if (user) {
      throw redirect({ to: "/mail/$mailbox", params: { mailbox: "inbox" } })
    }
  },
  component: RouteComponent,
})

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])
  return [ref, inView] as const
}

function LabelVisual() {
  const [ref, inView] = useInView(0.3)
  const rows = [
    {
      subject: m.landing_label_visual_subject_card_statement(),
      label: m.landing_label_visual_label_bill(),
      color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50",
    },
    {
      subject: m.landing_label_visual_subject_order_complete(),
      label: m.landing_label_visual_label_notification(),
      color: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/50",
    },
    {
      subject: m.landing_label_visual_subject_meeting_schedule(),
      label: m.landing_label_visual_label_important(),
      color: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50",
    },
    {
      subject: m.landing_label_visual_subject_newsletter(),
      label: m.landing_label_visual_label_promotion(),
      color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50",
    },
  ]
  return (
    <div
      ref={ref}
      className="w-full max-w-sm overflow-hidden rounded-2xl border bg-background shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
    >
      <div className="flex items-center gap-2 border-b bg-muted/20 px-4 py-3">
        <Tag className="size-3.5 text-primary" />
        <span className="text-xs font-medium">{m.landing_label_visual_title()}</span>
        <span className="ml-auto flex items-center gap-1.5 text-[10px] text-primary">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          <Sparkles className="ai-sparkle-icon size-3" />
          {m.landing_label_visual_status_active()}
        </span>
      </div>
      <div className="divide-y">
        {rows.map((row, i) => (
          <div
            key={row.subject}
            className={`flex items-center gap-3 px-4 py-2.5 transition-all duration-500 ${inView ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"}`}
            style={{ transitionDelay: inView ? `${i * 80}ms` : "0ms" }}
          >
            <div className="min-w-0 flex-1 truncate text-xs text-foreground/80">{row.subject}</div>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${row.color}`}>
              {row.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DraftVisual() {
  return (
    <div className="w-full max-w-sm overflow-hidden rounded-2xl border bg-background shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
      <div className="flex items-center gap-2 border-b bg-muted/20 px-4 py-3">
        <PenLine className="size-3.5 text-primary" />
        <span className="text-xs font-medium">{m.landing_feature_draft_title()}</span>
      </div>
      <div className="space-y-3 p-4">
        <div className="space-y-1.5 text-xs leading-relaxed text-foreground/70">
          <div className="flex gap-2">
            <span className="shrink-0 text-muted-foreground">{m.landing_draft_visual_subject_label()}</span>
            <span className="text-foreground/80">{m.landing_draft_visual_subject()}</span>
          </div>
          <div className="h-px bg-border/50" />
          <p>{m.landing_draft_visual_greeting()}</p>
          <p>
            {m.landing_draft_visual_body()}
            <span className="ml-0.5 inline-block h-3 w-px animate-pulse bg-foreground/70 align-middle" />
          </p>
        </div>

        <div className="relative flex items-center gap-1.5 overflow-hidden rounded-lg bg-primary/8 px-3 py-2 text-[11px] text-primary">
          <Sparkles className="ai-sparkle-icon size-3 shrink-0" />
          {m.landing_draft_visual_loading()}
          <div className="compose-email-editor-ai-sweep" />
        </div>

        <div className="rounded-xl border border-primary/30 bg-muted/20 px-3 py-2.5 text-xs ring-1 ring-primary/15">
          <div className="flex items-end gap-2">
            <p className="flex-1 leading-relaxed text-foreground/80">
              {m.landing_draft_visual_prompt()}
              <span className="ml-0.5 inline-block h-3 w-px animate-pulse bg-foreground/60 align-middle" />
            </p>
            <div className="shrink-0 rounded-lg bg-primary p-1 text-primary-foreground">
              <ArrowUp className="size-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReplyVisual() {
  return (
    <div className="w-full max-w-xs space-y-3">
      <div className="overflow-hidden rounded-2xl border bg-muted/30 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
        <div className="px-4 py-3 text-xs">
          <div className="mb-1 font-medium">{m.landing_reply_visual_sender()}</div>
          <div className="leading-relaxed text-muted-foreground">{m.landing_reply_visual_inbound()}</div>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-primary/25 bg-primary/5 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
        <div className="px-4 py-3 text-xs">
          <div className="mb-2 flex items-center gap-1.5 font-medium text-primary">
            <Sparkles className="ai-sparkle-icon size-3" />
            {m.landing_reply_visual_title()}
          </div>
          <div className="leading-relaxed text-foreground/75">{m.landing_reply_visual_suggestion()}</div>
        </div>
      </div>
    </div>
  )
}

const features = [
  {
    icon: Tag,
    title: m.landing_feature_label_title(),
    description: m.landing_feature_label_description(),
    benefits: [
      m.landing_feature_label_benefit_manual(),
      m.landing_feature_label_benefit_save_time(),
      m.landing_feature_label_benefit_multi_account(),
    ],
    Visual: LabelVisual,
  },
  {
    icon: PenLine,
    title: m.landing_feature_draft_title(),
    description: m.landing_feature_draft_description(),
    benefits: [
      m.landing_feature_draft_benefit_llm(),
      m.landing_feature_draft_benefit_tone(),
      m.landing_feature_draft_benefit_edit(),
    ],
    Visual: DraftVisual,
  },
  {
    icon: Reply,
    title: m.landing_feature_reply_title(),
    description: m.landing_feature_reply_description(),
    benefits: [
      m.landing_feature_reply_benefit_options(),
      m.landing_feature_reply_benefit_tone(),
      m.landing_feature_reply_benefit_backlog(),
    ],
    Visual: ReplyVisual,
  },
]

function FeatureSection({ feature, index }: { feature: (typeof features)[0]; index: number }) {
  const [ref, inView] = useInView()
  const isEven = index % 2 === 0
  const { Visual } = feature

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center gap-12 transition-all duration-700 md:flex-row ${isEven ? "" : "md:flex-row-reverse"} ${inView ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
    >
      <div className="flex flex-1 items-center justify-center">
        <Visual />
      </div>
      <div className="flex-1 space-y-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold">{feature.title}</h2>
        </div>
        <p className="leading-relaxed whitespace-pre-line text-muted-foreground">{feature.description}</p>
        <ul className="space-y-3">
          {feature.benefits.map((benefit, i) => (
            <li
              key={benefit}
              className={`flex items-start gap-3 transition-all duration-500 ${inView ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"}`}
              style={{ transitionDelay: inView ? `${(i + 1) * 120}ms` : "0ms" }}
            >
              <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-primary">
                <Check className="size-3 text-primary" />
              </div>
              <span className="text-sm">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const pricingPlans = [
  {
    name: m.pricing_plan_free_name(),
    price: "₩0",
    period: m.pricing_period_month(),
    cta: m.landing_pricing_free_cta(),
    ctaTo: "/signup" as const,
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
    cta: m.landing_pricing_pro_cta(),
    // Switch this link when the plan checkout page is implemented.
    ctaTo: "/signup" as const,
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

function PricingSection() {
  const [ref, inView] = useInView()

  return (
    <section className="snap-start bg-muted/40 px-6 py-24">
      <div
        ref={ref}
        className={`mx-auto max-w-3xl space-y-12 text-center transition-all duration-700 ${inView ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
      >
        <div className="space-y-3">
          <h2 className="text-3xl font-bold">{m.pricing_title()}</h2>
          <p className="text-muted-foreground">{m.pricing_subtitle()}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {pricingPlans.map((plan, pi) => (
            <div
              key={plan.name}
              className={`relative flex flex-col space-y-6 rounded-2xl border p-8 text-left transition-all duration-300 hover:-translate-y-2 ${plan.featured ? "pricing-card-featured" : "bg-background shadow-sm hover:shadow-xl"}`}
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
                {plan.items.map((item, i) => (
                  <li
                    key={item}
                    className={`flex items-center gap-3 transition-all duration-500 ${inView ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"}`}
                    style={{ transitionDelay: inView ? `${(pi * 4 + i + 1) * 80}ms` : "0ms" }}
                  >
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
                <ArrowRight className="size-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function RouteComponent() {
  return (
    <div className="h-svh snap-y snap-mandatory overflow-y-scroll bg-background">
      <header className="fixed inset-x-0 top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Mail className="size-5 text-primary" />
            <Link to="/" className="font-semibold">
              {m.app_name()}
            </Link>
          </div>
          <nav className="flex items-center gap-6">
            <a
              href="https://lumbar-node-b36.notion.site/369a76ffc9a180968462c679978467b1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {m.landing_nav_team()}
            </a>
            <Link to="/signup" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {m.auth_signup_link()}
            </Link>
            <Link to="/login" className="text-sm font-medium transition-colors hover:text-primary">
              {m.auth_login_submit()}
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative flex h-svh snap-start flex-col items-center justify-center overflow-hidden px-6 pt-16">
        <div className="hero-grid pointer-events-none absolute inset-0 opacity-50" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 75% 65% at 50% 50%, transparent 30%, var(--background) 80%)" }}
        />

        <div className="animate-blob pointer-events-none absolute top-1/4 -left-48 size-150 rounded-full bg-primary/12 blur-3xl" />
        <div className="animate-blob-delay pointer-events-none absolute -right-48 bottom-1/4 size-150 rounded-full bg-primary/10 blur-3xl" />
        <div
          className="animate-blob pointer-events-none absolute top-2/3 left-1/2 size-100 -translate-x-1/2 rounded-full bg-sky-400/6 blur-3xl"
          style={{ animationDelay: "-4s" }}
        />

        <div className="relative mx-auto flex w-full max-w-2xl flex-col items-center text-center">
          <div
            className="inline-flex animate-in items-center gap-2 rounded-full border border-primary/25 bg-primary/6 px-4 py-1.5 text-sm text-muted-foreground duration-700 fill-mode-both fade-in slide-in-from-bottom-4"
            style={{ animationDelay: "0ms" }}
          >
            <Sparkles className="ai-sparkle-icon size-3.5 text-primary" />
            {m.landing_hero_badge()}
          </div>
          <h1
            className="mt-8 animate-in text-4xl leading-tight font-bold tracking-tight duration-700 fill-mode-both fade-in slide-in-from-bottom-4 sm:text-5xl md:text-6xl"
            style={{ animationDelay: "150ms" }}
          >
            {m.landing_hero_title_prefix()}
            <br />
            <span className="bg-linear-to-r from-primary to-sky-400 bg-clip-text text-transparent">
              {m.landing_hero_title_highlight()}
            </span>
            {m.landing_hero_title_suffix()}
          </h1>
          <p
            className="mt-8 animate-in text-lg text-muted-foreground duration-700 fill-mode-both fade-in slide-in-from-bottom-4 sm:text-xl"
            style={{ animationDelay: "300ms" }}
          >
            {m.landing_hero_subtitle()}
          </p>
          <div
            className="mt-8 flex animate-in flex-wrap justify-center gap-3 duration-700 fill-mode-both fade-in slide-in-from-bottom-4"
            style={{ animationDelay: "450ms" }}
          ></div>
        </div>

        <div className="animate-scroll-bounce absolute bottom-8 flex flex-col items-center text-muted-foreground/50">
          <ChevronDown className="size-5" />
        </div>
      </section>

      {features.map((feature, index) => (
        <section
          key={feature.title}
          className="flex min-h-svh snap-start items-center px-6 py-24"
          style={{
            background:
              index % 2 === 0
                ? "radial-gradient(ellipse at left top, color-mix(in oklch, var(--primary) 5%, transparent) 0%, transparent 55%)"
                : "radial-gradient(ellipse at right top, color-mix(in oklch, var(--primary) 4%, transparent) 0%, transparent 55%)",
          }}
        >
          <div className="mx-auto w-full max-w-5xl">
            <FeatureSection feature={feature} index={index} />
          </div>
        </section>
      ))}

      <PricingSection />

      <footer className="snap-start border-t px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Mail className="size-4" />
            <span>{m.app_name()}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/terms" className="transition-colors hover:text-foreground">
              {m.landing_footer_terms()}
            </Link>
            <Link to="/privacy" className="transition-colors hover:text-foreground">
              {m.auth_privacy_link()}
            </Link>
            <span>{m.landing_footer_copyright()}</span>
            <LanguageSelect size="sm" contentAlign="end" triggerClassName="w-48 sm:w-48 text-xs" />
          </div>
        </div>
      </footer>
    </div>
  )
}
