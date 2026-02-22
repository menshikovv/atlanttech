"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Check, Sparkles, Zap, Crown, Rocket, Building2 } from "lucide-react"

// Курсы валют (можно вынести в отдельный файл или получать с API)
const EXCHANGE_RATES = {
  USD_TO_RUB: 95, // примерный курс
}

type Currency = 'USD' | 'RUB'

const subscriptions = [
  {
    name: "Academy Starter",
    price: 249,
    currency: "$",
    period: "месяц",
    description: "Базовый пакет для академий",
    features: [
      "До 5 пользователей",
      "Общий доступ к базе кандидатов",
      "Scouting pipeline (New → Watching → Shortlist → Trial → Signed)",
      "База кандидатов с историей просмотров",
      "Карточка игрока (метрики + заметки)",
      "Сравнение кандидатов (до 3 одновременно)",
      "Статистика по матчам / performance snapshot",
      "История изменений статуса кандидата",
      "Экспорт PDF/Excel для менеджмента",
      "Шаблон отчёта \"Почему мы берём этого игрока\"",
      "Email поддержка",
      "База знаний"
    ],
    icon: Zap,
    popular: false,
  },
  {
    name: "Academy Pro",
    price: 399,
    currency: "$",
    period: "месяц",
    description: "Расширенный пакет с системой принятия решений",
    features: [
      "Включает всё из Starter",
      "До 10 пользователей",
      "Роли и доступы: Coach / Scout / Analyst / Manager",
      "История действий и комментариев",
      "Decision Card: структурированная оценка по критериям",
      "Weighted scoring (веса критериев под вашу модель)",
      "Сравнение кандидатов без лимита",
      "Trial evaluation: форма оценки после просмотра демо / теста",
      "Воронка кандидатов по стадиям",
      "Отчёт по активности скаутинга",
      "Monthly Scouting Report",
      "Брендированный экспорт отчётов (PDF/Excel)",
      "1 onboarding-call (60 мин)",
      "Настройка критериев оценки и pipeline",
      "Приоритетная поддержка"
    ],
    icon: Sparkles,
    popular: true,
  },
  {
    name: "Organization / Multi-team",
    price: 549,
    pricePrefix: "от",
    currency: "$",
    period: "месяц",
    description: "Корпоративное решение для организаций",
    features: [
      "Включает всё из Pro",
      "Неограниченные пользователи",
      "Несколько ростеров (Academy / Main / Youth)",
      "Разделение по командам + общая база кандидатов",
      "Доступы по ростерам",
      "Кастомные критерии и поля под организацию",
      "Шаблоны ролей (IGL / Entry / Support)",
      "История решений: \"когда/почему отклонили/подписали\"",
      "Org dashboard: состояние пайплайна по всем ростерам",
      "Сводка по эффективности скаутинга",
      "Отчёт для Head of Esports / GM",
      "2 onboarding-сессии (штаб + менеджмент)",
      "Выделенный контакт",
      "Приоритетная поддержка"
    ],
    icon: Crown,
    popular: false,
  },
]

function AnimatedPrice({
  price,
  currency,
  isVisible,
  prefix,
  selectedCurrency,
}: {
  price: number
  currency: string
  isVisible: boolean
  prefix?: string
  selectedCurrency: Currency
}) {
  const [displayPrice, setDisplayPrice] = useState(0)

  // Конвертируем цену в зависимости от выбранной валюты
  const convertedPrice = selectedCurrency === 'RUB' && currency === '$'
    ? Math.round(price * EXCHANGE_RATES.USD_TO_RUB)
    : price

  const displayCurrency = selectedCurrency === 'RUB' ? '₽' : '$'

  useEffect(() => {
    if (!isVisible) return

    const duration = 1500
    const steps = 60
    const increment = convertedPrice / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= convertedPrice) {
        setDisplayPrice(convertedPrice)
        clearInterval(timer)
      } else {
        setDisplayPrice(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [isVisible, convertedPrice])

  const formattedPrice = displayPrice.toLocaleString("ru-RU")

  return (
    <span className="text-4xl md:text-5xl font-bold text-foreground">
      {prefix && <span className="text-lg text-muted-foreground mr-1">{prefix}</span>}
      {formattedPrice}
      <span className="text-lg text-muted-foreground ml-1">{displayCurrency}</span>
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
  selectedCurrency,
}: {
  plan: PlanType
  index: number
  isVisible: boolean
  delayOffset?: number
  selectedCurrency: Currency
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
        "relative group rounded-3xl transition-all duration-700 hover:-translate-y-2 w-full",
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

        <div className="text-center mb-8">
          <div className="relative mx-auto mb-6 w-fit">
            <div className={cn("p-4 rounded-2xl transition-colors", plan.popular ? "bg-primary/10" : "bg-secondary")}>
              <Icon className={cn("h-8 w-8", plan.popular ? "text-primary" : "text-muted-foreground")} />
            </div>
          </div>

          <h3 className="text-xl font-bold mb-3 text-foreground">{plan.name}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{plan.description}</p>
        </div>

        <div ref={priceRef} className="text-center mb-8">
          <AnimatedPrice
            price={plan.price}
            currency={plan.currency}
            isVisible={isPriceVisible}
            prefix={plan.pricePrefix}
            selectedCurrency={selectedCurrency}
          />
          <p className="text-sm text-muted-foreground mt-2">{plan.period || "единоразово"}</p>
        </div>

        <ul className="space-y-4 mb-8 flex-grow">
          {plan.features.map((feature, featureIndex) => (
            <li key={feature} className="flex items-start gap-3 text-sm">
              <div className={cn("p-0.5 rounded-full mt-1 flex-shrink-0", plan.popular ? "bg-primary/20" : "bg-secondary")}>
                <Check className={cn("h-3 w-3", plan.popular ? "text-primary" : "text-muted-foreground")} />
              </div>
              <span className="text-muted-foreground leading-relaxed">{feature}</span>
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
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD')
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const subsHeaderRef = useRef<HTMLHeadingElement>(null)

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

    if (sectionRef.current) observer.observe(sectionRef.current)
    if (headerRef.current) headerObserver.observe(headerRef.current)
    if (subsHeaderRef.current) subsObserver.observe(subsHeaderRef.current)

    return () => {
      observer.disconnect()
      headerObserver.disconnect()
      subsObserver.disconnect()
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

          {/* Currency Switcher */}
          <div
            className={cn(
              "flex justify-center mt-8 transition-all duration-700 delay-400",
              headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            <div className="flex bg-secondary rounded-lg p-1">
              <button
                onClick={() => setSelectedCurrency('USD')}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  selectedCurrency === 'USD'
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                USD ($)
              </button>
              <button
                onClick={() => setSelectedCurrency('RUB')}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  selectedCurrency === 'RUB'
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                RUB (₽)
              </button>
            </div>
          </div>
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
              <div key={plan.name} className="h-[1100px]">
                <PricingCard
                  plan={{ ...plan, period: plan.period }}
                  index={index}
                  isVisible={subsHeaderVisible}
                  selectedCurrency={selectedCurrency}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
