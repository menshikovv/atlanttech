import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Оплата принята | Atlant Technology",
  description:
    "Страница успешной оплаты через Robokassa. Пользователь может вернуться в Telegram-бота и получить ключ доступа.",
}

export default function RobokassaSuccessPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background py-12 md:py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.18),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.16),transparent_28%)]" />
      <div className="absolute left-1/2 top-24 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/20 blur-3xl animate-pulse" />

      <div className="container mx-auto max-w-3xl px-4">
        <div className="group relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/75 p-8 shadow-[0_20px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl md:p-10">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/80 to-transparent" />
          <div className="absolute -right-16 top-6 h-36 w-36 rounded-full bg-emerald-400/15 blur-3xl transition-transform duration-700 group-hover:scale-125" />
          <div className="absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-sky-400/15 blur-3xl transition-transform duration-700 group-hover:scale-125" />

          <div className="relative">
            <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-xs uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">
              Robokassa / Success
            </span>

            <div className="mt-6 flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-2xl shadow-[0_0_30px_rgba(16,185,129,0.22)]">
                ✓
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                  Оплата принята
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                  Платеж успешно обработан. Возвращайтесь в Telegram-бота:
                  там вы получите ключ и статус доступа.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-background/55 p-4 transition-transform duration-300 hover:-translate-y-1">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Что дальше
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground">
                  Откройте диалог с `@atlant_tech_bot`, там появится ключ и
                  актуальный статус доступа.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-background/55 p-4 transition-transform duration-300 hover:-translate-y-1">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Если бот молчит
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground">
                  Подождите несколько секунд и заново откройте чат или команду
                  проверки статуса.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm text-primary-foreground shadow-[0_12px_35px_rgba(14,165,233,0.28)] transition duration-300 hover:-translate-y-0.5 hover:opacity-95"
                href="https://t.me/atlant_tech_bot"
                target="_blank"
                rel="noopener noreferrer"
              >
                Перейти в @atlant_tech_bot
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
