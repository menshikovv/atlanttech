"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  ArrowRight,
  CheckCircle2,
  Home,
  Loader2,
  RefreshCw,
  Send,
  ShieldCheck,
  XCircle,
} from "lucide-react"

const TELEGRAM_URL = "https://t.me/atlanttechnology"

type Variant = "success" | "fail" | "wait"

type Hint = { title: string; text: string }

type VariantConfig = {
  badge: string
  title: string
  subtitle: string
  icon: typeof CheckCircle2
  spin?: boolean
  /** tailwind color stops for the themed orbs / accents */
  accent: string
  accentSoft: string
  glow: string
  topLine: string
  iconWrap: string
  hints: [Hint, Hint]
}

const CONFIG: Record<Variant, VariantConfig> = {
  success: {
    badge: "Платёж подтверждён",
    title: "Оплата прошла успешно",
    subtitle:
      "Спасибо! Платёж обработан, доступ уже активируется. Детали и ключ придут в Telegram.",
    icon: CheckCircle2,
    accent: "bg-emerald-400/20",
    accentSoft: "bg-sky-400/15",
    glow: "shadow-[0_0_45px_rgba(16,185,129,0.35)]",
    topLine: "via-emerald-300/80",
    iconWrap: "bg-emerald-500/15 text-emerald-500",
    hints: [
      {
        title: "Что дальше",
        text: "Откройте Telegram-канал — там появится ключ и актуальный статус доступа.",
      },
      {
        title: "Доступ привязан к аккаунту",
        text: "Ничего вводить вручную не нужно: подписка активируется автоматически.",
      },
    ],
  },
  fail: {
    badge: "Платёж не завершён",
    title: "Оплата не была завершена",
    subtitle:
      "Платёж отменён или не прошёл. Деньги не списаны — вы можете спокойно попробовать снова.",
    icon: XCircle,
    accent: "bg-rose-400/20",
    accentSoft: "bg-amber-400/15",
    glow: "shadow-[0_0_45px_rgba(244,63,94,0.32)]",
    topLine: "via-rose-300/80",
    iconWrap: "bg-rose-500/15 text-rose-500",
    hints: [
      {
        title: "Повторная попытка",
        text: "Вернитесь и запустите оплату заново — большинство ошибок решаются повтором.",
      },
      {
        title: "Если деньги всё же списались",
        text: "Напишите нам в Telegram с деталями платежа — проверим статус операции.",
      },
    ],
  },
  wait: {
    badge: "Ожидаем подтверждение",
    title: "Обрабатываем оплату",
    subtitle:
      "Платёжная система подтверждает транзакцию. Обычно это занимает несколько секунд — страница обновится сама.",
    icon: Loader2,
    spin: true,
    accent: "bg-amber-300/20",
    accentSoft: "bg-sky-400/15",
    glow: "shadow-[0_0_45px_rgba(251,191,36,0.32)]",
    topLine: "via-amber-300/80",
    iconWrap: "bg-amber-400/15 text-amber-500",
    hints: [
      {
        title: "Не закрывайте страницу",
        text: "Как только банк подтвердит платёж, статус обновится автоматически.",
      },
      {
        title: "Это занимает время?",
        text: "Иногда подтверждение идёт до пары минут. Можно проверить статус вручную.",
      },
    ],
  },
}

