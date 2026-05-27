"use client"

import { productsData } from "@/lib/products-data"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Settings2,
  Target,
  Shield,
  Layers,
  Check,
  Sparkles,
  Users,
  Zap,
  BarChart3,
} from "lucide-react"

const iconMap: Record<string, React.ReactNode> = {
  Settings2: <Settings2 className="h-7 w-7 text-primary" />,
  Target: <Target className="h-7 w-7 text-primary" />,
  Shield: <Shield className="h-7 w-7 text-primary" />,
  Layers: <Layers className="h-7 w-7 text-primary" />,
}

const extendedInfo: Record<string, { audience: string; useCases: string[]; highlights: string[] }> = {
  "performancecoach-crm": {
    audience: "Тренерские штабы, менеджеры команд, спортивные директора",
    useCases: [
      "Ведение профилей игроков и отслеживание прогресса",
      "Планирование тренировочного процесса",
      "Коммуникация внутри штаба",
      "Фиксация заметок и наблюдений по каждому игроку",
    ],
    highlights: [
      "Единая CRM для всей команды",
      "Гибкая настройка рабочих процессов",
      "Интеграция с аналитическими модулями",
    ],
  },
  "scoutscope-basic": {
    audience: "Скауты, аналитики, начинающие скаутинговые отделы",
    useCases: [
      "Структурный поиск и фильтрация кандидатов",
      "Создание карточек и заметок по игрокам",
      "Сравнение до 3 игроков по ключевым метрикам",
      "Ведение базы просмотров и отчётов",
    ],
    highlights: [
      "Простой старт без сложной настройки",
      "Обновление базы каждые 24 часа",
      "Удобный интерфейс воронки скаутинга",
    ],
  },
  "scoutscope-pro": {
    audience: "Профессиональные скаутинговые отделы, клубы с активным трансферным окном",
    useCases: [
      "Всё из ScoutScope Basic",
      "Ускоренное обновление данных каждые 12 часов",
      "Расширенная аналитика и фильтрация",
      "Приоритетный доступ к новым функциям",
    ],
    highlights: [
      "В 2 раза чаще обновляется база",
      "Продвинутые инструменты сравнения",
      "Приоритетная техподдержка",
    ],
  },
  "performancecoach-scoutscope": {
    audience: "Команды с полным циклом: от поиска игроков до работы с составом",
    useCases: [
      "Полный цикл: скаутинг → подписание → работа с игроком",
      "Единая экосистема для всех отделов клуба",
      "Сквозная аналитика от скаутинга до перформанса",
      "Максимальная автоматизация процессов",
    ],
    highlights: [
      "Комплексное решение «всё в одном»",
      "Экономия до 20% по сравнению с раздельной покупкой",
      "Единый интерфейс для всей организации",
    ],
  },
}

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <div className="mb-10">
        <Badge variant="outline" className="mb-3 border-primary/30 bg-primary/5 text-primary">
          <Sparkles className="mr-1 h-3 w-3" />
          Продукты
        </Badge>
        <h1 className="text-2xl md:text-3xl font-bold mb-3">Наши продукты</h1>
        <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
          Программное обеспечение для киберспортивных команд: от скаутинга до управления составом. Каждый продукт решает конкретные задачи.
        </p>
      </div>

      <div className="space-y-8">
        {productsData.map((product) => {
          const info = extendedInfo[product.id]
          return (
            <div
              key={product.id}
              className={cn(
                "glass-strong rounded-2xl p-6 md:p-8 border transition-shadow hover:shadow-lg",
                product.popular ? "border-primary/20" : "border-border"
              )}
            >
              {product.popular && (
                <Badge className="mb-4 border-0 bg-primary text-primary-foreground shadow-sm">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Популярный выбор
                </Badge>
              )}

              <div className="flex items-start gap-4 mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 flex-shrink-0">
                  {iconMap[product.icon]}
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{product.tag}</p>
                  <h2 className="text-xl font-bold mt-1">{product.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{product.description}</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {/* Audience */}
                <div className="rounded-xl bg-secondary/40 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-primary" />
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Для кого</p>
                  </div>
                  <p className="text-xs leading-relaxed text-foreground">{info?.audience}</p>
                </div>

                {/* Use cases */}
                <div className="rounded-xl bg-secondary/40 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="h-4 w-4 text-primary" />
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Что можно делать</p>
                  </div>
                  <ul className="space-y-2">
                    {info?.useCases.map((uc) => (
                      <li key={uc} className="flex items-start gap-2 text-xs leading-relaxed">
                        <Check className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                        {uc}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Highlights */}
                <div className="rounded-xl bg-secondary/40 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Преимущества</p>
                  </div>
                  <ul className="space-y-2">
                    {info?.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2 text-xs leading-relaxed">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0 mt-0.5">
                          <Check className="h-2.5 w-2.5" />
                        </span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Features */}
              <div className="mt-5 flex flex-wrap gap-2">
                {product.features.map((f) => (
                  <Badge key={f} variant="outline" className="border-primary/20 bg-primary/5 text-primary text-[10px]">
                    {f}
                  </Badge>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between">
                <p className="text-lg font-bold">
                  от {product.priceRub.toLocaleString("ru-RU")} ₽
                  <span className="text-sm text-muted-foreground font-normal"> / мес</span>
                </p>
                <a
                  href="/dashboard/subscriptions"
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Перейти к покупке →
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
