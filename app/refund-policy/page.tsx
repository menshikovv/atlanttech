import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Правила возврата | Atlant Technology",
  description: "Правила отмены подписки, возвратов и чарджбеков. Приложение к публичной оферте.",
}

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-background py-12 md:py-16">
      <div className="container mx-auto max-w-4xl px-4">
        <p className="text-sm text-muted-foreground mb-2">
          Приложение к{" "}
          <a className="text-primary hover:underline" href="/oferta">публичной оферте</a>
        </p>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Правила возврата</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Правила отмены подписки, возвратов и чарджбеков
        </p>

        <div className="space-y-8 text-sm md:text-base leading-relaxed text-foreground">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. Отмена продления</h2>
            <p>
              1.1. Лицензиат может отключить продление в личном кабинете или уведомлением на email Лицензиара.
            </p>
            <p>
              1.2. Отключение продления прекращает начисление за будущие периоды, но не отменяет уже оплаченный период.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. Возвраты</h2>
            <p>
              2.1. Оплата за период подписки не возвращается. Доступ действует до конца оплаченного периода.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. Чарджбеки</h2>
            <p>
              3.1. При инициировании чарджбека Лицензиар вправе приостановить доступ до решения платёжной системы.
            </p>
            <p>
              3.2. Если чарджбек удовлетворён, задолженность Лицензиата равна стоимости фактически предоставленного
              периода и расходов Лицензиара по спору (если применимо). Доступ может быть прекращён до погашения.
            </p>
          </section>

          <section className="space-y-3 border-t border-border pt-8">
            <p className="text-sm text-muted-foreground">
              По вопросам возврата обращайтесь:{" "}
              <a className="text-primary hover:underline" href="mailto:danilgorbunsov@mail.ru">
                danilgorbunsov@mail.ru
              </a>
              {" "}или{" "}
              <a className="text-primary hover:underline" href="https://t.me/atlant_tech_bot" target="_blank" rel="noopener noreferrer">
                @atlant_tech_bot
              </a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
