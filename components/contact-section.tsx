"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Send, Mail, User, MessageSquare, CheckCircle2, Loader2, Sparkles, ArrowRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { sendContactForm } from "@/app/actions/contact"
import emailjs from '@emailjs/browser'

export function ContactSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [consents, setConsents] = useState({
    personalData: false,
    privacyPolicy: false,
    oferta: false,
    marketing: false,
  })
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '')
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await sendContactForm(formData)

      if (result.success) {
        fetch("/api/support", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }).catch(() => {})

        setIsSuccess(true)
        setFormData({ name: "", email: "", subject: "", message: "" })
        setTimeout(() => setIsSuccess(false), 5000)
      } else {
        alert(result.message || "Произошла ошибка при отправке. Попробуйте позже или свяжитесь через Telegram.")
      }
    } catch (error) {
      console.error("Error sending form:", error)
      alert("Произошла ошибка при отправке. Попробуйте позже или свяжитесь через Telegram.")
    } finally {
      setIsSubmitting(false)
    }
  }


  const setConsent = (key: keyof typeof consents, checked: boolean) => {
    setConsents((prev) => ({ ...prev, [key]: checked }))
  }

  const canSubmit = consents.personalData && consents.privacyPolicy

  const subjects = [
    { value: "subscription", label: "Подписка", icon: "💳" },
    { value: "development", label: "Разработка", icon: "🛠️" },
    { value: "support", label: "Поддержка", icon: "🎧" },
    { value: "partnership", label: "Партнёрство", icon: "🤝" },
    { value: "other", label: "Другое", icon: "💬" },
  ]

  return (
    <section id="contact" ref={sectionRef} className="relative py-16 md:py-20 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 via-background to-background" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-blob" />
      <div
        className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] animate-blob"
        style={{ animationDelay: "-5s" }}
      />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <h2
            className={cn(
              "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 transition-all duration-700 delay-100 px-2",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
            )}
          >
            Обсудим <span className="gradient-text">ваш проект</span>
          </h2>
          <p
            className={cn(
              "text-muted-foreground text-base md:text-lg transition-all duration-700 delay-200 px-2",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
            )}
          >
            Заполните форму и мы свяжемся с вами в течение 24 часов. Первая консультация бесплатно.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6 md:gap-8 lg:gap-12 max-w-6xl mx-auto">
          <div
            className={cn(
              "lg:col-span-2 space-y-4 md:space-y-6 transition-all duration-700 delay-300",
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8",
            )}
          >
            <div className="bg-card rounded-2xl md:rounded-3xl p-6 md:p-8 border border-border shadow-xl shadow-primary/5">
              <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Быстрые контакты</h3>

              <div className="space-y-3 md:space-y-4">
                <a
                  href="https://t.me/atlanttechnology"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl bg-secondary/50 hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all group"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                    <Send className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm md:text-base">Telegram</p>
                    <p className="text-xs md:text-sm text-muted-foreground truncate">@atlanttechnology</p>
                  </div>
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                </a>

                <a
                  href="mailto:atlant.technology@yandex.com"
                  className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl bg-secondary/50 hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all group"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                    <Mail className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm md:text-base">Email</p>
                    <p className="text-xs md:text-sm text-muted-foreground truncate">atlant.technology@yandex.com</p>
                  </div>
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                </a>
              </div>

              <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-border">
                <h4 className="font-medium mb-2 md:mb-3 text-sm md:text-base">Время ответа</h4>
                <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                  Обычно отвечаем в течение 2-4 часов
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {[
                { value: "10+", label: "Проектов" },
                { value: "24/7", label: "Поддержка" },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="bg-card rounded-xl md:rounded-2xl p-4 md:p-6 text-center border border-border shadow-lg"
                  style={{ transitionDelay: `${400 + i * 100}ms` }}
                >
                  <p className="text-xl md:text-2xl font-bold gradient-text">{stat.value}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            className={cn(
              "lg:col-span-3 transition-all duration-700 delay-400",
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8",
            )}
          >
            <div className="bg-card rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 border border-border shadow-xl shadow-primary/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 md:w-40 md:h-40 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />

              {isSuccess ? (
                <div className="text-center py-8 md:py-12">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 md:mb-6 animate-bounce">
                    <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-green-600" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2">Сообщение отправлено!</h3>
                  <p className="text-muted-foreground text-sm md:text-base">Мы свяжемся с вами в ближайшее время.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 relative z-10">
                  <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                        <User className="w-4 h-4 text-primary" />
                        Имя
                      </Label>
                      <Input
                        id="name"
                        placeholder="Ваше имя"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="h-11 md:h-12 rounded-xl bg-secondary/50 border-border focus:border-primary focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                        <Mail className="w-4 h-4 text-primary" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="h-11 md:h-12 rounded-xl bg-secondary/50 border-border focus:border-primary focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      Тема обращения
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {subjects.map((subject) => (
                        <button
                          key={subject.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, subject: subject.label })}
                          className={cn(
                            "px-3 py-2 md:px-4 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-all duration-200 border",
                            formData.subject === subject.label
                              ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                              : "bg-secondary/50 text-foreground border-border hover:border-primary/50 hover:bg-primary/5",
                          )}
                        >
                          <span className="mr-1 md:mr-1.5">{subject.icon}</span>
                          {subject.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="flex items-center gap-2 text-sm font-medium">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      Сообщение
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Опишите ваш проект или задачу..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={4}
                      className="rounded-xl bg-secondary/50 border-border focus:border-primary focus:ring-primary/20 resize-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <label htmlFor="consent-personal-data" className="flex items-start gap-3 cursor-pointer group">
                      <input
                        id="consent-personal-data"
                        type="checkbox"
                        checked={consents.personalData}
                        onChange={(e) => setConsent("personalData", e.target.checked)}
                        className="peer sr-only"
                      />
                      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 border-border bg-secondary/50 transition-all group-hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground">
                        {consents.personalData && <Check className="h-3 w-3" />}
                      </span>
                      <span className="text-xs text-muted-foreground leading-relaxed">
                        Я соглашаюсь на <a href="/personal-data-consent" className="text-primary hover:underline">обработку персональных данных</a>.
                        <span className="text-foreground"> *</span>
                      </span>
                    </label>

                    <label htmlFor="consent-privacy-policy" className="flex items-start gap-3 cursor-pointer group">
                      <input
                        id="consent-privacy-policy"
                        type="checkbox"
                        checked={consents.privacyPolicy}
                        onChange={(e) => setConsent("privacyPolicy", e.target.checked)}
                        className="peer sr-only"
                      />
                      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 border-border bg-secondary/50 transition-all group-hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground">
                        {consents.privacyPolicy && <Check className="h-3 w-3" />}
                      </span>
                      <span className="text-xs text-muted-foreground leading-relaxed">
                        Я подтверждаю, что ознакомился(ась) с <a href="/privacy-policy" className="text-primary hover:underline">Политикой конфиденциальности</a>.
                        <span className="text-foreground"> *</span>
                      </span>
                    </label>

                    <label htmlFor="consent-oferta" className="flex items-start gap-3 cursor-pointer group">
                      <input
                        id="consent-oferta"
                        type="checkbox"
                        checked={consents.oferta}
                        onChange={(e) => setConsent("oferta", e.target.checked)}
                        className="peer sr-only"
                      />
                      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 border-border bg-secondary/50 transition-all group-hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground">
                        {consents.oferta && <Check className="h-3 w-3" />}
                      </span>
                      <span className="text-xs text-muted-foreground leading-relaxed">
                        Я подтверждаю, что ознакомился(ась) с <a href="/oferta" className="text-primary hover:underline">Публичной офертой</a>.
                      </span>
                    </label>

                    <label htmlFor="consent-marketing" className="flex items-start gap-3 cursor-pointer group">
                      <input
                        id="consent-marketing"
                        type="checkbox"
                        checked={consents.marketing}
                        onChange={(e) => setConsent("marketing", e.target.checked)}
                        className="peer sr-only"
                      />
                      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 border-border bg-secondary/50 transition-all group-hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground">
                        {consents.marketing && <Check className="h-3 w-3" />}
                      </span>
                      <span className="text-xs text-muted-foreground leading-relaxed">
                        Я соглашаюсь на получение <a href="/marketing-consent" className="text-primary hover:underline">рекламных и информационных сообщений</a>.
                      </span>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting || !canSubmit}
                    className="w-full h-12 md:h-14 rounded-xl text-base md:text-lg font-medium bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" />
                        Отправка...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                        Отправить сообщение
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
