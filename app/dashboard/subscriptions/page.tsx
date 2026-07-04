"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { fetchPublicCatalog, type SiteCatalogProduct, type SiteCatalogResponse, type SiteCatalogTariff } from "@/lib/site-api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Clock,
  CreditCard,
  Download,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react"

// Ссылки на сборки приложения по коду тарифа.
// TODO: заменить плейсхолдеры на реальные URL загрузки.
const APP_DOWNLOAD_LINKS: Record<string, string> = {
  base: "https://atlanttech.pro/download/scoutscope-basic",
  pro: "https://atlanttech.pro/download/scoutscope-pro",
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
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
    tariffs: [
      {
        code: "base",
        tag: "СТАНДАРТНАЯ ВЕРСИЯ",
        title: "ScoutScope Basic",
        description: "Базовая scouting-система для структурного поиска кандидатов и ведения общей базы просмотров.",
        productId: "scoutscope-basic",
        visible: true,
        order: 10,
        defaultDays: 7,
        requestWindowHours: 12,
        maxEloSpan: 500,
        maxAgeSpan: 3,
        maxResults: 11000,
        comparePlayersLimit: 3,
        unrestricted: false,
      },
      {
        code: "pro",
        tag: "РАСШИРЕННАЯ ВЕРСИЯ",
        title: "ScoutScope Pro",
        description: "Продвинутый пакет с обновлением базы раз в 12 часов и расширенными возможностями анализа.",
        productId: "scoutscope-pro",
        visible: true,
        order: 30,
        defaultDays: 31,
        requestWindowHours: 0,
        maxEloSpan: null,
        maxAgeSpan: null,
        maxResults: null,
        comparePlayersLimit: null,
        unrestricted: true,
      },
    ],
    products: [
      {
        id: "scoutscope-basic",
        tariffCode: "base",
        tag: "СТАНДАРТНАЯ ВЕРСИЯ",
        name: "ScoutScope Basic",
        description: "Базовая scouting-система для структурного поиска кандидатов и ведения общей базы просмотров.",
        forWhom: "Для скаутов и аналитиков",
        priceRub: 19990,
        priceUsd: 250,
        benefits: [],
        features: ["Сравнение до 3 игроков"],
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
        benefits: [],
        features: ["Сравнение без ограничений"],
        icon: "Shield",
        popular: true,
        visible: true,
        order: 30,
      },
    ],
  }
}

function compareLimitLabel(value: number | null) {
  return value && value > 0 ? `Сравнение: до ${value} игроков` : "Сравнение: без ограничений"
}

function findTariffProduct(
  tariffCode: string,
  catalog: SiteCatalogResponse | null
): SiteCatalogProduct | null {
  if (!catalog) return null
  const tariff = catalog.tariffs.find((item) => item.code === tariffCode)
  if (tariff?.productId) {
    const linked = catalog.products.find((item) => item.id === tariff.productId)
    if (linked) return linked
  }
  return catalog.products.find((item) => item.tariffCode === tariffCode) || null
}

function AvailableTariffCard({
  tariff,
  product,
}: {
  tariff: SiteCatalogTariff
  product: SiteCatalogProduct | null
}) {
  const href = product ? `/dashboard/products?product=${encodeURIComponent(product.id)}` : "/dashboard/products"
  const priceRubText = product ? `от ${product.priceRub.toLocaleString("ru-RU")} ₽ / мес` : "Подробнее в каталоге"
  const priceUsdText = product ? `≈ $${product.priceUsd.toLocaleString("en-US")} / мес` : null
  const downloadHref = APP_DOWNLOAD_LINKS[tariff.code]

  return (
    <article className="glass-strong rounded-2xl border border-border p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{tariff.tag}</p>
          <h3 className="mt-2 text-xl font-bold">{tariff.title}</h3>
        </div>
        <Badge className="bg-primary/10 text-primary border-0">{tariff.code}</Badge>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{tariff.description}</p>

      <div className="mt-5 space-y-2 text-sm">
        <div className="rounded-xl border border-border bg-secondary/30 px-4 py-3">
          {compareLimitLabel(tariff.comparePlayersLimit)}
        </div>
        <div className="rounded-xl border border-border bg-secondary/30 px-4 py-3">
          {tariff.requestWindowHours ? `Фильтр: 1 запрос в ${tariff.requestWindowHours} ч` : "Фильтр: без лимита"}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <div>
          <span className="block text-sm font-semibold">{priceRubText}</span>
          {priceUsdText && (
            <span className="block text-xs text-muted-foreground mt-0.5">{priceUsdText}</span>
          )}
        </div>
        <Button asChild>
          <Link href={href}>Открыть продукт</Link>
        </Button>
      </div>

      {downloadHref && (
        <Button asChild variant="outline" className="mt-3 w-full gap-2">
          <a href={downloadHref} target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4" />
            Скачать приложение
          </a>
        </Button>
      )}
    </article>
  )
}

