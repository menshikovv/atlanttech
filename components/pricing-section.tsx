"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowRight, Check, Sparkles, Target, Shield } from "lucide-react"
import {
  fetchPublicCatalog,
  type SiteCatalogProduct,
  type SiteCatalogTariff,
  type SiteCatalogResponse,
  type SiteSubscriptionPeriod,
} from "@/lib/site-api"

/* ─────────────────── Icon map ─────────────────── */

const iconMap: Record<string, React.ReactNode> = {
  Target: <Target className="h-6 w-6 text-primary" />,
  Shield: <Shield className="h-6 w-6 text-primary" />,
}

/* ─────────────────── Static fallback ─────────────────── */

function buildFallbackPeriods(): SiteSubscriptionPeriod[] {
  return [
    { label: "1 мес.", months: 1, discount: 0 },
    { label: "3 мес.", months: 3, discount: 0.1 },
    { label: "6 мес.", months: 6, discount: 0.15 },
  ]
}

function buildFallbackPlans(): TeamPlan[] {
  return [
    {
      id: "scoutscope-basic",
      tag: "СТАНДАРТНАЯ ВЕРСИЯ",
      name: "ScoutScope Basic",
      description: "Базовая scouting-система для структурного поиска кандидатов и ведения общей базы просмотров.",
      priceRub: 19990,
      priceUsd: 250,
      icon: <Target className="h-6 w-6 text-primary" />,
      features: [
        "Воронка скаутинга",
        "Карточки кандидатов",
        "Сравнение до 3 игроков",
        "Обновление базы раз в 24 часа",
      ],
    },
    {
      id: "scoutscope-pro",
      tag: "РАСШИРЕННАЯ ВЕРСИЯ",
      name: "ScoutScope Pro",
      description: "Продвинутый пакет, в который входит всё из ScoutScope Basic, но с обновлением базы раз в 12 часов.",
      priceRub: 31990,
      priceUsd: 399,
      popular: true,
      icon: <Shield className="h-6 w-6 text-primary" />,
      features: [
        "Воронка скаутинга",
        "Карточки кандидатов",
        "Сравнение до 3 игроков",
        "Обновление базы раз в 12 часов",
      ],
    },
  ]
}

function productsToPlans(products: SiteCatalogProduct[], tariffs: SiteCatalogTariff[]): TeamPlan[] {
  const tariffByCode = new Map(tariffs.map((t) => [t.code, t]))
  return [...products]
    .filter((p) => p.visible)
    .filter((p) => !p.id.includes("performancecoach"))
    .sort((a, b) => a.order - b.order)
    .map((p) => {
      const linked = p.tariffCode ? tariffByCode.get(p.tariffCode) : undefined
      return {
        id: p.id,
        tag: linked?.tag ?? p.tag,
        name: linked?.title ?? p.name,
        description: linked?.description ?? p.description,
        priceRub: p.priceRub,
        priceUsd: p.priceUsd,
        features: p.features,
        popular: p.popular,
        icon: iconMap[p.icon] ?? <Target className="h-6 w-6 text-primary" />,
      }
    })
}

/* ─────────────────── Data types ─────────────────── */

type Period = { label: string; months: number; discount: number }

type TeamPlan = {
  id?: string
  tag: string
  name: string
  description: string
  priceRub: number
  priceUsd: number
  features: string[]
  popular?: boolean
  icon: React.ReactNode
}

/* ─────────────────── Components ─────────────────── */

function TeamPlanCard({ plan, periods }: { plan: TeamPlan; periods: Period[] }) {
  const [period, setPeriod] = useState(0)
  const p = periods[period]
  const total = Math.round(plan.priceRub * p.months * (1 - p.discount))
  const perMonth = Math.round(total / p.months)

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-card p-6 transition-shadow hover:shadow-xl",
        plan.popular
          ? "border-primary/40 shadow-lg shadow-primary/10"
          : "border-border shadow-sm",
      )}
    >
      {plan.popular && (
        <Badge className="absolute -top-3 right-4 border-0 bg-primary text-primary-foreground shadow-lg shadow-primary/25">
          <Sparkles className="mr-1 h-3 w-3" />
          Фокус
        </Badge>
      )}

      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
        {plan.icon}
      </div>

      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {plan.tag}
      </p>
      <h3 className="mt-2 text-lg font-bold text-foreground leading-tight">{plan.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground flex-1">{plan.description}</p>

      {/* Period selector */}
      <div className="mt-5">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Срок подписки
        </p>
        <div className="flex gap-2">
          {periods.map((pr, i) => (
            <button
              key={i}
              onClick={() => setPeriod(i)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                period === i
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                  : "bg-secondary text-foreground hover:bg-secondary/80",
              )}
            >
              {pr.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-secondary/50 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Стоимость
        </p>
        <p className="mt-1 text-2xl font-bold text-foreground">
          {total.toLocaleString("ru-RU")} ₽
        </p>
        <p className="mt-0.5 text-sm font-medium text-primary">
          ${plan.priceUsd} / 1 месяц
        </p>
        {p.discount > 0 && (
          <Badge variant="outline" className="mt-1.5 border-primary/30 bg-primary/5 text-primary text-[10px]">
            Скидка {p.discount * 100}%
          </Badge>
        )}
      </div>

      {/* Features */}
      <ul className="mt-5 space-y-3">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Check className="h-3 w-3" />
            </span>
            {f}
          </li>
        ))}
      </ul>

      <Button
        asChild
        className={cn(
          "mt-6 w-full rounded-xl shadow-lg",
          plan.popular
            ? "bg-primary text-primary-foreground shadow-primary/25 hover:bg-primary/90"
            : "shadow-primary/10",
        )}
      >
        <Link
          href={`/auth/login?redirect=${encodeURIComponent(
            plan.id ? `/dashboard/products?product=${plan.id}` : "/dashboard/products",
          )}`}
        >
          Купить
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </Button>
    </div>
  )
}

