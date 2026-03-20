"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Cookie, X } from "lucide-react"

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted")
    setVisible(false)
  }

  const decline = () => {
    localStorage.setItem("cookie-consent", "declined")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg animate-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-2xl shadow-black/10 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Cookie className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold">Мы используем cookie</h4>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Этот сайт использует файлы cookie для улучшения работы. Продолжая использовать сайт, вы соглашаетесь с{" "}
              <a href="/privacy-policy" className="text-primary hover:underline">
                Политикой конфиденциальности
              </a>
              .
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                onClick={accept}
                className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs px-4"
              >
                Принять
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={decline}
                className="rounded-lg text-xs px-4"
              >
                Отклонить
              </Button>
            </div>
          </div>
          <button
            onClick={decline}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
