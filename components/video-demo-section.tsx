"use client"

import { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Play, Pause, Maximize, Eye } from "lucide-react"

export function VideoDemoSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (videoRef.current) {
            videoRef.current.play().catch(() => {
            })
          }
        } else {
          if (videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause()
          }
        }
      },
      { threshold: 0.3 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      }
    }
  }

  return (
    <section ref={sectionRef} className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/10 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-blue-500/10 rounded-full blur-lg animate-bounce" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div
          className={cn(
            "text-center mb-12 transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <Badge
            variant="outline"
            className={cn(
              "mb-4 border-primary/30 text-primary bg-primary/5 transition-all duration-500 delay-100",
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
            )}
          >
            <Eye className="w-4 h-4 mr-2" />
            Демонстрация
          </Badge>

          <h2
            className={cn(
              "text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-balance transition-all duration-700 delay-200",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <span className="gradient-text">ScoutScope</span> в действии
          </h2>

          <p
            className={cn(
              "text-muted-foreground text-lg max-w-2xl mx-auto text-pretty transition-all duration-700 delay-300",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            Посмотрите, как наша AI-платформа революционизирует процесс скаутинга в киберспорте
          </p>
        </div>

        <div
          className={cn(
            "max-w-5xl mx-auto transition-all duration-1000 delay-500",
            isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-95"
          )}
        >
          <div
            className="relative group rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 p-1"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-75 blur-sm group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative bg-background rounded-3xl overflow-hidden">
              <div className="aspect-video relative">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                >
                  <source src="https://storage.yandexcloud.net/file-talentio/0110.mp4" type="video/mp4" />
                  Ваш браузер не поддерживает видео.
                </video>

                <div
                  className={cn(
                    "absolute inset-0 bg-black/20 flex items-center justify-center transition-all duration-300",
                    showControls || !isPlaying ? "opacity-100" : "opacity-0"
                  )}
                >
                  <button
                    onClick={togglePlay}
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-6 rounded-full transition-all duration-300 hover:scale-110"
                  >
                    {isPlaying ? (
                      <Pause className="h-8 w-8" />
                    ) : (
                      <Play className="h-8 w-8 ml-1" />
                    )}
                  </button>
                </div>

                <div
                  className={cn(
                    "absolute top-4 right-4 flex gap-2 transition-all duration-300",
                    showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                  )}
                >
                  <button
                    onClick={toggleFullscreen}
                    className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-all duration-300"
                  >
                    <Maximize className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "mt-8 grid md:grid-cols-3 gap-6 transition-all duration-1000 delay-700",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            {[
              {
                title: "Автоматический анализ",
                description: "AI анализирует матчи и выдает рекомендации по игрокам"
              },
              {
                title: "Детальная статистика",
                description: "Полная аналитика по всем ключевым показателям игрока"
              },
              {
                title: "Быстрый поиск",
                description: "Находите талантливых игроков за считанные минуты"
              }
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="text-center p-6 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-all duration-300 hover:scale-105"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}