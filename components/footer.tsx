"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { TwizzLogo } from "./twizz-logo"
import { ArrowUp, Mail, Send, Github, Twitter } from "lucide-react"
import { cn } from "@/lib/utils"

export function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="relative py-16 md:py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-secondary/50 to-background" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[150px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12">
          <div className="lg:col-span-2 flex flex-col items-center md:items-start">
            <div className="mb-4">
              <div className="relative w-fit">
                <TwizzLogo className="h-16 w-auto md:h-20 md:w-auto relative z-10" />
              </div>
            </div>
            <p className="text-muted-foreground max-w-md leading-relaxed mb-6 text-center md:text-left">
              Разработка программного обеспечения для киберспортивных команд. Помогаем автоматизировать скаутинг,
              аналитику и управление командой.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Send, href: "https://t.me/scout_scope_bot", label: "Telegram" },
                { icon: Mail, href: "mailto:contact@scout-scope.com", label: "Email" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Github, href: "#", label: "GitHub" },
              ].map((social) => (
                <Button
                  key={social.label}
                  asChild
                  variant="outline"
                  size="icon"
                  className="border-border hover:border-primary hover:bg-primary/5 transition-all bg-transparent"
                >
                  <a href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}>
                    <social.icon className="h-5 w-5" />
                  </a>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Навигация</h4>
            <ul className="space-y-3">
              {[
                { href: "#cases", label: "Кейсы" },
                { href: "#pricing", label: "Цены" },
                { href: "#contact", label: "Контакты" },
                { href: "#faq", label: "FAQ" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-primary transition-all" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Контакты</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://t.me/tw1zzzzz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  @tw1zzzzz
                </a>
              </li>
              <li>
                <a
                  href="mailto:projecttwizz54@gmail.com"
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  projecttwizz54@gmail.com

                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© 2026 Scout Scope. Все права защищены.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Политика конфиденциальности
            </a>
          </div>
        </div>
      </div>

      <button
        onClick={scrollToTop}
        className={cn(
          "fixed bottom-8 right-8 p-3 rounded-full transition-all duration-300 z-50",
          "bg-primary text-primary-foreground",
          "shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-110",
          showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
        )}
        aria-label="Наверх"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </footer>
  )
}
