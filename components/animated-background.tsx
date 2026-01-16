"use client"

import { useEffect, useRef } from "react"

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resize()
    window.addEventListener("resize", resize)

    // Particles
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
      hue: number
    }> = []

    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        size: Math.random() * 4 + 2,
        opacity: Math.random() * 0.3 + 0.2,
        hue: Math.random() * 30 + 220, // Blue range for light theme
      })
    }

    let animationId: number

    const animate = () => {
      // Светлый фон с легким затемнением для trail эффекта
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        // Draw particle as square with blue tones for light theme
        ctx.fillStyle = `hsla(${p.hue}, 50%, 55%, ${p.opacity})`
        ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size)

        // Add subtle glow to square
        ctx.shadowColor = `hsla(${p.hue}, 50%, 55%, ${p.opacity * 0.3})`
        ctx.shadowBlur = 6
        ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size)
        ctx.shadowBlur = 0

        // Draw connections
        particles.forEach((p2, j) => {
          if (i === j) return

          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `hsla(${p.hue}, 30%, 60%, ${0.05 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.4 }}
    />
  )
}