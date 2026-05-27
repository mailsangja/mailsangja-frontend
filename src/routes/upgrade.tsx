import { createFileRoute, Link, useRouter } from "@tanstack/react-router"
import { ArrowLeft, Check } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"

export const Route = createFileRoute("/upgrade")({
  component: RouteComponent,
})

const pricingPlans = [
  {
    name: "FREE Plan",
    price: "₩0",
    period: "/월",
    cta: "FREE Plan 사용하기",
    ctaTo: "/mail/inbox",
    featured: false,
    comingSoon: false,
    items: ["이메일 계정 2개 연동", "AI 기반 자동 라벨 분류", "AI 이메일 초안 작성", "AI 답장 작성"],
  },
  {
    name: "PRO Plan",
    originalPrice: "₩19,900",
    price: "₩9,900",
    period: "/월",
    cta: "PRO Plan 구독하기",
    // 요금제 결제 페이지가 구현되면 해당 페이지로 링크 변경 필요
    ctaTo: "/mail/inbox",
    featured: true,
    comingSoon: true,
    items: [
      "이메일 계정 무제한 연동",
      "AI 기반 자동 라벨 분류",
      "AI 이메일 초안 작성",
      "AI 답장 작성",
      "AI 사용량 무제한",
      "우선 고객 지원",
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
        aria-label="뒤로 가기"
      >
        <ArrowLeft className="size-4" />
      </button>
      <main className="mx-auto h-screen max-w-3xl px-6 py-14">
        <div className="mb-10 space-y-3 text-center">
          <h1 className="text-3xl font-bold">요금제</h1>
          <p className="text-muted-foreground">지금 바로 시작하세요</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col space-y-6 rounded-2xl border p-8 text-left ${plan.featured ? "pricing-card-featured" : "bg-background shadow-sm"}`}
            >
              {plan.comingSoon && (
                <span className="absolute top-4 right-4 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  출시 예정
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
          <p className="text-sm text-muted-foreground">
            사용 한도가 적용됩니다. 가격 및 플랜은 메일상자의 재량에 따라 변경될 수 있습니다.
          </p>
        </div>
      </main>
    </div>
  )
}
