"use client"

import { useEffect, useRef, useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { MessageCircleQuestion, Sparkles, ArrowRight } from "lucide-react"

const faqs = [
  {
    question: "Сколько времени занимает разработка?",
    answer:
      "Сроки зависят от сложности проекта. MVP обычно готов за 2-4 недели, полноценное решение — 1-3 месяца. После первичной консультации мы предоставим детальный план с точными сроками.",
  },
  {
    question: "Какие платформы и технологии вы используете?",
    answer:
      "Мы работаем с современным стеком: React, Next.js, Node.js, Python для backend и аналитики. Поддерживаем интеграции с FaceIT, ESEA, Telegram, Discord и другими платформами. Решения адаптируются под веб, мобильные устройства и десктоп.",
  },
  {
    question: "Есть ли поддержка после запуска?",
    answer:
      "Да, все тарифы включают период поддержки: от 1 месяца в тарифе «Старт» до 12 месяцев в «Enterprise». Мы исправляем баги, помогаем с обновлениями и консультируем по использованию системы.",
  },
  {
    question: "Возможна ли интеграция с FaceIT и Telegram?",
    answer:
      "Конечно! Интеграции с FaceIT API, Telegram Bot API, Discord — наша специализация. CIS FINDER BOT — отличный пример такой интеграции. Мы также можем подключить любые другие API по вашему запросу.",
  },
  {
    question: "Как происходит оплата?",
    answer:
      "Для подписок — помесячная оплата картой или криптовалютой. Для разработки — предоплата 50%, остаток после сдачи проекта. Enterprise-клиентам доступны индивидуальные условия и рассрочка.",
  },
  {
    question: "Как попасть в ScoutScope?",
    answer:
      "Чтобы получить доступ к ScoutScope, оформите один из тарифов ScoutScope (Basic или Pro) в разделе «Продукты». После оплаты доступ активируется автоматически и появляется в личном кабинете во вкладке «Подписки». Если доступ не открылся в течение нескольких минут — напишите в поддержку, и мы поможем.",
  },
]

export function FaqSection() {
  const [headerVisible, setHeaderVisible] = useState(false)
  const [faqVisible, setFaqVisible] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)
  const faqRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const headerObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true)
        }
      },
      { threshold: 0.3 },
    )

    const faqObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFaqVisible(true)
        }
      },
      { threshold: 0.2 },
    )

    if (headerRef.current) {
      headerObserver.observe(headerRef.current)
    }
    if (faqRef.current) {
      faqObserver.observe(faqRef.current)
    }

    return () => {
      headerObserver.disconnect()
      faqObserver.disconnect()
    }
  }, [])

  return (
    <section id="faq" className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 via-background to-secondary/30" />

      <div className="container mx-auto px-4 relative z-10">
        <div
          ref={headerRef}
          className={cn(
            "text-center mb-16 transition-all duration-700",
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          )}
        >
          <Badge
            variant="outline"
            className={cn(
              "mb-4 border-primary/30 text-primary bg-primary/5 transition-all duration-500 delay-100",
              headerVisible ? "opacity-100 scale-100" : "opacity-0 scale-90",
            )}
          >
            FAQ
          </Badge>
          <h2
            className={cn(
              "text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-balance transition-all duration-700 delay-200",
              headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            <span className="gradient-text">Вопросы и ответы</span>
          </h2>
          <p
            className={cn(
              "text-muted-foreground text-lg max-w-2xl mx-auto text-pretty transition-all duration-700 delay-300",
              headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            Ответы на популярные вопросы о нашей работе
          </p>
        </div>

        <div
          ref={faqRef}
          className={cn(
            "max-w-3xl mx-auto transition-all duration-700 delay-200",
            faqVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          )}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className={cn(
                  "bg-card rounded-2xl px-6 border border-border shadow-sm data-[state=open]:border-primary/30 data-[state=open]:shadow-md transition-all duration-300",
                  faqVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                )}
                style={{ transitionDelay: faqVisible ? `${index * 100}ms` : "0ms", transitionDuration: "500ms" }}
              >
                <AccordionTrigger className="text-left hover:no-underline py-5 group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <MessageCircleQuestion className="h-5 w-5 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {faq.question}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 pl-12 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 text-center bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-3xl p-8 border border-primary/10">
            <Sparkles className="h-8 w-8 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-foreground">Остались вопросы?</h3>
            <p className="text-muted-foreground mb-4">Свяжитесь с нами и мы ответим на все ваши вопросы</p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium group"
            >
              Написать нам
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
