"use client"

import { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Search, Bot, BarChart3, TrendingUp, ChevronLeft, ChevronRight, X } from "lucide-react"

const CASE_SLIDE_INTERVAL_MS = 3000

const cases = [
  {
    title: "ScoutScope",
    description: "Платформа для автоматизированного скаутинга игроков",
    problem: "Ручной поиск талантов занимал дни работы скаутов",
    solution: "AI-система анализа матчей и рейтингов с автоматическими рекомендациями",
    result: "x5 ускорение процесса скаутинга",
    icon: Search,
    tags: ["AI", "Аналитика", "Скаутинг"],
    images: [
      "https://storage.yandexcloud.net/file-talentio/scout1.png",
      "https://storage.yandexcloud.net/file-talentio/scout2.png",
      "https://storage.yandexcloud.net/file-talentio/scout3.png",
      "https://storage.yandexcloud.net/file-talentio/scout4.png"
    ],
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "PerformanceCoach CRM",
    description: "CRM-система для управления киберспортивной командой",
    problem: "Разрозненные данные о тренировках и результатах",
    solution: "Централизованная система с дашбордами и аналитикой",
    result: "40% рост эффективности тренировок",
    icon: BarChart3,
    tags: ["CRM", "Дашборды", "Менеджмент"],
    images: [
      "https://storage.yandexcloud.net/file-talentio/CRM.png",
      "https://storage.yandexcloud.net/file-talentio/CRM2.png",
      "https://storage.yandexcloud.net/file-talentio/CRM3.png",
      "https://storage.yandexcloud.net/file-talentio/CRM4.png",
      "https://storage.yandexcloud.net/file-talentio/CRM5.png",
      "https://storage.yandexcloud.net/file-talentio/CRm6.png",
    ],
    color: "from-blue-600 to-indigo-600",
  },
  {
    title: "CIS FINDER BOT",
    description: "Telegram-бот для поиска игроков в СНГ регионе",
    problem: "Сложность коммуникации со скаутами разных команд",
    solution: "Единая платформа с интеграцией FaceIT API и уведомлениями",
    result: "300+ активных пользователей за месяц",
    icon: Bot,
    tags: ["Telegram", "FaceIT", "Боты"],
    images: [
      "https://storage.yandexcloud.net/file-talentio/bot.jpg",
    ],
    color: "from-indigo-500 to-blue-500",
  },
]

