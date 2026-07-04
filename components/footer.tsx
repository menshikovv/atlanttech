"use client"

import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"
import { AtlantLogo } from "./twizz-logo"
import { cn } from "@/lib/utils"

const legalLinks = [
  { href: "/oferta", label: "Публичная оферта" },
  { href: "/agent-agreement", label: "Агентский договор" },
  { href: "/personal-data-consent", label: "Согласие на обработку персональных данных" },
  { href: "/privacy-policy", label: "Политика конфиденциальности" },
  { href: "/cookies-policy", label: "Политика использования файлов cookies" },
  { href: "/refund-policy", label: "Правила возврата" },
  { href: "/marketing-consent", label: "Согласие на рекламную рассылку" },
]

export function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="relative mt-16 border-t border-border bg-secondary/20">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-4">
          <div className="flex flex-col items-center">
            <AtlantLogo className="-mt-7 h-48 w-auto md:-mt-10 md:h-64" />
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground max-w-md">
              Разработка программного обеспечения и цифровых сервисов для бизнеса и киберспорта.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold">Продукты</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <a href="/dashboard/products" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  ScoutScope Basic
                </a>
              </li>
              <li>
                <a href="/dashboard/products" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  ScoutScope Pro
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold">Правовые документы</h3>
            <ul className="mt-3 space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold">Оператор персональных данных</h3>
            <div className="mt-3 rounded-xl border border-border bg-card/70 p-4 text-sm leading-relaxed">
              <p className="font-semibold text-foreground">ИП Горбунцов Даниил Олегович</p>
              <p className="mt-1 text-muted-foreground">ИНН: 410116292857</p>
              <p className="text-muted-foreground">ОГРНИП: 325619600167854</p>
              <p className="text-muted-foreground">
                Email:{" "}
                <a href="mailto:atlant.technology@yandex.com" className="text-primary hover:underline">
                  atlant.technology@yandex.com
                </a>
              </p>
              <p className="text-muted-foreground">
                Адрес регистрации: Ростовская область, Октябрьский район, слобода Красюковская
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-5 text-xs text-muted-foreground">
          © 2026 Atlant Technology. Все права защищены.
        </div>
      </div>

      <button
        onClick={scrollToTop}
        className={cn(
          "fixed bottom-8 right-8 p-3 rounded-full transition-all duration-300 z-50",
          "bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-110",
          showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
        )}
        aria-label="Наверх"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </footer>
  )
}
