"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowRight, Check, Sparkles, BarChart3, Target, Trophy, Settings2, Shield, Layers } from "lucide-react"
import {
  fetchPublicCatalog,
  type SiteCatalogProduct,
  type SiteCatalogTariff,
  type SiteCatalogResponse,
  type SiteSubscriptionPeriod,
} from "@/lib/site-api"

/* ─────────────────── Icon map ─────────────────── */

const iconMap: Record<string, React.ReactNode> = {
  Settings2: <Settings2 className="h-6 w-6 text-primary" />,
  Target: <Target className="h-6 w-6 text-primary" />,
  Shield: <Shield className="h-6 w-6 text-primary" />,
  Layers: <Layers className="h-6 w-6 text-primary" />,
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
      id: "performancecoach-crm",
      tag: "КОМАНДНАЯ ПОДПИСКА",
      name: "PerformanceCoach CRM",
      description: "Полная версия CRM для команды: управление игроками, процессами и ежедневной коммуникацией штаба.",
      priceRub: 23900,
      priceUsd: 299,
      icon: <Settings2 className="h-6 w-6 text-primary" />,
      features: ["Командный доступ", "Рабочие процессы штаба", "Расширенная CRM-логика"],
    },
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
    {
      id: "performancecoach-scoutscope",
      tag: "КОМПЛЕКСНОЕ РЕШЕНИЕ",
      name: "PerformanceCoach CRM + ScoutScope",
      description: "Pro-версия ScoutScope и полная версия PerformanceCoach CRM в одном решении для команды.",
      priceRub: 43990,
      priceUsd: 550,
      icon: <Layers className="h-6 w-6 text-primary" />,
      features: [
        "Полная версия PerformanceCoach CRM",
        "Pro-версия ScoutScope",
        "Сквозной процесс для команды",
      ],
    },
  ]
}

function productsToPlans(products: SiteCatalogProduct[], tariffs: SiteCatalogTariff[]): TeamPlan[] {
  const tariffByCode = new Map(tariffs.map((t) => [t.code, t]))
  return [...products]
    .filter((p) => p.visible)
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

type Module = {
  name: string
  description: string
  priceRub: number
  icon: React.ReactNode
}

const modules: Module[] = [
  {
    name: "Корреляционный анализ",
    description: "Связывает показатели между собой и помогает находить закономерности в развитии игрока.",
    priceRub: 499,
    icon: <BarChart3 className="h-6 w-6 text-primary" />,
  },
  {
    name: "Метрики из спорта",
    description: "Подтягивает спортивные показатели и делает оценку формы более прикладной для тренерского штаба.",
    priceRub: 789,
    icon: <Target className="h-6 w-6 text-primary" />,
  },
  {
    name: "Игровая статистика",
    description: "Собирает ключевую игровую статистику в понятный модуль для быстрого анализа результатов.",
    priceRub: 399,
    icon: <Trophy className="h-6 w-6 text-primary" />,
  },
]

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
  const [soloVisible, setSoloVisible] = useState(false)
  const [teamVisible, setTeamVisible] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)
  const soloRef = useRef<HTMLDivElement>(null)
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
    const o2 = observe(soloRef, setSoloVisible)
    const o3 = observe(teamRef, setTeamVisible)
    return () => { o1.disconnect(); o2.disconnect(); o3.disconnect() }
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
          <Badge
            variant="outline"
            className="mb-4 border-primary/30 bg-primary/5 text-primary"
          >
            Тарифы
          </Badge>
          <h2 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
            Гибкие тарифы для{" "}
            <span className="gradient-text">PerformanceCoach CRM</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Базовый доступ остаётся бесплатным, а нужные аналитические модули можно подключать отдельно под вашу задачу.
          </p>
        </div>

        {/* ─── Solo / Free + Modules ─── */}
        <div
          ref={soloRef}
          className={cn(
            "mx-auto mb-20 max-w-6xl grid gap-6 lg:grid-cols-5 transition-all duration-700",
            soloVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
          )}
        >
          {/* Solo card */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
            <Badge className="mb-4 border-0 bg-primary/10 text-primary">
              <Sparkles className="mr-1 h-3 w-3" />
              Базовый тариф
            </Badge>

            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              SOLO
            </p>
            <h3 className="mt-2 text-2xl font-bold md:text-3xl">PerformanceCoach CRM</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Бесплатная база для персональной работы тренера: фиксируйте прогресс, ведите заметки и собирайте данные в одном месте, а аналитику подключайте по мере роста.
            </p>

            <div className="mt-6 flex items-end gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Стоимость
                </p>
                <p className="text-3xl font-bold md:text-4xl">Бесплатно</p>
              </div>
              <div className="mb-1 rounded-lg bg-primary/10 px-3 py-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">Старт</p>
                <p className="text-xs text-muted-foreground">Без оплаты и без скрытых пакетов</p>
              </div>
            </div>

            <ul className="mt-6 space-y-4">
              {[
                "Единая CRM для тренера и игрока",
                "База сессий, заметок и прогресса",
                "Быстрый старт без обязательной подписки",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 rounded-xl border border-border/60 bg-secondary/30 p-3 text-sm">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check className="h-3 w-3" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <Button
              asChild
              className="mt-6 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
            >
              <a href="https://perfomancecrm.pro/" target="_blank" rel="noopener noreferrer">
                Оставить заявку
                <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
          </div>

          {/* Modules */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Доп. модули
              </p>
              <h3 className="mt-2 text-2xl font-bold md:text-3xl">
                Добавляйте только те инструменты, которые нужны вашей команде сейчас
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Подключайте только те инструменты, которые нужны вашей команде сейчас, без переплаты за лишний функционал.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {modules.map((mod) => (
                <div
                  key={mod.name}
                  className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-lg"
                >
                  <Badge variant="outline" className="mb-3 w-fit border-primary/30 bg-primary/5 text-primary text-[10px]">
                    Модуль
                  </Badge>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    {mod.icon}
                  </div>
                  <h4 className="text-sm font-bold leading-tight">{mod.name}</h4>
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">{mod.description}</p>
                  <div className="mt-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Цена</p>
                    <p className="text-2xl font-bold">{mod.priceRub.toLocaleString("ru-RU")} ₽</p>
                  </div>
                  <a
                    href="https://perfomancecrm.pro/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center text-sm font-medium text-primary hover:underline"
                  >
                    Подключить
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Divider header ─── */}
        <div className="mx-auto max-w-3xl mt-20 mb-14 text-center">
          <Badge
            variant="outline"
            className="mb-4 border-primary/30 bg-primary/5 text-primary"
          >
            Для команд
          </Badge>
          <h2 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
            Тарифы для <span className="gradient-text">команд и организаций</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Выберите подходящий инструмент — ScoutScope для скаутинга или PerformanceCoach CRM для работы с командой.
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

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {!catalogLoaded ? (
              Array.from({ length: 4 }).map((_, i) => (
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
