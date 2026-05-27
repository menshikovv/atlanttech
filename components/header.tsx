"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AtlantLogo } from "./twizz-logo"
import { Menu, X, LogIn } from "lucide-react"
import { cn } from "@/lib/utils"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
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
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled ? "bg-white/80 backdrop-blur-lg shadow-sm border-b border-border/50" : "bg-transparent",
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center">
              <a href="#" className="flex items-center">
                <AtlantLogo variant="icon" className="h-8 w-auto md:h-10 md:w-auto" />
              </a>
            </div>
            
            <nav className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground hover:text-primary transition-colors font-medium relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                </a>
              ))}
              <Button
                asChild
                variant="outline"
                className="border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all"
              >
                <a href="#contact">Связаться</a>
              </Button>
            </nav>

            <div className="hidden md:flex items-center">
              <Button
                asChild
                variant="outline"
                className="border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all gap-2"
              >
                <a href="/auth/login">
                  <LogIn className="h-4 w-4" />
                  Войти
                </a>
              </Button>
            </div>

            <button
              className="md:hidden p-2 text-foreground rounded-lg hover:bg-secondary transition-colors z-60"
              onClick={() => isMobileMenuOpen ? handleCloseMenu() : handleOpenMenu()}
              aria-label="Toggle menu"
              data-mobile-menu
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
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
              "absolute top-16 right-4 left-4 bg-card rounded-2xl border border-border shadow-2xl overflow-hidden",
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
