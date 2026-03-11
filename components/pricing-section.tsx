"use client"

import { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { ArrowUpRight, Check, Minus, Sparkles, ShoppingCart } from "lucide-react"

type PlanKey = "solo-crm" | "crm" | "scout-basic" | "scout-pro" | "bundle"

type Plan = {
  key: PlanKey
  product: string
  name: string
  titleLines: string[]
  subtitle: string
  priceRub: number
  oldPriceRub: number
  priceUsd: number
  popular?: boolean
}

type FeatureRow = {
  title: string
  description: string
  cells: Record<PlanKey, boolean | string>
}

const plans: Plan[] = [
  {
    key: "solo-crm",
    product: "PerformanceCoach CRM",
    name: "Solo CRM",
    titleLines: ["Solo CRM"],
    subtitle: "Индивидуальная версия",
    priceRub: 1990,
    oldPriceRub: 2590,
    priceUsd: 25,
  },
  {
    key: "crm",
    product: "PerformanceCoach CRM",
    name: "PerformanceCoach CRM",
    titleLines: ["PerformanceCoach", "CRM"],
    subtitle: "Командная подписка",
    priceRub: 23300,
    oldPriceRub: 30900,
    priceUsd: 299,
  },
  {
    key: "scout-basic",
    product: "ScoutScope",
    name: "ScoutScope Basic",
    titleLines: ["ScoutScope", "Basic"],
    subtitle: "Стандартная версия",
    priceRub: 23700,
    oldPriceRub: 31500,
    priceUsd: 250,
  },
  {
    key: "scout-pro",
    product: "ScoutScope",
    name: "ScoutScope Pro",
    titleLines: ["ScoutScope", "Pro"],
    subtitle: "Расширенная версия",
    priceRub: 37900,
    oldPriceRub: 49900,
    priceUsd: 399,
    popular: true,
  },
  {
    key: "bundle",
    product: "Bundle",
    name: "CRM + ScoutScope Pro",
    titleLines: ["CRM +", "ScoutScope", "Pro"],
    subtitle: "Комплексное решение",
    priceRub: 52200,
    oldPriceRub: 69900,
    priceUsd: 550,
  },
]

const featureRows: FeatureRow[] = [
  {
    title: "Scouting pipeline",
    description: "Воронка кандидатов от первого просмотра до подписания.",
    cells: {
      "solo-crm": false,
      crm: false,
      "scout-basic": true,
      "scout-pro": true,
      bundle: true,
    },
  },
  {
    title: "База кандидатов с историей просмотров",
    description: "Единая база игроков и фиксация всех предыдущих оценок.",
    cells: {
      "solo-crm": false,
      crm: false,
      "scout-basic": true,
      "scout-pro": true,
      bundle: true,
    },
  },
  {
    title: "Карточка игрока",
    description: "Метрики, заметки, статус, контекст и история по каждому кандидату.",
    cells: {
      "solo-crm": false,
      crm: false,
      "scout-basic": true,
      "scout-pro": true,
      bundle: true,
    },
  },
  {
    title: "Сравнение кандидатов",
    description: "Сколько игроков можно сопоставлять одновременно внутри scouting flow.",
    cells: {
      "solo-crm": false,
      crm: false,
      "scout-basic": "до 3",
      "scout-pro": "без лимита",
      bundle: "без лимита",
    },
  },
  {
    title: "Decision Card и weighted scoring",
    description: "Структурированная оценка по критериям и весам вашей модели.",
    cells: {
      "solo-crm": false,
      crm: false,
      "scout-basic": false,
      "scout-pro": true,
      bundle: true,
    },
  },
  {
    title: "Trial evaluation",
    description: "Форма оценки игрока после демо, теста или просмотра trial.",
    cells: {
      "solo-crm": false,
      crm: false,
      "scout-basic": false,
      "scout-pro": true,
      bundle: true,
    },
  },
  {
    title: "Monthly scouting report",
    description: "Ежемесячный отчет по пайплайну и активности scouting-команды.",
    cells: {
      "solo-crm": false,
      crm: false,
      "scout-basic": false,
      "scout-pro": true,
      bundle: true,
    },
  },
  {
    title: "Управление составом и ролями",
    description: "Ростер, роли, статусы игроков и рабочий контур coaching staff.",
    cells: {
      "solo-crm": "1 пользователь",
      crm: true,
      "scout-basic": false,
      "scout-pro": false,
      bundle: true,
    },
  },
  {
    title: "Дневник тренировок и performance-заметки",
    description: "Записи по сессиям, комментарии, статусы и контекст по тренировочному процессу.",
    cells: {
      "solo-crm": true,
      crm: true,
      "scout-basic": false,
      "scout-pro": false,
      bundle: true,
    },
  },
  {
    title: "Дашборды по прогрессу и нагрузке",
    description: "Визуализация динамики, трекинг показателей и сводка для тренерского штаба.",
    cells: {
      "solo-crm": "мини",
      crm: true,
      "scout-basic": false,
      "scout-pro": false,
      bundle: true,
    },
  },
  {
    title: "Экспорт отчетов",
    description: "Выгрузка данных для менеджмента, штаба и внутренней отчетности.",
    cells: {
      "solo-crm": "заметки",
      crm: true,
      "scout-basic": true,
      "scout-pro": true,
      bundle: true,
    },
  },
  {
    title: "Единый контур scouting + CRM",
    description: "Связка решений для организации, где scouting и coaching работают в одном процессе.",
    cells: {
      "solo-crm": false,
      crm: false,
      "scout-basic": false,
      "scout-pro": false,
      bundle: true,
    },
  },
]

function PricingCell({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <div className="flex items-center justify-center">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary shadow-sm shadow-primary/10">
          <Check className="h-4 w-4" />
        </span>
      </div>
    )
  }

  if (value === false) {
    return (
      <div className="flex items-center justify-center">
        <span className="text-muted-foreground/60">
          <Minus className="h-4 w-4" />
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center">
      <span className="rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-xs font-medium text-primary">
        {value}
      </span>
    </div>
  )
}

const periods = [
  { label: "1 месяц", months: 1, discount: 0 },
  { label: "3 месяца", months: 3, discount: 0.1 },
  { label: "6 месяцев", months: 6, discount: 0.2 },
]

export function PricingSection() {
  const [headerVisible, setHeaderVisible] = useState(false)
  const [tableVisible, setTableVisible] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState(0)
  const headerRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const headerObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setHeaderVisible(true)
      },
      { threshold: 0.3 },
    )

    const tableObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setTableVisible(true)
      },
      { threshold: 0.15 },
    )

    if (headerRef.current) headerObserver.observe(headerRef.current)
    if (tableRef.current) tableObserver.observe(tableRef.current)

    return () => {
      headerObserver.disconnect()
      tableObserver.disconnect()
    }
  }, [])

  return (
    <section id="pricing" className="relative overflow-hidden py-24 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      <div className="absolute top-10 left-1/4 h-[420px] w-[420px] rounded-full bg-primary/10 blur-[150px]" />
      <div className="absolute right-0 bottom-10 h-[360px] w-[360px] rounded-full bg-accent/10 blur-[170px]" />

      <div className="container relative z-10 mx-auto px-4">
        <div
          ref={headerRef}
          className={cn(
            "mx-auto mb-14 max-w-4xl text-center transition-all duration-700",
            headerVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
          )}
        >
          <Badge
            variant="outline"
            className={cn(
              "mb-4 border-primary/30 bg-primary/5 text-primary transition-all duration-500 delay-100",
              headerVisible ? "scale-100 opacity-100" : "scale-90 opacity-0",
            )}
          >
            Тарифы
          </Badge>
          <h2
            className={cn(
              "mb-4 text-3xl font-bold text-balance text-foreground transition-all duration-700 delay-200 md:text-4xl lg:text-5xl",
              headerVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            )}
          >
            Тарифы в формате <span className="gradient-text">сравнительной таблицы</span>
          </h2>
          <p
            className={cn(
              "mx-auto max-w-3xl text-lg text-muted-foreground transition-all duration-700 delay-300",
              headerVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            )}
          >
            Выберите подходящий инструмент — ScoutScope для скаутинга или PerformanceCoach CRM для работы с командой.
            Или возьмите оба в связке и закройте весь операционный цикл организации.
          </p>
        </div>

        <div
          ref={tableRef}
          className={cn(
            "overflow-hidden rounded-[2rem] border border-border/80 bg-card/90 shadow-xl shadow-primary/5 backdrop-blur-sm transition-all duration-700",
            tableVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
          )}
        >
          <div className="overflow-x-auto xl:overflow-visible">
            <table className="w-full table-fixed border-separate border-spacing-0">
              <colgroup>
                <col className="w-[24%]" />
                {plans.map((plan) => (
                  <col key={plan.key} className="w-[15.2%]" />
                ))}
              </colgroup>

              <thead>
                <tr>
                  <th className="sticky left-0 z-20 border-r border-b border-border/70 bg-card/95 p-5 text-left align-top backdrop-blur-sm xl:p-6">
                    <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Функции</p>
                    <h3 className="mt-3 text-2xl font-bold text-foreground xl:text-3xl">Что входит</h3>
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground xl:text-sm">
                      Сравните ScoutScope и PerformanceCoach CRM по функциям, а не только по цене.
                    </p>
                  </th>

                  {plans.map((plan) => (
                    <th
                      key={plan.key}
                      className={cn(
                        "border-r border-b border-border/70 p-4 text-center align-top last:border-r-0 xl:p-5",
                        plan.popular && "bg-primary/[0.06]",
                      )}
                    >
                      {plan.popular && (
                        <Badge className="mb-3 border-0 bg-primary px-2 py-1 text-[11px] text-primary-foreground shadow-lg shadow-primary/25 xl:mb-4">
                          <Sparkles className="mr-1 h-3.5 w-3.5" />
                          Рекомендуем
                        </Badge>
                      )}
                      {!plan.popular && <div className="mb-6 h-6" />}
                      <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground xl:text-[11px]">{plan.product}</p>
                      <h4 className="mt-3 text-base font-bold leading-[1.02] text-foreground xl:text-[1.15rem]">
                        {plan.titleLines.map((line) => (
                          <span key={line} className="block">
                            {line}
                          </span>
                        ))}
                      </h4>
                      <p className="mt-3 text-[11px] leading-snug text-muted-foreground xl:text-xs">{plan.subtitle}</p>
                      <div className="mt-5 xl:mt-6">
                        <p className="text-xs text-muted-foreground/60 line-through">{plan.oldPriceRub.toLocaleString("ru-RU")} ₽</p>
                        <p className="text-xl font-bold text-foreground xl:text-[1.9rem]">{plan.priceRub.toLocaleString("ru-RU")} ₽</p>
                        <p className="mt-2 text-xs font-medium text-primary xl:text-sm">${plan.priceUsd} / мес.</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => { setSelectedPlan(plan); setSelectedPeriod(0) }}
                        className={cn(
                          "mt-5 rounded-lg px-3 text-sm xl:mt-6",
                          plan.popular
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-secondary text-foreground hover:bg-secondary/80",
                        )}
                      >
                        <ShoppingCart className="mr-1 h-4 w-4" />
                        Купить
                      </Button>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {featureRows.map((row, index) => (
                  <tr key={row.title} className={cn(index % 2 === 0 ? "bg-secondary/25" : "bg-transparent")}>
                    <td className="sticky left-0 z-10 border-r border-b border-border/70 bg-inherit p-4 align-top backdrop-blur-sm xl:p-5">
                      <h5 className="text-sm font-semibold text-foreground xl:text-base">{row.title}</h5>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground xl:text-sm">{row.description}</p>
                    </td>

                    {plans.map((plan) => (
                      <td
                        key={`${row.title}-${plan.key}`}
                        className={cn(
                          "border-r border-b border-border/70 p-3 align-middle last:border-r-0 xl:p-4",
                          plan.popular && "bg-primary/[0.03]",
                        )}
                      >
                        <div className="flex min-h-[92px] items-center justify-center xl:min-h-[104px]">
                          <PricingCell value={row.cells[plan.key]} />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedPlan} onOpenChange={(open) => !open && setSelectedPlan(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedPlan?.name}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">{selectedPlan?.subtitle}</p>
          </DialogHeader>

          <div className="mt-2 space-y-3">
            {periods.map((period, i) => {
              if (!selectedPlan) return null
              const total = Math.round(selectedPlan.priceRub * period.months * (1 - period.discount))
              const oldTotal = selectedPlan.oldPriceRub * period.months
              const perMonth = Math.round(total / period.months)
              return (
                <button
                  key={i}
                  onClick={() => setSelectedPeriod(i)}
                  className={cn(
                    "w-full rounded-xl border p-4 text-left transition-all",
                    selectedPeriod === i
                      ? "border-primary bg-primary/8 ring-1 ring-primary/30"
                      : "border-border bg-card hover:border-primary/40",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{period.label}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {perMonth.toLocaleString("ru-RU")} ₽ / мес.
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground/60 line-through">{oldTotal.toLocaleString("ru-RU")} ₽</p>
                      <p className="text-lg font-bold text-foreground">{total.toLocaleString("ru-RU")} ₽</p>
                      {period.discount > 0 && (
                        <Badge variant="outline" className="mt-1 border-primary/30 bg-primary/5 text-primary text-[10px]">
                          −{period.discount * 100}%
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <Button
            asChild
            className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <a href="https://t.me/atlant_tech_bot" target="_blank" rel="noopener noreferrer">
              Оформить через Telegram
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </a>
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Наш менеджер свяжется и поможет с подключением
          </p>
        </DialogContent>
      </Dialog>
    </section>
  )
}