export function CasesSection() {
  const [visibleCards, setVisibleCards] = useState<number[]>([])
  const [headerVisible, setHeaderVisible] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: number]: number }>({})
  const [fullscreenImage, setFullscreenImage] = useState<{ caseIndex: number; imageIndex: number } | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cardIndex = Number(entry.target.getAttribute("data-index"))
            setVisibleCards((prev) => (prev.includes(cardIndex) ? prev : [...prev, cardIndex]))
          }
        })
      },
      { threshold: 0.2 },
    )

    const headerObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true)
        }
      },
      { threshold: 0.3 },
    )

    const cards = sectionRef.current?.querySelectorAll("[data-index]")
    cards?.forEach((card) => observer.observe(card))

    if (headerRef.current) {
      headerObserver.observe(headerRef.current)
    }

    return () => {
      observer.disconnect()
      headerObserver.disconnect()
    }
  }, [])

  const nextImage = (caseIndex: number) => {
    setCurrentImageIndex(prev => {
      const currentIndex = prev[caseIndex] || 0
      const nextIndex = (currentIndex + 1) % cases[caseIndex].images.length
      return { ...prev, [caseIndex]: nextIndex }
    })
  }

  const prevImage = (caseIndex: number) => {
    setCurrentImageIndex(prev => {
      const currentIndex = prev[caseIndex] || 0
      const prevIndex = currentIndex === 0 ? cases[caseIndex].images.length - 1 : currentIndex - 1
      return { ...prev, [caseIndex]: prevIndex }
    })
  }

  const openFullscreen = (caseIndex: number, imageIndex: number) => {
    setFullscreenImage({ caseIndex, imageIndex })
  }

  const closeFullscreen = () => {
    setFullscreenImage(null)
  }

  const nextFullscreenImage = () => {
    if (!fullscreenImage) return
    const { caseIndex } = fullscreenImage
    const nextIndex = (fullscreenImage.imageIndex + 1) % cases[caseIndex].images.length
    setFullscreenImage({ caseIndex, imageIndex: nextIndex })
  }

  const prevFullscreenImage = () => {
    if (!fullscreenImage) return
    const { caseIndex } = fullscreenImage
    const prevIndex = fullscreenImage.imageIndex === 0 ? cases[caseIndex].images.length - 1 : fullscreenImage.imageIndex - 1
    setFullscreenImage({ caseIndex, imageIndex: prevIndex })
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!fullscreenImage) return

      switch (e.key) {
        case 'Escape':
          closeFullscreen()
          break
        case 'ArrowLeft':
          prevFullscreenImage()
          break
        case 'ArrowRight':
          nextFullscreenImage()
          break
      }
    }

    if (fullscreenImage) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [fullscreenImage])
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => {
        const newIndex = { ...prev }
        cases.forEach((caseItem, caseIndex) => {
          if (caseItem.images.length > 1) {
            const currentIndex = prev[caseIndex] || 0
            newIndex[caseIndex] = (currentIndex + 1) % caseItem.images.length
          }
        })
        return newIndex
      })
    }, CASE_SLIDE_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [])

  return (
    <section id="cases" ref={sectionRef} className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />

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
            Наши проекты
          </Badge>
          <h2
            className={cn(
              "text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-balance transition-all duration-700 delay-200",
              headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            <span className="gradient-text">Кейсы</span>
          </h2>
          <p
            className={cn(
              "text-muted-foreground text-lg max-w-2xl mx-auto text-pretty transition-all duration-700 delay-300",
              headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            Решения, которые помогают киберспортивным организациям достигать новых высот
          </p>
        </div>

        <div className="space-y-8 max-w-6xl mx-auto">
          {cases.map((caseItem, index) => {
            const isVisible = visibleCards.includes(index)
            const isReverse = index % 2 === 1

            return (
              <div
                key={caseItem.title}
                data-index={index}
                className={cn(
                  "group grid md:grid-cols-2 gap-6 lg:gap-10 items-center transition-all duration-700",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12",
                  isReverse && "md:direction-rtl",
                )}
                style={{ transitionDelay: `${index * 200}ms` }}
              >

                <div className={cn("relative rounded-3xl bg-secondary/50 p-6", isReverse && "md:order-2 md:direction-ltr")}>
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden relative bg-background/20">
                    {caseItem.images.map((image, imgIndex) => {
                      const currentIndex = currentImageIndex[index] || 0
                      const isActive = imgIndex === currentIndex

                      return (
                        <div
                          key={imgIndex}
                          className={cn(
                            "absolute inset-0 transition-all duration-1000",
                            isActive ? "opacity-100" : "opacity-0"
                          )}
                        >
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`${caseItem.title} - background`}
                            className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 transition-all duration-1000"
                          />

                          <img
                            src={image || "/placeholder.svg"}
                            alt={`${caseItem.title} - ${imgIndex + 1}`}
                            className="absolute inset-0 w-full h-full object-contain transition-all duration-1000 z-10 cursor-pointer"
                            onClick={() => openFullscreen(index, imgIndex)}
                          />
                        </div>
                      )
                    })}

                    {caseItem.images.length > 1 && (
                      <>
                        <button
                          onClick={() => prevImage(index)}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => nextImage(index)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>

                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                          {caseItem.images.map((_, imgIndex) => {
                            const currentIndex = currentImageIndex[index] || 0
                            const isActive = imgIndex === currentIndex

                            return (
                              <button
                                key={imgIndex}
                                onClick={() => setCurrentImageIndex(prev => ({ ...prev, [index]: imgIndex }))}
                                className={cn(
                                  "w-2 h-2 rounded-full transition-all duration-300",
                                  isActive ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"
                                )}
                              />
                            )
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className={cn("space-y-5", isReverse && "md:order-1 md:direction-ltr md:text-right")}>
                  <div className={cn("flex flex-wrap gap-2", isReverse && "md:justify-end")}>
                    {caseItem.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-primary/5 text-primary border-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {caseItem.title}
                  </h3>

                  <p className="text-muted-foreground text-lg">{caseItem.description}</p>

                  <div className="space-y-3 text-sm">
                    <div className={cn("flex items-start gap-3", isReverse && "md:flex-row-reverse")}>
                      <span className="text-red-500 font-semibold shrink-0 w-20">Проблема</span>
                      <span className="text-muted-foreground">{caseItem.problem}</span>
                    </div>
                    <div className={cn("flex items-start gap-3", isReverse && "md:flex-row-reverse")}>
                      <span className="text-primary font-semibold shrink-0 w-20">Решение</span>
                      <span className="text-muted-foreground">{caseItem.solution}</span>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20",
                      isReverse && "md:ml-auto",
                    )}
                  >
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span className="font-bold text-foreground">{caseItem.result}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {fullscreenImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={closeFullscreen}
        >
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <button
              onClick={closeFullscreen}
              className="absolute top-4 right-4 z-60 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300"
            >
              <X className="h-6 w-6" />
            </button>

            {cases[fullscreenImage.caseIndex].images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    prevFullscreenImage()
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-60 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    nextFullscreenImage()
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-60 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <img
              src={cases[fullscreenImage.caseIndex].images[fullscreenImage.imageIndex] || "/placeholder.svg"}
              alt={`${cases[fullscreenImage.caseIndex].title} - ${fullscreenImage.imageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {cases[fullscreenImage.caseIndex].images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3 z-60">
                {cases[fullscreenImage.caseIndex].images.map((_, imgIndex) => {
                  const isActive = imgIndex === fullscreenImage.imageIndex

                  return (
                    <button
                      key={imgIndex}
                      onClick={(e) => {
                        e.stopPropagation()
                        setFullscreenImage({ caseIndex: fullscreenImage.caseIndex, imageIndex: imgIndex })
                      }}
                      className={cn(
                        "w-3 h-3 rounded-full transition-all duration-300",
                        isActive ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"
                      )}
                    />
                  )
                })}
              </div>
            )}

            <div className="absolute bottom-4 left-4 text-white/80 text-sm">
              {fullscreenImage.imageIndex + 1} / {cases[fullscreenImage.caseIndex].images.length}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
