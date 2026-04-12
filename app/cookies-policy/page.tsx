import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Политика использования файлов cookies | Atlant Technology",
  description: "Порядок использования файлов cookies на сайте Atlant Technology.",
}

export default function CookiesPolicyPage() {
  return (
    <main className="min-h-screen bg-background py-12 md:py-16">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Политика использования файлов cookies</h1>
        <p className="text-sm text-muted-foreground mb-8">Дата публикации: 12 апреля 2026 года</p>

        <div className="space-y-6 text-sm md:text-base leading-relaxed text-foreground">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. Общие положения</h2>
            <p>
              Настоящая Политика определяет порядок использования файлов cookies и аналогичных технологий
              на сайте Atlant Technology.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. Что такое cookies</h2>
            <p>
              Cookies — это небольшие текстовые файлы, которые сохраняются на устройстве пользователя при
              посещении сайта и позволяют распознавать браузер, запоминать настройки и анализировать работу сайта.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. Какие cookies мы используем</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Технические: для корректной работы сайта и сохранения пользовательских настроек.</li>
              <li>Аналитические: для анализа посещаемости и улучшения функциональности сайта.</li>
              <li>Функциональные: для персонализации интерфейса и удобства использования сервиса.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">4. Управление cookies</h2>
            <p>
              Пользователь может ограничить или отключить cookies в настройках браузера. При отключении отдельных
              cookies часть функций сайта может работать некорректно.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">5. Контакты оператора</h2>
            <p>
              Оператор персональных данных: ИП Горбунцов Даниил Олегович, ИНН 410116292857, ОГРНИП 325619600167854.
            </p>
            <p>
              Email: <a className="text-primary hover:underline" href="mailto:atlant.technology@yandex.com">atlant.technology@yandex.com</a>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
