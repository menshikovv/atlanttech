"use client"

import { useEffect, useRef } from "react"

const INTERACTIVE_SELECTOR =
  "a, button, [role='button'], input, textarea, select, label, summary, .cursor-pointer"

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    // Кастомный курсор только для мыши/трекпада, на тач-устройствах не нужен.
    if (!window.matchMedia("(pointer: fine)").matches) return

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2
    let ringX = mouseX
    let ringY = mouseY
    let raf = 0

    dot.style.opacity = "0"
    ring.style.opacity = "0"

    const handleMove = (event: MouseEvent) => {
      mouseX = event.clientX
      mouseY = event.clientY
      dot.style.left = `${mouseX}px`
      dot.style.top = `${mouseY}px`
      dot.style.opacity = "1"
      ring.style.opacity = "1"

      const target = event.target as HTMLElement | null
      const interactive = target?.closest(INTERACTIVE_SELECTOR)
      ring.classList.toggle("cursor-ring--active", Boolean(interactive))
    }

    const handleLeave = () => {
      dot.style.opacity = "0"
      ring.style.opacity = "0"
    }

    const handleDown = () => ring.classList.add("cursor-ring--down")
    const handleUp = () => ring.classList.remove("cursor-ring--down")

    const loop = () => {
      ringX += (mouseX - ringX) * 0.2
      ringY += (mouseY - ringY) * 0.2
      ring.style.left = `${ringX}px`
      ring.style.top = `${ringY}px`
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener("mousemove", handleMove)
    document.addEventListener("mouseleave", handleLeave)
    window.addEventListener("mousedown", handleDown)
    window.addEventListener("mouseup", handleUp)
    loop()

    return () => {
      window.removeEventListener("mousemove", handleMove)
      document.removeEventListener("mouseleave", handleLeave)
      window.removeEventListener("mousedown", handleDown)
      window.removeEventListener("mouseup", handleUp)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  )
}
