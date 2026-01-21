"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Check, Sparkles, Zap, Crown, Rocket, Building2 } from "lucide-react"

const subscriptions = [
  {
    name: "Базовый",
    price: 15,
    currency: "$",
    period: "14 дней",
    description: "Подписка на ScoutScope",
    features: ["Доступ к ScoutScope", "Базовая аналитика игроков", "До 50 поисков в день", "Email поддержка"],
    icon: Zap,
    popular: false,
  },
  {
    name: "Улучшенный",
    price: 15,
    currency: "$",
    period: "30 дней",
    description: "Расширенная подписка на ScoutScope",
    features: [
      "Доступ к ScoutScope",
      "Расширенная аналитика",
      "Безлимитные поиски",
      "Приоритетная поддержка",
      "API доступ",
    ],
    icon: Sparkles,
    popular: true,
  },
  {
    name: "Продвинутый",
    price: 20,
    currency: "$",
    period: "30 дней",
    description: "ScoutScope + PerformanceCoach CRM",
    features: [
      "Всё из Улучшенного",
      "PerformanceCoach CRM",
      "Командные дашборды",
      "Интеграции с платформами",
      "Выделенный менеджер",
    ],
    icon: Crown,
    popular: false,
  },
]

const customDevelopment = [
  {
    name: "Старт",
    price: 50000,
    currency: "₽",
    description: "Для небольших проектов",
    features: ["MVP разработка", "До 3 интеграций", "1 месяц поддержки", "Базовая документация"],
    icon: Rocket,
  },
  {
    name: "Про",
    price: 150000,
    currency: "₽",
    description: "Для растущих команд",
    features: [
      "Полный функционал",
      "До 10 интеграций",
      "3 месяца поддержки",
      "Полная документация",
      "Обучение команды",
    ],
    icon: Sparkles,
    popular: true,
  },
  {
    name: "Enterprise",
    price: 300000,
    pricePrefix: "от",
    currency: "₽",
    description: "Индивидуальные решения",
    features: [
      "Кастомная архитектура",
      "Безлимит интеграций",
      "12 месяцев поддержки",
      "SLA гарантии",
      "Выделенная команда",
    ],
    icon: Building2,
  },
]

function AnimatedPrice({
  price,
  currency,
  isVisible,
  prefix,
}: {
  price: number
  currency: string
  isVisible: boolean
  prefix?: string
}) {
  const [displayPrice, setDisplayPrice] = useState(0)

  useEffect(() => {
    if (!isVisible) return

    const duration = 1500
    const steps = 60
    const increment = price / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= price) {
        setDisplayPrice(price)
        clearInterval(timer)
      } else {
        setDisplayPrice(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [isVisible, price])

  const formattedPrice = displayPrice.toLocaleString("ru-RU")

  return (
    <span className="text-4xl md:text-5xl font-bold text-foreground">
      {prefix && <span className="text-lg text-muted-foreground mr-1">{prefix}</span>}
      {formattedPrice}
      <span className="text-lg text-muted-foreground ml-1">{currency}</span>
    </span>
  )
}

type PlanType = {
  name: string
  price: number
  currency: string
  description: string
  features: string[]
  icon: any
  period?: string
  popular?: boolean
  pricePrefix?: string
}

function PricingCard({
  plan,
  index,
  isVisible,
  delayOffset = 0,
}: {
  plan: PlanType
  index: number
  isVisible: boolean
  delayOffset?: number
}) {
  const [isPriceVisible, setIsPriceVisible] = useState(false)
  const priceRef = useRef<HTMLDivElement>(null)
  const Icon = plan.icon

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsPriceVisible(true)
        }
      },
      { threshold: 0.5 }
    )

    if (priceRef.current) {
      observer.observe(priceRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div
      className={cn(
        "relative group rounded-3xl transition-all duration-700 hover:-translate-y-2",
        plan.popular && "z-10",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      )}
      style={{ transitionDelay: `${(index + delayOffset) * 150}ms` }}
    >
      {plan.popular && (
        <div className="absolute -inset-[2px] rounded-3xl bg-gradient-to-r from-primary via-accent to-primary opacity-50 blur-sm group-hover:opacity-75 transition-opacity" />
      )}

      <div
        className={cn(
          "relative h-full bg-card rounded-3xl p-6 border transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col",
          plan.popular ? "border-primary/30" : "border-border hover:border-primary/20",
        )}
      >
        {plan.popular && (
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground shadow-lg shadow-primary/30 animate-pulse">
            Рекомендуем
          </Badge>
        )}

        <div className="text-center mb-6 min-h-[120px] flex flex-col justify-between">
          <div>
            <div className="relative mx-auto mb-4 w-fit">
              <div className={cn("p-4 rounded-2xl transition-colors", plan.popular ? "bg-primary/10" : "bg-secondary")}>
                <Icon className={cn("h-8 w-8", plan.popular ? "text-primary" : "text-muted-foreground")} />
              </div>
            </div>

            <h3 className="text-xl font-bold mb-1 text-foreground">{plan.name}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{plan.description}</p>
          </div>
        </div>

        <div ref={priceRef} className="text-center mb-6">
          <AnimatedPrice price={plan.price} currency={plan.currency} isVisible={isPriceVisible} prefix={plan.pricePrefix} />
          <p className="text-sm text-muted-foreground mt-1">{plan.period || "единоразово"}</p>
        </div>

        <ul className="space-y-3 mb-6 flex-grow">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-center gap-3 text-sm">
              <div className={cn("p-0.5 rounded-full", plan.popular ? "bg-primary/20" : "bg-secondary")}>
                <Check className={cn("h-3 w-3", plan.popular ? "text-primary" : "text-muted-foreground")} />
              </div>
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto">
          <Button
            className={cn(
              "w-full rounded-xl",
              plan.popular
                ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-secondary hover:bg-secondary/80 text-foreground",
            )}
            asChild
          >
            <a href="#contact">{plan.pricePrefix ? "Обсудить" : "Оформить"}</a>
          </Button>
        </div>
      </div>
    </div>
  )
}

