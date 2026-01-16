"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Send, Mail, User, MessageSquare, CheckCircle2, Loader2, Sparkles, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { sendContactForm } from "@/app/actions/contact"
import emailjs from '@emailjs/browser'

export function ContactSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // Инициализируем EmailJS
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

  const subjects = [
    { value: "subscription", label: "Подписка", icon: "💳" },
    { value: "development", label: "Разработка", icon: "🛠️" },
    { value: "support", label: "Поддержка", icon: "🎧" },
    { value: "partnership", label: "Партнёрство", icon: "🤝" },
    { value: "other", label: "Другое", icon: "💬" },
  ]

  return (
    <section id="contact" ref={sectionRef} className="relative py-20 md:py-32 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 via-background to-background" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-blob" />
      <div
        className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] animate-blob"
        style={{ animationDelay: "-5s" }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge
            variant="secondary"
            className={cn(
              "mb-4 bg-primary/10 text-primary border-primary/20 transition-all duration-700",
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90",
            )}
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Связаться с нами
          </Badge>
          <h2
            className={cn(
              "text-3xl md:text-4xl lg:text-5xl font-bold mb-4 transition-all duration-700 delay-100",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
            )}
          >
            Обсудим <span className="gradient-text">ваш проект</span>
          </h2>
          <p
            className={cn(
              "text-muted-foreground text-lg transition-all duration-700 delay-200",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
            )}
          >
            Заполните форму и мы свяжемся с вами в течение 24 часов. Первая консультация бесплатно.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div
            className={cn(
              "lg:col-span-2 space-y-6 transition-all duration-700 delay-300",
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8",
            )}
          >
            <div className="bg-card rounded-3xl p-8 border border-border shadow-xl shadow-primary/5">
              <h3 className="text-xl font-semibold mb-6">Быстрые контакты</h3>

              <div className="space-y-4">
                <a
                  href="https://t.me/twizz_project"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Send className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Telegram</p>
                    <p className="text-sm text-muted-foreground">@twizz_project</p>
                  </div>
                  <ArrowRight className="w-5 h-5 ml-auto text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </a>

                <a
                  href="mailto:contact@twizz-project.com"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">contact@twizz-project.com</p>
                  </div>
                  <ArrowRight className="w-5 h-5 ml-auto text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </a>
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <h4 className="font-medium mb-3">Время ответа</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Обычно отвечаем в течение 2-4 часов
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "50+", label: "Проектов" },
                { value: "24/7", label: "Поддержка" },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="bg-card rounded-2xl p-6 text-center border border-border shadow-lg"
                  style={{ transitionDelay: `${400 + i * 100}ms` }}
                >
                  <p className="text-2xl font-bold gradient-text">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div
            className={cn(
              "lg:col-span-3 transition-all duration-700 delay-400",
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8",
            )}
          >
            <div className="bg-card rounded-3xl p-8 md:p-10 border border-border shadow-xl shadow-primary/5 relative overflow-hidden">
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />

              {isSuccess ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Сообщение отправлено!</h3>
                  <p className="text-muted-foreground">Мы свяжемся с вами в ближайшее время.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div className="grid sm:grid-cols-2 gap-6">
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
                        className="h-12 rounded-xl bg-secondary/50 border-border focus:border-primary focus:ring-primary/20"
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
                        className="h-12 rounded-xl bg-secondary/50 border-border focus:border-primary focus:ring-primary/20"
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
                            "px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border",
                            formData.subject === subject.label
                              ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                              : "bg-secondary/50 text-foreground border-border hover:border-primary/50 hover:bg-primary/5",
                          )}
                        >
                          <span className="mr-1.5">{subject.icon}</span>
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
                      rows={5}
                      className="rounded-xl bg-secondary/50 border-border focus:border-primary focus:ring-primary/20 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full h-14 rounded-xl text-lg font-medium bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Отправка...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Отправить сообщение
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Нажимая кнопку, вы соглашаетесь с{" "}
                    <a href="#" className="text-primary hover:underline">
                      политикой конфиденциальности
                    </a>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
