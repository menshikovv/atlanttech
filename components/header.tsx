"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AtlantLogo } from "./twizz-logo"
import { Menu, X, ArrowUpRight, LogIn } from "lucide-react"
import { cn } from "@/lib/utils"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Плавное появление навбара слева направо при загрузке/обновлении страницы.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isMobileMenuOpen && !target.closest('[data-mobile-menu]')) {
        handleCloseMenu()
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const handleOpenMenu = () => {
    setIsMobileMenuOpen(true)
    setTimeout(() => {
      setIsAnimating(true)
    }, 10)
  }

  const handleCloseMenu = () => {
    setIsAnimating(false)
    setTimeout(() => {
      setIsMobileMenuOpen(false)
    }, 300)
  }

  const navLinks = [
    { href: "#cases", label: "Кейсы" },
    { href: "#pricing", label: "Цены" },
    { href: "#contact", label: "Контакты" },
    { href: "#faq", label: "FAQ" },
  ]

  return (
    <>
      <header className="fixed top-[18px] md:top-[30px] left-1/2 z-50 w-fit max-w-[calc(100%-1.5rem)] -translate-x-1/2">
        <div
          className="flex items-center gap-2 rounded-[16px] py-2 pl-3 pr-2 md:gap-6 md:pl-5 md:pr-3"
          style={{
            background: "rgba(255,255,255,0.3)",
            backdropFilter: "blur(50px)",
            WebkitBackdropFilter: "blur(50px)",
            border: "1px solid rgba(0,0,0,0.1)",
            boxShadow: isScrolled
              ? "inset 0px 4px 4px 0px rgba(255,255,255,0.25), 0 12px 40px rgba(0,132,255,0.18)"
              : "inset 0px 4px 4px 0px rgba(255,255,255,0.25), 0 8px 30px rgba(0,0,0,0.08)",
            clipPath: mounted ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateX(0)" : "translateX(-16px)",
            transition:
              "clip-path 2.8s cubic-bezier(0.22,1,0.36,1), transform 2.8s cubic-bezier(0.22,1,0.36,1), opacity 1.8s ease, box-shadow 0.5s ease",
          }}
        >
          {/* Logo */}
          <a href="#" className="flex shrink-0 items-center gap-2">
            <AtlantLogo variant="icon" className="h-8 w-auto md:h-9 md:w-auto" />
            <span className="hidden text-base font-bold tracking-tight text-[#0A0A0A] sm:block">Atlant</span>
          </a>

          {/* Nav links */}
          <nav className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[#444] transition-colors hover:text-[#0084FF]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Войти button (glassy) */}
          <a
            href="/auth/login"
            className="hidden items-center gap-2 rounded-[12px] py-2 pl-4 pr-2 text-sm font-medium text-white transition-transform duration-300 hover:scale-[1.03] md:inline-flex"
            style={{
              background: "rgba(0,132,255,0.85)",
              backdropFilter: "blur(2px)",
              boxShadow: "inset 0px 4px 4px 0px rgba(255,255,255,0.35), 0 8px 22px rgba(0,132,255,0.3)",
            }}
          >
            Войти
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#0084FF]">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </a>

          {/* Mobile burger */}
          <button
            className="z-60 rounded-[12px] p-2 text-[#0A0A0A] transition-colors hover:bg-white/40 md:hidden"
            onClick={() => (isMobileMenuOpen ? handleCloseMenu() : handleOpenMenu())}
            aria-label="Toggle menu"
            data-mobile-menu
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className={cn(
              "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
              isAnimating ? "opacity-100" : "opacity-0"
            )}
            onClick={handleCloseMenu}
          />
          
          <div 
            className={cn(
              "absolute top-[84px] right-4 left-4 bg-card rounded-2xl border border-border shadow-2xl overflow-hidden",
              "transform transition-all duration-300 ease-out",
              isAnimating 
                ? "translate-y-0 opacity-100 scale-100" 
                : "-translate-y-4 opacity-0 scale-95"
            )}
            data-mobile-menu
          >
            <nav className="flex flex-col">
              {navLinks.map((link, index) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-foreground hover:text-primary hover:bg-secondary/50 transition-all font-medium py-4 px-6 border-b border-border/50",
                    "transform transition-all duration-300 ease-out",
                    isAnimating 
                      ? "translate-x-0 opacity-100" 
                      : "translate-x-4 opacity-0"
                  )}
                  style={{ 
                    transitionDelay: isAnimating ? `${(index + 1) * 100}ms` : '0ms'
                  }}
                  onClick={handleCloseMenu}
                >
                  {link.label}
                </a>
              ))}
              <div 
                className={cn(
                  "p-4 transform transition-all duration-300 ease-out",
                  isAnimating 
                    ? "translate-y-0 opacity-100" 
                    : "translate-y-4 opacity-0"
                )}
                style={{ 
                  transitionDelay: isAnimating ? `${(navLinks.length + 1) * 100}ms` : '0ms'
                }}
              >
                <div className="flex gap-2">
                  <Button
                    asChild
                    variant="outline"
                    className="flex-1 border-primary/30 text-primary"
                    onClick={handleCloseMenu}
                  >
                    <a href="/auth/login">
                      <LogIn className="mr-1 h-4 w-4" />
                      Войти
                    </a>
                  </Button>
                  <Button
                    asChild
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={handleCloseMenu}
                  >
                    <a href="#contact">Связаться</a>
                  </Button>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