export function PricingSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(false)
  const [subsHeaderVisible, setSubsHeaderVisible] = useState(false)
  const [devHeaderVisible, setDevHeaderVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const subsHeaderRef = useRef<HTMLHeadingElement>(null)
  const devHeaderRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 },
    )

    const headerObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true)
        }
      },
      { threshold: 0.3 },
    )

    const subsObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSubsHeaderVisible(true)
        }
      },
      { threshold: 0.5 },
    )

    const devObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDevHeaderVisible(true)
        }
      },
      { threshold: 0.5 },
    )

    if (sectionRef.current) observer.observe(sectionRef.current)
    if (headerRef.current) headerObserver.observe(headerRef.current)
    if (subsHeaderRef.current) subsObserver.observe(subsHeaderRef.current)
    if (devHeaderRef.current) devObserver.observe(devHeaderRef.current)

    return () => {
      observer.disconnect()
      headerObserver.disconnect()
      subsObserver.disconnect()
      devObserver.disconnect()
    }
  }, [])

  return (
    <section id="pricing" ref={sectionRef} className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[150px]" />

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
            Тарифы
          </Badge>
          <h2
            className={cn(
              "text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-balance transition-all duration-700 delay-200",
              headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            <span className="gradient-text">Наш прайс-лист</span>
          </h2>
          <p
            className={cn(
              "text-muted-foreground text-lg max-w-2xl mx-auto text-pretty transition-all duration-700 delay-300",
              headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            Выберите подходящий тариф или закажите разработку под ваши задачи
          </p>
        </div>

        {/* Subscriptions */}
        <div className="mb-24">
          <h3
            ref={subsHeaderRef}
            className={cn(
              "text-2xl font-semibold mb-10 text-center transition-all duration-700",
              subsHeaderVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
            )}
          >
            <span className="text-muted-foreground">Подписки на</span>{" "}
            <span className="text-primary">наши программы</span>
          </h3>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {subscriptions.map((plan, index) => (
              <PricingCard
                key={plan.name}
                plan={{ ...plan, period: plan.period }}
                index={index}
                isVisible={subsHeaderVisible}
              />
            ))}
          </div>
        </div>

        <div>
          <h3
            ref={devHeaderRef}
            className={cn(
              "text-2xl font-semibold mb-10 text-center transition-all duration-700",
              devHeaderVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
            )}
          >
            <span className="text-muted-foreground">Разработка</span> <span className="text-primary">под вас</span>
          </h3>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {customDevelopment.map((plan, index) => (
              <PricingCard
                key={plan.name}
                plan={plan}
                index={index}
                isVisible={devHeaderVisible}
                delayOffset={3}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