export function PaymentStatus({ variant }: { variant: Variant }) {
  const config = CONFIG[variant]
  const Icon = config.icon
  const params = useSearchParams()

  const orderId =
    params.get("orderId") || params.get("InvId") || params.get("invId") || ""
  const amount = params.get("amount") || params.get("OutSum") || params.get("sum") || ""

  // gentle auto re-check for the "wait" state
  const [seconds, setSeconds] = useState(8)
  useEffect(() => {
    if (variant !== "wait") return
    const timer = setInterval(() => {
      setSeconds((value) => {
        if (value <= 1) {
          if (typeof window !== "undefined") window.location.reload()
          return 0
        }
        return value - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [variant])

  const meta = useMemo(() => {
    const items: { label: string; value: string }[] = []
    if (orderId) items.push({ label: "Номер заказа", value: orderId })
    if (amount) items.push({ label: "Сумма", value: `${Number(amount).toLocaleString("ru-RU")} ₽` })
    return items
  }, [amount, orderId])

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12 md:py-16">
      {/* ambient background */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 -z-10",
          variant === "success" &&
            "bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_34%),radial-gradient(circle_at_82%_22%,rgba(56,189,248,0.14),transparent_30%)]",
          variant === "fail" &&
            "bg-[radial-gradient(circle_at_top,rgba(244,63,94,0.15),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(251,191,36,0.13),transparent_28%)]",
          variant === "wait" &&
            "bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.15),transparent_32%),radial-gradient(circle_at_82%_20%,rgba(56,189,248,0.14),transparent_28%)]",
        )}
      />
      <div className={cn("pointer-events-none absolute left-1/2 top-20 -z-10 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl animate-pulse", config.accent)} />
      <div className={cn("pointer-events-none absolute bottom-16 right-24 -z-10 h-64 w-64 rounded-full blur-3xl", config.accentSoft)} />

      <div className="w-full max-w-xl animate-in fade-in zoom-in-95 duration-500">
        <div className="group relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/75 p-7 shadow-[0_24px_90px_rgba(15,23,42,0.20)] backdrop-blur-xl md:p-10">
          <div className={cn("absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent", config.topLine)} />

          <div className="relative flex flex-col items-center text-center">
            <div className="relative">
              {variant === "wait" && (
                <span className="absolute inset-0 -m-2 rounded-3xl border border-amber-400/30 animate-ping" />
              )}
              <div
                className={cn(
                  "flex h-20 w-20 items-center justify-center rounded-3xl",
                  config.iconWrap,
                  config.glow,
                )}
              >
                <Icon className={cn("h-10 w-10", config.spin && "animate-spin")} strokeWidth={2.2} />
              </div>
            </div>

            <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {config.badge}
            </span>

            <h1 className="mt-4 text-2xl font-bold tracking-tight md:text-4xl">{config.title}</h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
              {config.subtitle}
            </p>

            {variant === "wait" && (
              <p className="mt-4 text-xs text-muted-foreground">
                Автообновление через <span className="font-semibold text-foreground">{seconds}&nbsp;сек</span>
              </p>
            )}
          </div>

          {meta.length > 0 && (
            <div className="relative mt-7 grid gap-3 sm:grid-cols-2">
              {meta.map((item) => (
                <div key={item.label} className="rounded-2xl border border-border/60 bg-background/55 px-4 py-3 text-left">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{item.label}</p>
                  <p className="mt-1 truncate text-sm font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          )}

          <div className="relative mt-7 grid gap-3 md:grid-cols-2">
            {config.hints.map((hint, index) => (
              <div
                key={hint.title}
                className="rounded-2xl border border-border/60 bg-background/55 p-4 text-left transition-transform duration-300 hover:-translate-y-1"
              >
                <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {index === 0 && variant === "success" ? (
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  ) : null}
                  {hint.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground">{hint.text}</p>
              </div>
            ))}
          </div>

          <div className="relative mt-8 flex flex-col gap-3 sm:flex-row">
            {variant === "success" && (
              <Button asChild className="flex-1 gap-2">
                <Link href="/dashboard/subscriptions">
                  Мои подписки
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}

            {variant === "fail" && (
              <Button asChild className="flex-1 gap-2">
                <Link href="/dashboard/products">
                  Попробовать снова
                  <RefreshCw className="h-4 w-4" />
                </Link>
              </Button>
            )}

            {variant === "wait" && (
              <Button
                className="flex-1 gap-2"
                onClick={() => {
                  if (typeof window !== "undefined") window.location.reload()
                }}
              >
                Проверить статус
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}

            <Button asChild variant="outline" className="flex-1 gap-2">
              <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer">
                <Send className="h-4 w-4" />
                Telegram
              </a>
            </Button>
          </div>

          <div className="relative mt-3 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              <Home className="h-3.5 w-3.5" />
              Вернуться на главную
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