/* ─────────────────── Main Section ─────────────────── */

export function PricingSection() {
  const [headerVisible, setHeaderVisible] = useState(false)
  const [teamVisible, setTeamVisible] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)
  const teamRef = useRef<HTMLDivElement>(null)

  const [catalog, setCatalog] = useState<SiteCatalogResponse | null>(null)
  const [catalogLoaded, setCatalogLoaded] = useState(false)

  useEffect(() => {
    let active = true
    fetchPublicCatalog()
      .then((payload) => {
        if (!active) return
        setCatalog(payload)
      })
      .catch(() => {
        if (!active) return
        setCatalog(null)
      })
      .finally(() => {
        if (active) setCatalogLoaded(true)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const observe = (ref: React.RefObject<HTMLDivElement | null>, set: (v: boolean) => void, threshold = 0.15) => {
      const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) set(true) }, { threshold })
      if (ref.current) obs.observe(ref.current)
      return obs
    }
    const o1 = observe(headerRef, setHeaderVisible, 0.3)
    const o2 = observe(teamRef, setTeamVisible)
    return () => { o1.disconnect(); o2.disconnect() }
  }, [])

  const periods: Period[] = catalog?.subscriptionPeriods?.length
    ? catalog.subscriptionPeriods
    : buildFallbackPeriods()

  const teamPlans: TeamPlan[] = catalog
    ? productsToPlans(catalog.products, catalog.tariffs)
    : buildFallbackPlans()

  return (
    <section id="pricing" className="relative overflow-hidden py-24 md:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      <div className="absolute top-10 left-1/4 h-[420px] w-[420px] rounded-full bg-primary/10 blur-[150px]" />
      <div className="absolute right-0 bottom-10 h-[360px] w-[360px] rounded-full bg-accent/10 blur-[170px]" />

      <div className="container relative z-10 mx-auto px-4">
        {/* ─── Header ─── */}
        <div
          ref={headerRef}
          className={cn(
            "mx-auto mb-14 max-w-3xl text-center transition-all duration-700",
            headerVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
          )}
        >
          <h2 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
            Тарифы <span className="gradient-text">ScoutScope</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Выберите подходящий тариф для профессионального скаутинга.
          </p>
        </div>

        {/* ─── Team tariffs ─── */}
        <div
          ref={teamRef}
          className={cn(
            "mx-auto max-w-6xl transition-all duration-700",
            teamVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
          )}
        >
          <div className="mb-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Командные тарифы
            </p>
            <h2 className="mt-2 text-2xl font-bold md:text-3xl lg:text-4xl">
              Выберите формат подписки под цикл вашей команды
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-2">
            {!catalogLoaded ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm animate-pulse">
                  <div className="mb-4 h-12 w-12 rounded-xl bg-secondary" />
                  <div className="mb-2 h-3 w-24 rounded-full bg-secondary" />
                  <div className="mb-2 h-5 w-40 rounded bg-secondary" />
                  <div className="mb-6 h-4 w-full rounded bg-secondary" />
                  <div className="mb-5 flex gap-2">
                    <div className="h-8 w-16 rounded-full bg-secondary" />
                    <div className="h-8 w-16 rounded-full bg-secondary" />
                    <div className="h-8 w-16 rounded-full bg-secondary" />
                  </div>
                  <div className="mb-4 h-24 rounded-xl bg-secondary" />
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="h-4 w-full rounded bg-secondary" />
                    ))}
                  </div>
                  <div className="mt-6 h-10 w-full rounded-xl bg-secondary" />
                </div>
              ))
            ) : (
              teamPlans.map((plan) => (
                <TeamPlanCard key={plan.name} plan={plan} periods={periods} />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
