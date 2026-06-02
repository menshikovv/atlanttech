"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, PartyPopper, Download, ShieldCheck } from "lucide-react"

function PurchaseSuccessContent() {
  const params = useSearchParams()
  const productName = params.get("productName") || "Продукт"
  const tariff = params.get("tariff") || ""
  const expiresAt = params.get("expiresAt") || ""
  const price = params.get("price") || "0"

  const formatDate = (iso: string) => {
    if (!iso) return "—"
    return new Date(iso).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="glass-strong rounded-2xl p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto mb-6">
            <PartyPopper className="h-8 w-8 text-primary" />
          </div>

          <h1 className="text-2xl font-bold mb-2">Оплата прошла успешно</h1>
          <p className="text-muted-foreground text-sm mb-8">
            Подписка активирована — доступ к продукту открыт
          </p>

          <div className="space-y-4 text-left">
            <div className="rounded-xl bg-secondary/50 p-4">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Продукт</p>
              <p className="font-bold mt-1">{productName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-secondary/50 p-4">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Тариф</p>
                <p className="font-medium text-sm mt-1">{tariff}</p>
              </div>
              <div className="rounded-xl bg-secondary/50 p-4">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Стоимость</p>
                <p className="font-medium text-sm mt-1">
                  {Number(price).toLocaleString("ru-RU")} ₽
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-primary/5 border border-primary/15 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-primary font-semibold">
                    Доступ активирован
                  </p>
                  <p className="text-sm mt-1">
                    Действует до <strong>{formatDate(expiresAt)}</strong>. Никаких ключей вводить
                    не нужно — доступ привязан к аккаунту.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <Button asChild variant="outline" className="w-full gap-2">
              <a href="#">
                <Download className="h-4 w-4" />
                Скачать продукт
              </a>
            </Button>

            <Button asChild className="w-full gap-2">
              <Link href="/dashboard/subscriptions">
                Перейти в мои подписки
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PurchaseSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
          <span className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <PurchaseSuccessContent />
    </Suspense>
  )
}
