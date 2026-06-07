"use client"

import type { ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  Badge,
} from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  createRobokassaCheckout,
  fetchPublicCatalog,
  readStoredSiteToken,
  type SiteCatalogProduct,
  type SiteCatalogResponse,
  type SiteSubscriptionPeriod,
} from "@/lib/site-api"
import { cn } from "@/lib/utils"
import {
  Check,
  Layers,
  Settings2,
  Shield,
  ShoppingCart,
  Sparkles,
  Target,
  Users,
} from "lucide-react"

const iconMap: Record<string, ReactNode> = {
  Settings2: <Settings2 className="h-7 w-7 text-primary" />,
  Target: <Target className="h-7 w-7 text-primary" />,
  Shield: <Shield className="h-7 w-7 text-primary" />,
  Layers: <Layers className="h-7 w-7 text-primary" />,
}

function buildFallbackCatalog(): SiteCatalogResponse {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    subscriptionPeriods: [
      { label: "1 мес.", months: 1, discount: 0 },
      { label: "3 мес.", months: 3, discount: 0.1 },
      { label: "6 мес.", months: 6, discount: 0.15 },
    ],
    tariffs: [],
    products: [
      {
        id: "performancecoach-crm",
        tariffCode: "",
        tag: "КОМАНДНАЯ ПОДПИСКА",
        name: "PerformanceCoach CRM",
        description: "Полная версия CRM для команды: управление игроками, процессами и ежедневной коммуникацией штаба.",
        forWhom: "Для тренерских штабов и менеджеров команд",
        priceRub: 23900,
        priceUsd: 299,
        benefits: [
          "Полный контроль над процессами команды",
          "Единая система коммуникации штаба",
        ],
        features: ["Командный доступ", "Рабочие процессы штаба"],
        icon: "Settings2",
        popular: false,
        visible: true,
        order: 10,
      },
      {
        id: "scoutscope-basic",
        tariffCode: "base",
        tag: "СТАНДАРТНАЯ ВЕРСИЯ",
        name: "ScoutScope Basic",
        description: "Базовая scouting-система для структурного поиска кандидатов и ведения общей базы просмотров.",
        forWhom: "Для скаутов и аналитиков",
        priceRub: 19990,
        priceUsd: 250,
        benefits: [
          "Структурированный поиск кандидатов",
          "Сравнение до 3 игроков",
        ],
        features: ["Карточки кандидатов", "Сравнение до 3 игроков", "Обновление базы раз в 24 часа"],
        icon: "Target",
        popular: false,
        visible: true,
        order: 20,
      },
      {
        id: "scoutscope-pro",
        tariffCode: "pro",
        tag: "РАСШИРЕННАЯ ВЕРСИЯ",
        name: "ScoutScope Pro",
        description: "Продвинутый пакет с обновлением базы раз в 12 часов и расширенными возможностями анализа.",
        forWhom: "Для профессиональных скаутинговых отделов",
        priceRub: 31990,
        priceUsd: 399,
        benefits: [
          "Ускоренное обновление данных",
          "Сравнение без ограничений",
        ],
        features: ["Карточки кандидатов", "Сравнение без ограничений", "Обновление базы раз в 12 часов"],
        icon: "Shield",
        popular: true,
        visible: true,
        order: 30,
      },
      {
        id: "performancecoach-scoutscope",
        tariffCode: "",
        tag: "КОМПЛЕКСНОЕ РЕШЕНИЕ",
        name: "PerformanceCoach CRM + ScoutScope",
        description: "Pro-версия ScoutScope и полная версия PerformanceCoach CRM в одном решении для команды.",
        forWhom: "Для команд с полным циклом работы",
        priceRub: 43990,
        priceUsd: 550,
        benefits: [
          "Единое решение для всех задач",
          "Сквозной процесс для команды",
        ],
        features: ["CRM", "ScoutScope Pro", "Сквозной процесс для команды"],
        icon: "Layers",
        popular: false,
        visible: true,
        order: 40,
      },
    ],
  }
}

function calculateTotal(priceRub: number, period: SiteSubscriptionPeriod) {
  return Math.round(priceRub * period.months * (1 - period.discount) * 100) / 100
}

