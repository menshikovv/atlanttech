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
  Copy,
  ArrowRight,
  ShoppingBag,
  Package,
  Sparkles,
} from "lucide-react"

const iconMap: Record<string, React.ReactNode> = {
  Settings2: <Settings2 className="h-6 w-6 text-primary" />,
  Target: <Target className="h-6 w-6 text-primary" />,
  Shield: <Shield className="h-6 w-6 text-primary" />,
  Layers: <Layers className="h-6 w-6 text-primary" />,
}

export default function SubscriptionsPage() {
  const { purchasedProducts, purchaseProduct } = useAuth()
  const router = useRouter()
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [selectedTariffs, setSelectedTariffs] = useState<Record<string, number>>({})

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handlePurchase = (productId: string) => {
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
        key: purchased.key,
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

        {purchasedProducts.length === 0 ? (
          <div className="glass-strong rounded-2xl p-8 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">У вас пока нет приобретённых продуктов</p>
            <p className="text-muted-foreground text-xs mt-1">Выберите продукт из каталога ниже</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {purchasedProducts.map((prod) => (
              <div
                key={prod.id}
                className="glass-strong rounded-2xl p-6 border border-primary/10 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    {iconMap[prod.icon] || <Package className="h-6 w-6 text-primary" />}
                  </div>
                  <Badge className="bg-primary/10 text-primary border-0 text-[10px]">{prod.tariff}</Badge>
                </div>
                <h3 className="font-bold text-sm">{prod.productName}</h3>
                <p className="text-xs text-muted-foreground mt-1">Действует до: {formatDate(prod.expiresAt)}</p>

                <div className="mt-4 flex items-center gap-2">
                  <code className="text-xs bg-secondary px-2 py-1.5 rounded font-mono flex-1 truncate">
                    {prod.key}
                  </code>
                  <button
                    onClick={() => copyKey(prod.key)}
                    className="flex-shrink-0 p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-primary"
                  >
                    {copiedKey === prod.key ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4 text-xs"
                  onClick={() => handlePurchase(
                    productsData.find((p) => p.name === prod.productName)?.id || ""
                  )}
                >
                  Продлить
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Available products */}
      <section>
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Доступные продукты
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          {productsData.map((product) => {
            const tariffIdx = selectedTariffs[product.id] ?? 0
            const tariff = tariffs[tariffIdx]
            const totalPrice = Math.round(product.priceRub * tariff.months * (1 - tariff.discount))
            const perMonth = Math.round(totalPrice / tariff.months)

            return (
              <div
                key={product.id}
                className={cn(
                  "relative glass-strong rounded-2xl p-6 border transition-shadow hover:shadow-xl",
                  product.popular ? "border-primary/30 shadow-lg shadow-primary/5" : "border-border"
                )}
              >
                {product.popular && (
                  <Badge className="absolute -top-3 right-4 border-0 bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                    <Sparkles className="mr-1 h-3 w-3" />
                    Популярный
                  </Badge>
                )}

                <div className="flex items-start gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
                    {iconMap[product.icon]}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{product.tag}</p>
                    <h3 className="font-bold mt-1">{product.name}</h3>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                <p className="text-xs text-primary mt-2 font-medium">{product.forWhom}</p>

                {/* Tariff selector */}
                <div className="mt-5">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Срок подписки</p>
                  <div className="flex gap-2">
                    {tariffs.map((t, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedTariffs((prev) => ({ ...prev, [product.id]: i }))}
                        className={cn(
                          "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                          tariffIdx === i
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                            : "bg-secondary text-foreground hover:bg-secondary/80"
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="mt-4 rounded-xl bg-secondary/50 p-4">
                  <p className="text-2xl font-bold">{totalPrice.toLocaleString("ru-RU")} ₽</p>
                  <p className="text-sm text-primary font-medium">{perMonth.toLocaleString("ru-RU")} ₽ / мес</p>
                  {tariff.discount > 0 && (
                    <Badge variant="outline" className="mt-1 border-primary/30 bg-primary/5 text-primary text-[10px]">
                      Скидка {tariff.discount * 100}%
                    </Badge>
                  )}
                </div>

                {/* Benefits */}
                <div className="mt-4">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Что вы получите</p>
                  <ul className="space-y-2">
                    {product.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-xs">
                        <Check className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Features */}
                <div className="mt-4">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Возможности</p>
                  <ul className="space-y-2">
                    {product.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0 mt-0.5">
                          <Check className="h-2.5 w-2.5" />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={() => handlePurchase(product.id)}
                  className={cn(
                    "w-full mt-6 rounded-xl",
                    product.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
                      : ""
                  )}
                  variant={product.popular ? "default" : "outline"}
                >
                  Приобрести
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
