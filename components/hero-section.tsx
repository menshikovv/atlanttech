"use client"

import { useEffect, useState, useRef } from "react"
import { AtlantLogo } from "./twizz-logo"
import { Sparkles, ArrowUpRight, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

// Логотипы партнёров переиспользуются из секции "Партнеры" ниже на странице.
const trustedLogos = [
  { name: "Contur", src: "/contur.svg" },
  { name: "Partner 1", src: "/rstu.png" },
  { name: "Partner 2", src: "/overwolf.png" },
  { name: "Part 1", src: "/part1.svg" },
  { name: "Part 2", src: "/part2.svg" },
]

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
    <section
      className="relative min-h-screen overflow-hidden bg-white pt-28 md:pt-32 pb-16"
      style={{ WebkitFontSmoothing: "antialiased" }}
    >
      {/* ─── Layered gradient glow (top-left) ─── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -left-40 h-[640px] w-[640px] rounded-full blur-[140px]"
          style={{ background: "radial-gradient(circle, #60B1FF 0%, rgba(96,177,255,0) 70%)", opacity: 0.55 }}
        />
        <div
          className="absolute top-10 left-1/4 h-[460px] w-[460px] rounded-full blur-[150px]"
          style={{ background: "radial-gradient(circle, #319AFF 0%, rgba(49,154,255,0) 70%)", opacity: 0.4 }}
        />
        <div
          className="absolute -bottom-32 right-0 h-[420px] w-[420px] rounded-full blur-[160px]"
          style={{ background: "radial-gradient(circle, #60B1FF 0%, rgba(96,177,255,0) 70%)", opacity: 0.28 }}
        />
      </div>

      {/* ─── Main container ─── */}
      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-5 md:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
          {/* ── Left: content ── */}
          <div className="order-2 lg:order-1">

            {/* Headline */}
            <h1
              className="mt-6 max-w-2xl font-bold text-[#0A0A0A]"
              style={{
                fontSize: "clamp(34px, 4.6vw, 58px)",
                lineHeight: 1.05,
                letterSpacing: "-1.5px",
              }}
            >
              <span>
                {displayedText}
                <span className="ml-1 inline-block h-[0.9em] w-[3px] translate-y-[0.12em] animate-pulse bg-[#0084FF] align-baseline" />
              </span>
            </h1>

            {/* Subheadline */}
            <p
              className={cn(
                "mt-6 max-w-xl text-lg leading-relaxed text-[#444]",
                "transition-all duration-700 delay-500",
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
              )}
              style={{ letterSpacing: "-0.5px" }}
            >
              Автоматизация скаутинга, аналитика, дашборды. Помогаем киберспортивным организациям побеждать.
            </p>

            {/* CTAs */}
            <div
              className={cn(
                "mt-9 flex flex-col gap-4 sm:flex-row sm:items-center",
                "transition-all duration-700 delay-700",
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
              )}
            >
              {/* Primary glassy CTA */}
              <a
                href="#cases"
                className="group inline-flex items-center justify-between gap-3 rounded-[16px] py-3 pl-6 pr-3 text-white transition-transform duration-300 hover:scale-[1.02]"
                style={{
                  background: "rgba(0,132,255,0.85)",
                  backdropFilter: "blur(2px)",
                  boxShadow:
                    "inset 0px 4px 4px 0px rgba(255,255,255,0.35), 0 10px 30px rgba(0,132,255,0.35)",
                }}
              >
                <span className="text-base font-medium">Кейсы</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0084FF]">
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </a>

              {/* Secondary glassy buttons */}
              <a
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 rounded-[16px] px-6 py-3 text-base font-medium text-[#0A0A0A] transition-transform duration-300 hover:scale-[1.02]"
                style={{
                  background: "rgba(255,255,255,0.4)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(0,0,0,0.1)",
                  boxShadow: "inset 0px 4px 4px 0px rgba(255,255,255,0.25)",
                }}
              >
                <Zap className="h-5 w-5 text-[#0084FF]" />
                Цены
              </a>
              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-[16px] px-6 py-3 text-base font-medium text-[#0A0A0A] transition-transform duration-300 hover:scale-[1.02]"
                style={{
                  background: "rgba(255,255,255,0.4)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(0,0,0,0.1)",
                  boxShadow: "inset 0px 4px 4px 0px rgba(255,255,255,0.25)",
                }}
              >
                Связаться
              </a>
            </div>

            {/* Stats */}
            <div
              className={cn(
                "mt-12 grid max-w-md grid-cols-3 gap-4 transition-all duration-700 delay-[900ms]",
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
              )}
            >
              {[
                { value: "x5", label: "Ускорение" },
                { value: "10+", label: "Проектов" },
                { value: "24/7", label: "Поддержка" },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className="rounded-2xl px-4 py-4 text-center transition-all hover:-translate-y-1"
                  style={{
                    background: "rgba(255,255,255,0.5)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(0,0,0,0.06)",
                    boxShadow: "inset 0px 4px 4px 0px rgba(255,255,255,0.3)",
                    transitionDelay: `${index * 100}ms`,
                  }}
                >
                  <p className="text-2xl font-bold text-[#0084FF] md:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-xs text-[#666] md:text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: glassy orb with Atlant logo ── */}
          <div className="order-1 flex justify-center lg:order-2">
            <div
              className={cn(
                "relative flex items-center justify-center transition-all duration-1000",
                isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-90",
              )}
            >
              {/* Orb glow */}
              <div
                className="absolute h-[400px] w-[400px] rounded-full blur-[70px] md:h-[540px] md:w-[540px]"
                style={{ background: "radial-gradient(circle, #319AFF 0%, rgba(96,177,255,0) 70%)", opacity: 0.6 }}
              />
              {/* Glass sphere */}
              <div
                className="relative flex h-[340px] w-[340px] items-center justify-center rounded-full md:h-[480px] md:w-[480px]"
                style={{
                  background:
                    "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.7) 0%, rgba(96,177,255,0.25) 45%, rgba(49,154,255,0.15) 100%)",
                  backdropFilter: "blur(30px)",
                  border: "1px solid rgba(255,255,255,0.6)",
                  boxShadow:
                    "inset 0px 8px 24px 0px rgba(255,255,255,0.45), 0 30px 80px rgba(0,132,255,0.25)",
                }}
              >
                <AtlantLogo className="h-60 w-auto animate-float drop-shadow-2xl md:h-80 md:w-auto" />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Trusted-by logos ─── */}
        <div
          className={cn(
            "mt-16 transition-all duration-700 delay-[1100ms] md:mt-24",
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
        >
          <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-[#888]">
            Нам доверяют ведущие компании
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-8 md:gap-x-[64px] lg:gap-x-[100px]">
            {trustedLogos.map((logo) => (
              <img
                key={logo.name}
                src={logo.src}
                alt={logo.name}
                className="h-14 w-auto max-w-[200px] object-contain opacity-50 grayscale transition-all duration-300 hover:opacity-90 hover:grayscale-0 md:h-20"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
