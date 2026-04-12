import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Правовые документы | Atlant Technology",
  description: "Раздел с обязательными юридическими документами Atlant Technology.",
}

const docs = [
  { href: "/oferta", label: "Публичная оферта" },
  { href: "/personal-data-consent", label: "Согласие на обработку персональных данных" },
  { href: "/privacy-policy", label: "Политика конфиденциальности" },
  { href: "/cookies-policy", label: "Политика использования файлов cookies" },
  { href: "/refund-policy", label: "Правила возврата" },
  { href: "/marketing-consent", label: "Согласие на рекламную рассылку" },
]

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-background py-12 md:py-16">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Правовые документы</h1>
        <p className="text-muted-foreground mb-8">
          Все обязательные юридические документы размещены в открытом доступе и доступны по отдельным ссылкам.
        </p>

        <ul className="space-y-3">
          {docs.map((doc) => (
            <li key={doc.href}>
              <a
                href={doc.href}
                className="block rounded-xl border border-border bg-card/60 px-4 py-3 text-sm md:text-base hover:border-primary/50 hover:bg-card transition-colors"
              >
                {doc.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
