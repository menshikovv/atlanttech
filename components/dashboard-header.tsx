"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AtlantLogo } from "@/components/twizz-logo"
import { cn } from "@/lib/utils"
import {
  User,
  CreditCard,
  FileText,
  LogOut,
  ChevronDown,
  ChevronRight,
  Shield,
  ScrollText,
  FileCheck,
  RotateCcw,
  BookOpen,
} from "lucide-react"

const documentLinks = [
  { href: "/user-agreement", label: "Пользовательское соглашение", icon: ScrollText },
  { href: "/privacy-policy", label: "Политика конфиденциальности", icon: Shield },
  { href: "/oferta", label: "Оферта", icon: FileCheck },
  { href: "/refund-policy", label: "Возврат средств", icon: RotateCcw },
  { href: "/cookies-policy", label: "Правила использования", icon: BookOpen },
]

export function DashboardHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [docsOpen, setDocsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
        setDocsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center">
            <AtlantLogo variant="icon" className="h-8 w-auto md:h-10 md:w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/dashboard/account"
              className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Аккаунт
            </Link>
            <Link
              href="/dashboard/subscriptions"
              className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Подписки
            </Link>
          </nav>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => {
                setMenuOpen(!menuOpen)
                if (menuOpen) setDocsOpen(false)
              }}
              className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-secondary transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </div>
              <span className="hidden md:block text-sm font-medium max-w-[150px] truncate">
                {user?.name || "Пользователь"}
              </span>
              <ChevronDown
                className={cn("h-4 w-4 text-muted-foreground transition-transform", menuOpen && "rotate-180")}
              />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-border bg-card shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-border bg-secondary/30">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>

                <div className="py-1">
                  <Link
                    href="/dashboard/account"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary/50 transition-colors"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    Аккаунт
                  </Link>
                  <Link
                    href="/dashboard/subscriptions"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary/50 transition-colors"
                  >
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    Подписки
                  </Link>

                  <div>
                    <button
                      onClick={() => setDocsOpen(!docsOpen)}
                      className="flex items-center justify-between w-full gap-3 px-4 py-2.5 text-sm hover:bg-secondary/50 transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        Документы
                      </span>
                      <ChevronRight
                        className={cn("h-4 w-4 text-muted-foreground transition-transform", docsOpen && "rotate-90")}
                      />
                    </button>
                    {docsOpen && (
                      <div className="bg-secondary/20 border-y border-border/50">
                        {documentLinks.map((doc) => (
                          <Link
                            key={doc.href}
                            href={doc.href}
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-3 px-8 py-2 text-xs text-muted-foreground hover:text-primary hover:bg-secondary/50 transition-colors"
                          >
                            <doc.icon className="h-3.5 w-3.5" />
                            {doc.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-border py-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors w-full"
                  >
                    <LogOut className="h-4 w-4" />
                    Выход
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
