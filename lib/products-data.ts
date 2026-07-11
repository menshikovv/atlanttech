export type ProductData = {
  id: string
  tag: string
  name: string
  description: string
  forWhom: string
  priceRub: number
  priceUsd: number
  benefits: string[]
  features: string[]
  icon: string
  popular?: boolean
}

export const productsData: ProductData[] = [
  {
    id: "scoutscope-basic",
    tag: "СТАНДАРТНАЯ ВЕРСИЯ",
    name: "ScoutScope Basic",
    description: "Базовая scouting-система для структурного поиска кандидатов и ведения общей базы просмотров.",
    forWhom: "Для скаутов и аналитиков",
    priceRub: 19990,
    priceUsd: 250,
    icon: "Target",
    benefits: [
      "Структурированный поиск кандидатов",
      "Удобные карточки для сравнения",
      "Автоматическое обновление базы",
    ],
    features: [
      "Воронка скаутинга",
      "Карточки кандидатов",
      "Сравнение до 3 игроков",
      "Обновление базы раз в 24 часа",
    ],
  },
  {
    id: "scoutscope-pro",
    tag: "РАСШИРЕННАЯ ВЕРСИЯ",
    name: "ScoutScope Pro",
    description: "Продвинутый пакет с обновлением базы раз в 12 часов и расширенными возможностями анализа.",
    forWhom: "Для профессиональных скаутинговых отделов",
    priceRub: 31990,
    priceUsd: 399,
    popular: true,
    icon: "Shield",
    benefits: [
      "Ускоренное обновление данных",
      "Расширенная аналитика кандидатов",
      "Приоритетная поддержка",
    ],
    features: [
      "Воронка скаутинга",
      "Карточки кандидатов",
      "Сравнение до 3 игроков",
      "Обновление базы раз в 12 часов",
    ],
  },
  {
    id: "performancecoach-scoutscope",
    tag: "КОМПЛЕКСНОЕ РЕШЕНИЕ",
    name: "PerformanceCoach CRM + ScoutScope",
    description: "Pro-версия ScoutScope и полная версия PerformanceCoach CRM в одном решении для команды.",
    forWhom: "Для команд с полным циклом работы",
    priceRub: 43990,
    priceUsd: 550,
    icon: "Layers",
    benefits: [
      "Единое решение для всех задач",
      "Сквозной процесс от скаутинга до работы с командой",
      "Максимальная экономия на комплекте",
    ],
    features: [
      "Полная версия PerformanceCoach CRM",
      "Pro-версия ScoutScope",
      "Сквозной процесс для команды",
    ],
  },
]

export const tariffs = [
  { label: "1 мес.", months: 1, discount: 0 },
  { label: "3 мес.", months: 3, discount: 0.1 },
  { label: "6 мес.", months: 6, discount: 0.15 },
] as const
