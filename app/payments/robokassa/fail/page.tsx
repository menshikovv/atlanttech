import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Оплата не прошла | Atlant Technology",
  description:
    "Страница неуспешной оплаты через Robokassa с подсказкой повторить платеж или вернуться в Telegram-бота.",
}

export default function RobokassaFailPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background py-12 md:py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.17),transparent_30%),radial-gradient(circle_at_80%_15%,rgba(251,191,36,0.14),transparent_26%)]" />
      <div className="absolute right-24 top-20 -z-10 h-72 w-72 rounded-full bg-rose-400/15 blur-3xl animate-pulse" />

      <div className="container mx-auto max-w-3xl px-4">
        <div className="group relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/75 p-8 shadow-[0_20px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl md:p-10">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-300/80 to-transparent" />
          <div className="absolute -right-14 top-8 h-36 w-36 rounded-full bg-rose-400/15 blur-3xl transition-transform duration-700 group-hover:scale-125" />
          <div className="absolute -left-10 bottom-4 h-28 w-28 rounded-full bg-amber-400/15 blur-3xl transition-transform duration-700 group-hover:scale-125" />

          <div className="relative">
            <span className="inline-flex items-center rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1 text-xs uppercase tracking-[0.24em] text-rose-700 dark:text-rose-300">
              Robokassa / Fail
            </span>

            <div className="mt-6 flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-500/15 text-2xl shadow-[0_0_30px_rgba(244,63,94,0.18)]">
                !
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                  Оплата не была завершена
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                  Платеж был отменен или не прошел. Вернитесь в Telegram-бота и
                  попробуйте оплату еще раз.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-background/55 p-4 transition-transform duration-300 hover:-translate-y-1">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Повторная попытка
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground">
                  Откройте `@atlant_tech_bot` и запустите оплату заново с
                  актуальными данными.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-background/55 p-4 transition-transform duration-300 hover:-translate-y-1">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Если деньги списались
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground">
                  Напишите в бот и приложите детали платежа, чтобы проверить
                  статус операции.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm text-primary-foreground shadow-[0_12px_35px_rgba(239,68,68,0.22)] transition duration-300 hover:-translate-y-0.5 hover:opacity-95"
                href="https://t.me/atlant_tech_bot"
                target="_blank"
                rel="noopener noreferrer"
              >
                Открыть @atlant_tech_bot
              </a>
              <a
                className="inline-flex items-center justify-center rounded-xl border border-border bg-background/60 px-5 py-3 text-sm transition duration-300 hover:-translate-y-0.5 hover:bg-muted"
                href="/"
              >
                На главную
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