function submitRobokassaForm(action: string, fields: Record<string, string>) {
  const form = document.createElement("form")
  form.method = "POST"
  form.action = action
  form.style.display = "none"

  Object.entries(fields).forEach(([key, value]) => {
    const input = document.createElement("input")
    input.type = "hidden"
    input.name = key
    input.value = String(value)
    form.appendChild(input)
  })

  document.body.appendChild(form)
  form.submit()
  form.remove()
}

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const selectedProductId = String(searchParams.get("product") || "").trim()
  const [catalog, setCatalog] = useState<SiteCatalogResponse | null>(null)
  const [periodByProductId, setPeriodByProductId] = useState<Record<string, number>>({})
  const [checkoutLoadingId, setCheckoutLoadingId] = useState("")
  const [checkoutMessage, setCheckoutMessage] = useState("")

  useEffect(() => {
    let active = true
    fetchPublicCatalog()
      .then((payload) => {
        if (!active) return
        setCatalog(payload)
      })
      .catch(() => {
        if (!active) return
        setCatalog(buildFallbackCatalog())
      })
    return () => {
      active = false
    }
  }, [])

  const products = useMemo(
    () => [...(catalog?.products || [])].filter((item) => item.visible).sort((left, right) => left.order - right.order),
    [catalog]
  )

  const periods = catalog?.subscriptionPeriods?.length ? catalog.subscriptionPeriods : buildFallbackCatalog().subscriptionPeriods

  useEffect(() => {
    if (!selectedProductId || !products.length) return
    const handle = window.setTimeout(() => {
      const target = document.getElementById(`product-${selectedProductId}`)
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }, 100)
    return () => window.clearTimeout(handle)
  }, [products, selectedProductId])

  const handleCheckout = async (product: SiteCatalogProduct) => {
    const token = readStoredSiteToken()
    if (!token) {
      setCheckoutMessage("Сессия не найдена. Войдите заново, чтобы перейти к оплате.")
      return
    }

    const selectedMonths = periodByProductId[product.id] || periods[0]?.months || 1
    setCheckoutLoadingId(product.id)
    setCheckoutMessage("")
    try {
      const payload = await createRobokassaCheckout(token, {
        productId: product.id,
        months: selectedMonths,
      })
      submitRobokassaForm(payload.action, payload.fields)
    } catch (error) {
      setCheckoutMessage(error instanceof Error ? error.message : "Не удалось подготовить оплату.")
    } finally {
      setCheckoutLoadingId("")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
      <div className="mb-10">
        <Badge variant="outline" className="mb-3 border-primary/30 bg-primary/5 text-primary">
          <Sparkles className="mr-1 h-3 w-3" />
          Продукты
        </Badge>
        <h1 className="text-2xl md:text-3xl font-bold mb-3">Каталог продуктов</h1>
        <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
          Выберите продукт, откройте его описание и оплатите нужный период через Robokassa.
        </p>
      </div>

      {checkoutMessage ? (
        <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
          {checkoutMessage}
        </div>
      ) : null}

      <div className="space-y-8">
        {products.map((product) => {
          const selectedMonths = periodByProductId[product.id] || periods[0]?.months || 1
          const selectedPeriod = periods.find((item) => item.months === selectedMonths) || periods[0]
          const total = calculateTotal(product.priceRub, selectedPeriod)
          const highlighted = selectedProductId === product.id

          return (
            <article
              id={`product-${product.id}`}
              key={product.id}
              className={cn(
                "glass-strong rounded-2xl border p-6 md:p-8 transition-all",
                highlighted ? "border-primary/40 shadow-lg shadow-primary/10" : "border-border"
              )}
            >
              <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                <div className="xl:max-w-3xl">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 flex-shrink-0">
                      {iconMap[product.icon] || <Target className="h-7 w-7 text-primary" />}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{product.tag}</p>
                        {product.popular ? (
                          <Badge className="border-0 bg-primary text-primary-foreground">Популярный выбор</Badge>
                        ) : null}
                      </div>
                      <h2 className="text-xl font-bold mt-2">{product.name}</h2>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{product.description}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-2xl border border-border bg-secondary/30 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="h-4 w-4 text-primary" />
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Для кого</p>
                      </div>
                      <p className="text-sm leading-relaxed">{product.forWhom}</p>
                    </div>

                    <div className="rounded-2xl border border-border bg-secondary/30 p-5">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Преимущества</p>
                      <ul className="space-y-2">
                        {product.benefits.map((benefit) => (
                          <li key={benefit} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {product.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="border-primary/20 bg-primary/5 text-primary text-[10px]">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <aside className="xl:w-[340px] rounded-2xl border border-primary/20 bg-primary/5 p-5">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Оплата через Robokassa</p>
                  <p className="text-2xl font-bold mt-3">{total.toLocaleString("ru-RU")} ₽</p>
                  <p className="text-sm text-muted-foreground mt-1">${product.priceUsd} / 1 месяц</p>

                  <div className="mt-5">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Период</p>
                    <div className="flex flex-wrap gap-2">
                      {periods.map((period) => (
                        <button
                          key={`${product.id}-${period.months}`}
                          type="button"
                          onClick={() => setPeriodByProductId((state) => ({ ...state, [product.id]: period.months }))}
                          className={cn(
                            "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                            selectedMonths === period.months
                              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                              : "bg-background text-foreground hover:bg-secondary"
                          )}
                        >
                          {period.label}
                        </button>
                      ))}
                    </div>
                    {selectedPeriod.discount > 0 ? (
                      <p className="mt-3 text-xs text-primary">Скидка {Math.round(selectedPeriod.discount * 100)}%</p>
                    ) : null}
                  </div>

                  <div className="mt-5 rounded-xl border border-border bg-background/80 p-4 text-sm">
                    Сумма списания рассчитывается по выбранному периоду и будет передана в Robokassa.
                  </div>

                  <Button
                    type="button"
                    className="mt-5 w-full"
                    onClick={() => handleCheckout(product)}
                    disabled={checkoutLoadingId === product.id}
                  >
                    {checkoutLoadingId === product.id ? (
                      "Подготавливаю оплату..."
                    ) : (
                      <span className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Оплатить через Robokassa
                      </span>
                    )}
                  </Button>
                </aside>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
