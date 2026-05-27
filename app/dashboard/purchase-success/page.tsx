"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Copy, ArrowRight, PartyPopper, Download } from "lucide-react"

function PurchaseSuccessContent() {
  const params = useSearchParams()
  const productName = params.get("productName") || "Продукт"
  const tariff = params.get("tariff") || ""
  const key = params.get("key") || ""
  const expiresAt = params.get("expiresAt") || ""
  const price = params.get("price") || "0"
  const [copied, setCopied] = useState(false)

  const copyKey = () => {
    navigator.clipboard.writeText(key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
          <p className="text-muted-foreground text-sm mb-8">Ваша подписка активирована</p>

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
                <p className="font-medium text-sm mt-1">{Number(price).toLocaleString("ru-RU")} ₽</p>
              </div>
            </div>

            <div className="rounded-xl bg-secondary/50 p-4">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Ключ продукта</p>
              <div className="flex items-center gap-2 mt-2">
                <code className="text-sm bg-white/60 px-3 py-2 rounded-lg font-mono flex-1 break-all">{key}</code>
                <button
                  onClick={copyKey}
                  className="flex-shrink-0 p-2 rounded-lg hover:bg-white/60 transition-colors text-muted-foreground hover:text-primary"
                >
                  {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-secondary/50 p-4">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Срок действия</p>
              <p className="font-medium text-sm mt-1">до {formatDate(expiresAt)}</p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <Button onClick={copyKey} variant="outline" className="w-full gap-2">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Скопировано" : "Скопировать ключ"}
            </Button>

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
