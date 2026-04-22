type LegalDocumentProps = {
  title: string
  subtitle?: string
  meta?: string
  content: string
}

export function LegalDocument({ title, subtitle, meta, content }: LegalDocumentProps) {
  const sections = content
    .trim()
    .split(/\n\s*\n/)
    .map((section) => section.trim())
    .filter(Boolean)

  return (
    <main className="min-h-screen bg-background py-12 md:py-16">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="mb-2 text-3xl font-bold md:text-4xl">{title}</h1>
        {subtitle ? <p className="mb-1 text-lg font-medium text-muted-foreground">{subtitle}</p> : null}
        {meta ? <p className="mb-8 text-sm text-muted-foreground">{meta}</p> : null}

        <div className="space-y-5 text-sm leading-relaxed text-foreground md:text-base">
          {sections.map((section, index) => (
            <section key={index} className="whitespace-pre-wrap break-words rounded-xl border border-border bg-card/40 p-5">
              {section}
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
