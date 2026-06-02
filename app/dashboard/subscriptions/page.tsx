"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { productsData, tariffs } from "@/lib/products-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Settings2,
  Target,
  Shield,
  Layers,
  Check,
  ArrowRight,
  ShoppingBag,
  Package,
  Sparkles,
  AlertCircle,
  Calendar,
  Clock,
} from "lucide-react"

const iconMap: Record<string, React.ReactNode> = {
  Settings2: <Settings2 className="h-6 w-6 text-primary" />,
  Target: <Target className="h-6 w-6 text-primary" />,
  Shield: <Shield className="h-6 w-6 text-primary" />,
  Layers: <Layers className="h-6 w-6 text-primary" />,
}

const productGroups = [
  { title: "PerformanceCoach CRM", ids: ["performancecoach-crm"] },
  { title: "ScoutScope", ids: ["scoutscope-basic", "scoutscope-pro"] },
  { title: "Комплексное решение", ids: ["performancecoach-scoutscope"] },
]

export default function SubscriptionsPage() {
  const { subscriptions, purchaseProduct } = useAuth()
  const router = useRouter()
  const [selectedProduct, setSelectedProduct] = useState(productsData[0].id)
  const [selectedTariffs, setSelectedTariffs] = useState<Record<string, number>>({})

  // Check if a product already has an active (non-expired, not deactivated) subscription
  const hasActiveSubscription = (productId: string) => {
    return subscriptions.some(
      (s) => s.productId === productId && s.active && new Date(s.expiresAt) > new Date()
    )
  }

  const handlePurchase = (productId: string) => {
    if (hasActiveSubscription(productId)) return

    const tariffIdx = selectedTariffs[productId] ?? 0
    const tariff = tariffs[tariffIdx]
    const product = productsData.find((p) => p.id === productId)
    if (!product) return

    const totalPrice = Math.round(product.priceRub * tariff.months * (1 - tariff.discount))
    const purchased = purchaseProduct(productId, tariff.label)
    if (purchased) {
      const params = new URLSearchParams({
        productName: purchased.productName,
        tariff: purchased.tariff,
        expiresAt: purchased.expiresAt,
        price: totalPrice.toString(),
      })
      router.push(`/dashboard/purchase-success?${params.toString()}`)
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">Подписки</h1>

      {/* Purchased products */}
      <section className="mb-12">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Мои продукты
        </h2>

        {subscriptions.length === 0 ? (
          <div className="glass-strong rounded-2xl p-8 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">У вас пока нет приобретённых продуктов</p>
            <p className="text-muted-foreground text-xs mt-1">Выберите продукт из каталога ниже</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subscriptions.map((sub) => {
              const expired = new Date(sub.expiresAt) <= new Date()
              const isActive = sub.active && !expired
              return (
                <div
                  key={sub.id}
                  className="glass-strong rounded-2xl p-6 border border-primary/10 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      {iconMap[sub.icon] || <Package className="h-6 w-6 text-primary" />}
                    </div>
                    <Badge className="bg-primary/10 text-primary border-0 text-[10px]">
                      {sub.tariff}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm">{sub.productName}</h3>
                    <Badge
                      className={cn(
                        "text-[10px] border-0",
                        isActive
                          ? "bg-emerald-500/10 text-emerald-700"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {isActive ? "Активна" : expired ? "Истекла" : "Отключена"}
                    </Badge>
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      Оплачена: {formatDate(sub.paidAt)}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      Действует до: {formatDate(sub.expiresAt)}
                    </p>
                  </div>

                  {(expired || !sub.active) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4 text-xs"
                      onClick={() => handlePurchase(sub.productId)}
                    >
                      Продлить
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Available products */}
      <section>
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Доступные продукты
        </h2>

        {/* Step 1: Product selector — grouped by family */}
        <div className="mb-8 space-y-6">
          {productGroups.map((group, gi) => (
            <div key={group.title}>
              {gi > 0 && <div className="mb-6 border-t border-border" />}
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">
                {group.title}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {group.ids.map((id) => {
                  const product = productsData.find((p) => p.id === id)
                  if (!product) return null
                  return (
                    <button
                      key={product.id}
                      onClick={() => setSelectedProduct(product.id)}
                      className={cn(
                        "relative rounded-2xl border p-4 text-left transition-all",
                        selectedProduct === product.id
                          ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                          : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
                      )}
                    >
                      {product.popular && (
                        <Badge className="absolute -top-2 right-3 border-0 bg-primary text-primary-foreground text-[9px] px-1.5 py-0">
                          Хит
                        </Badge>
                      )}
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 mb-3">
                        {iconMap[product.icon]}
                      </div>
                      <p className="text-xs font-bold leading-tight">{product.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">от {product.priceRub.toLocaleString("ru-RU")} ₽/мес</p>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Step 2: Selected product details + tariff cards */}
        {(() => {
          const product = productsData.find((p) => p.id === selectedProduct)
          if (!product) return null

          return (
            <div className="glass-strong rounded-2xl border border-border p-6 md:p-8">
              {/* Product info header */}
              <div className="flex items-start gap-4 mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
                  {iconMap[product.icon]}
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{product.tag}</p>
                  <h3 className="text-xl font-bold mt-1">{product.name}</h3>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-1">{product.description}</p>
              <p className="text-xs text-primary font-medium mb-6">{product.forWhom}</p>

              {/* Tariff cards */}
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">Выберите срок подписки</p>
              <div className="grid gap-4 md:grid-cols-3 mb-8">
                {tariffs.map((tariff, i) => {
                  const total = Math.round(product.priceRub * tariff.months * (1 - tariff.discount))
                  const perMonth = Math.round(total / tariff.months)
                  const isSelected = (selectedTariffs[product.id] ?? 0) === i

                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedTariffs((prev) => ({ ...prev, [product.id]: i }))}
                      className={cn(
                        "relative rounded-2xl border p-5 text-left transition-all duration-300 ease-out will-change-transform",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 ring-1 ring-primary/20 -translate-y-1 scale-[1.03]"
                          : "border-border bg-card hover:border-primary/30 hover:-translate-y-0.5"
                      )}
                    >
                      {tariff.discount > 0 && (
                        <Badge className="absolute -top-2.5 right-3 border-0 bg-primary text-primary-foreground text-[10px]">
                          −{tariff.discount * 100}%
                        </Badge>
                      )}

                      <p className="text-sm font-bold mb-3">{tariff.label}</p>

                      <p
                        key={total}
                        className="text-2xl font-bold animate-in fade-in slide-in-from-bottom-1 duration-300"
                      >
                        {total.toLocaleString("ru-RU")} ₽
                      </p>
                      <p className="text-xs text-primary font-medium mt-0.5">
                        {perMonth.toLocaleString("ru-RU")} ₽ / мес
                      </p>

                      {tariff.discount > 0 && (
                        <p className="text-[10px] text-muted-foreground mt-1 line-through">
                          {(product.priceRub * tariff.months).toLocaleString("ru-RU")} ₽
                        </p>
                      )}

                      <div className="mt-3 h-1 overflow-hidden rounded-full bg-border">
                        <div
                          className={cn(
                            "h-full rounded-full bg-primary transition-all duration-500 ease-out",
                            isSelected ? "w-full" : "w-0"
                          )}
                        />
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Benefits + Features side by side */}
              <div className="grid gap-6 md:grid-cols-2 mb-6">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">Что вы получите</p>
                  <ul className="space-y-2.5">
                    {product.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">Возможности</p>
                  <ul className="space-y-2.5">
                    {product.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0 mt-0.5">
                          <Check className="h-2.5 w-2.5" />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Buy button */}
              {hasActiveSubscription(product.id) ? (
                <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <AlertCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <p className="text-sm text-primary font-medium">
                    У вас уже есть активная подписка на {product.name}. Вы сможете приобрести новую после окончания текущей или продлить её в разделе «Мои продукты».
                  </p>
                </div>
              ) : (
                <Button
                  onClick={() => handlePurchase(product.id)}
                  className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
                  size="lg"
                >
                  Приобрести {product.name} — {(() => {
                    const idx = selectedTariffs[product.id] ?? 0
                    const t = tariffs[idx]
                    const price = Math.round(product.priceRub * t.months * (1 - t.discount))
                    return (
                      <span key={price} className="ml-1 inline-block animate-in fade-in zoom-in-95 duration-300">
                        {price.toLocaleString("ru-RU")} ₽
                      </span>
                    )
                  })()}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          )
        })()}
      </section>
    </div>
  )
}
