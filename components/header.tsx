"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { href: "#cases", label: "Кейсы" },
    { href: "#pricing", label: "Цены" },
    { href: "#contact", label: "Контакты" },
    { href: "#faq", label: "FAQ" },
  ]

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled ? "bg-white/80 backdrop-blur-lg shadow-sm border-b border-border/50" : "bg-transparent",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center h-16 md:h-20">
          {/* Desktop Navigation - по центру */}
          <nav className="hidden md:flex items-center gap-8">
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

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300",
            isMobileMenuOpen ? "max-h-64 pb-4" : "max-h-0",
          )}
        >
          <nav className="flex flex-col gap-2 bg-card rounded-2xl p-4 mt-2 border border-border shadow-lg">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-primary transition-colors font-medium py-2 px-3 rounded-lg hover:bg-secondary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Button 
              asChild 
              variant="outline"
              className="border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 hover:border-primary/50 w-full mt-2"
            >
              <a href="#contact">Связаться</a>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
