import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Согласие на рекламную рассылку | Atlant Technology",
  description: "Согласие на получение рекламных и информационных материалов.",
}

export default function MarketingConsentPage() {
  return (
    <main className="min-h-screen bg-background py-12 md:py-16">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Согласие на рекламную рассылку</h1>

        <div className="space-y-6 text-sm md:text-base leading-relaxed text-foreground">
          <p>
            Я подтверждаю согласие на получение от Atlant Technology рекламных и информационных сообщений
            по электронной почте, мессенджерам и иным каналам связи, указанным мной при заполнении формы.
          </p>
          <p>
            Согласие предоставляется добровольно и может быть отозвано в любой момент путем направления
            письма на адрес:
            {" "}
            <a className="text-primary hover:underline" href="mailto:atlant.technology@yandex.com">
              atlant.technology@yandex.com
            </a>
            .
          </p>
          <p>
            Оператор: ИП Горбунцов Даниил Олегович, ИНН 410116292857, ОГРНИП 325619600167854.
          </p>
        </div>
      </div>
    </main>
  )
}