export default function SubscriptionsPage() {
  const { subscriptions } = useAuth()
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
        setCatalog(buildFallbackCatalog())
      })
      .finally(() => {
        if (active) setCatalogLoaded(true)
      })

    return () => {
      active = false
    }
  }, [])

  const publicTariffs = useMemo(
    () => [...(catalog?.tariffs || [])].sort((left, right) => left.order - right.order),
    [catalog]
  )

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">Подписки</h1>

      <section className="mb-12">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Текущий тариф
        </h2>

        {subscriptions.length === 0 ? (
          <div className="glass-strong rounded-2xl p-8 text-center text-sm text-muted-foreground">
            Для вашей учетной записи пока не выдан активный тариф.
          </div>
        ) : (
          subscriptions.map((subscription) => {
            const product =
              catalog?.products.find((item) => item.id === subscription.productId) ||
              findTariffProduct(
                subscription.productId === "scoutscope-pro"
                  ? "pro"
                  : subscription.productId === "scoutscope-basic"
                    ? "base"
                    : "",
                catalog
              )
            const title = subscription.productName || product?.name || "Тариф"
            const tag = product?.tag || "ДОСТУП"
            return (
              <div key={subscription.id} className="glass-strong rounded-2xl p-6 border border-primary/10">
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{tag}</p>
                    <p className="text-xl font-bold mt-2">{title}</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-0">{subscription.tariff}</Badge>
                </div>

                <div className="grid gap-3 md:grid-cols-3 text-sm text-muted-foreground">
                  <p className="flex items-center gap-1.5 rounded-xl border border-border bg-secondary/30 px-4 py-3">
                    <Calendar className="h-3.5 w-3.5" />
                    Выдан: {formatDate(subscription.paidAt)}
                  </p>
                  <p className="flex items-center gap-1.5 rounded-xl border border-border bg-secondary/30 px-4 py-3">
                    <Clock className="h-3.5 w-3.5" />
                    Доступ до: {formatDate(subscription.expiresAt)}
                  </p>
                  <p className="flex items-center gap-1.5 rounded-xl border border-border bg-secondary/30 px-4 py-3">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Статус: {subscription.active ? "Активен" : "Неактивен"}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Доступные тарифы
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {!catalogLoaded
            ? Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="glass-strong rounded-2xl border border-border p-6 animate-pulse">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="h-3 w-32 rounded-full bg-secondary" />
                      <div className="h-5 w-44 rounded bg-secondary" />
                    </div>
                    <div className="h-6 w-14 rounded-full bg-secondary" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-3 w-full rounded bg-secondary" />
                    <div className="h-3 w-5/6 rounded bg-secondary" />
                  </div>
                  <div className="mt-5 space-y-2">
                    <div className="h-10 w-full rounded-xl bg-secondary" />
                    <div className="h-10 w-full rounded-xl bg-secondary" />
                  </div>
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <div className="space-y-2">
                      <div className="h-4 w-32 rounded bg-secondary" />
                      <div className="h-3 w-24 rounded bg-secondary" />
                    </div>
                    <div className="h-9 w-32 rounded-md bg-secondary" />
                  </div>
                </div>
              ))
            : publicTariffs.map((tariff) => (
                <AvailableTariffCard
                  key={tariff.code}
                  tariff={tariff}
                  product={catalog?.products.find((item) => item.id === tariff.productId) || null}
                />
              ))}
        </div>

        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 mt-6 text-sm text-primary flex items-start gap-3">
          <Target className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            Тарифные карточки открывают страницу продукта с подробным описанием и оплатой.
          </div>
        </div>
      </section>
    </div>
  )
}

