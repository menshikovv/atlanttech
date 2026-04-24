"use client"

import { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const partners = [
  {
    name: "Contur",
    src: "/contur.svg",
  },
  {
    name: "Partner 1",
    src: "https://s10.iimage.su/s/24/gzeCTvDxbv80nVK0Ba1VArFlViy4ShVaikKv97na9.png",
  },
  {
    name: "Partner 2",
    src: "https://s10.iimage.su/s/24/gfzlOLNxR7fzYbSlkZQzM0ZfmfDBlluqvmEiPvukc.png",
  },
  {
    name: "Part 1",
    src: "/part1.svg",
  },
  {
    name: "Part 2",
    src: "/part2.svg",
  },
]

export function PartnersSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section id="partners" ref={sectionRef} className="py-20 md:py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        <div
          className={cn(
            "text-center mb-12 transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          )}
        >
          <Badge
            variant="outline"
            className={cn(
              "mb-4 border-primary/30 text-primary bg-primary/5 transition-all duration-500 delay-100",
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90",
            )}
          >
            Нам доверяют
          </Badge>
          <h2
            className={cn(
              "text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-balance transition-all duration-700 delay-200",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            <span className="gradient-text">Партнеры</span>
          </h2>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {partners.map((partner, index) => (
              <div
                key={partner.name}
                className={cn(
                  "group rounded-3xl border border-white/10 bg-secondary/40 backdrop-blur-sm px-6 py-8 md:px-8 md:py-10 flex items-center justify-center min-h-[160px] md:min-h-[188px] transition-all duration-700",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
                )}
                style={{ transitionDelay: `${150 + index * 80}ms` }}
              >
                <img
                  src={partner.src}
                  alt={partner.name}
                  className="max-h-20 md:max-h-24 w-full object-contain opacity-85 group-hover:opacity-100 transition-opacity duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
