"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { TwizzLogo } from "./twizz-logo"
import { ChevronRight, Sparkles, Zap, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"

export function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [displayedText, setDisplayedText] = useState("")
  const fullText = "Разработка ПО для киберспортивных команд"
  const typingRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setIsLoaded(true)

    let currentIndex = 0
    const typeNextChar = () => {
      if (currentIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex + 1))
        currentIndex++
        typingRef.current = setTimeout(typeNextChar, 50)
      }
    }

    const startTimeout = setTimeout(() => {
      typeNextChar()
    }, 800)

    return () => {
      clearTimeout(startTimeout)
      if (typingRef.current) {
        clearTimeout(typingRef.current)
      }
    }
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient blobs */}
        <div className="absolute top-20 -left-20 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-blob" />
        <div
          className="absolute bottom-20 -right-20 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px] animate-blob"
          style={{ animationDelay: "-3s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-chart-3/10 rounded-full blur-[120px] animate-pulse-soft" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(oklch(0.55 0.22 250) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Grid pattern квадратики */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
          {/* Left side - Text content */}
          <div className="order-2 lg:order-1">
            <div
              className={cn(
                "transition-all duration-700 delay-200",
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
              )}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                Киберспортивные решения
              </span>
            </div>

            {/* Убираем заголовок, оставляем только логотип */}

            {/* Typewriter Text */}
            <div className="min-h-[2.5rem] md:min-h-[3rem] mb-4">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                {displayedText}
                <span className="inline-block w-0.5 h-5 md:h-6 bg-primary ml-1 animate-pulse" />
              </h2>
            </div>

            <p
              className={cn(
                "text-muted-foreground text-lg max-w-xl mb-8 transition-all duration-700 delay-500 leading-relaxed",
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
              )}
            >
              Автоматизация скаутинга, аналитика, дашборды. Помогаем киберспортивным организациям побеждать.
            </p>

            <div
              className={cn(
                "flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-700",
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
              )}
            >
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 group shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
              >
                <a href="#cases">
                  <span className="flex items-center">
                    Кейсы
                    <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary/30 px-8 bg-transparent cursor-pointer"
              >
                <a href="#pricing" className="flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-primary" />
                  Цены
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary/30 px-8 bg-transparent cursor-pointer"
              >
                <a href="#contact">Связаться</a>
              </Button>
            </div>
          </div>

          {/* Right side - Logo & Stats */}
          <div className="order-1 lg:order-2 flex flex-col items-center">
            <div
              className={cn(
                "mb-8 transition-all duration-1000",
                isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-90",
              )}
            >
              <div className="relative group">
                <TwizzLogo className="h-48 w-auto md:h-64 md:w-auto lg:h-80 lg:w-auto animate-float drop-shadow-2xl" />
                <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full -z-10 group-hover:bg-primary/30 transition-all duration-500" />
              </div>
            </div>

            {/* Stats in bento grid */}
            <div
              className={cn(
                "grid grid-cols-3 gap-4 w-full max-w-md transition-all duration-700 delay-[900ms]",
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
              )}
            >
              {[
                { value: "5x", label: "Ускорение" },
                { value: "10+", label: "Проектов" },
                { value: "24/7", label: "Поддержка" },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className="text-center p-4 md:p-5 glass-strong rounded-2xl hover:shadow-lg hover:shadow-primary/10 transition-all hover:-translate-y-1 cursor-default"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <p className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</p>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <a
          href="#cases"
          className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <span className="text-sm font-medium">Листайте вниз</span>
          <ArrowDown className="h-5 w-5 animate-bounce" />
        </a>
      </div>
    </section>
  )
}
