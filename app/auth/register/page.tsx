"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { AtlantLogo } from "@/components/twizz-logo"
import { Eye, EyeOff, UserPlus } from "lucide-react"

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [agreedPrivacy, setAgreedPrivacy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!name || !email || !password || !confirmPassword) {
      setError("Заполните все поля")
      return
    }
    if (password !== confirmPassword) {
      setError("Пароли не совпадают")
      return
    }
    if (password.length < 6) {
      setError("Пароль должен быть не менее 6 символов")
      return
    }
    if (!agreedTerms || !agreedPrivacy) {
      setError("Необходимо принять оба соглашения")
      return
    }
    setLoading(true)
    setTimeout(() => {
      const ok = register(name, email, password)
      if (ok) {
        router.push("/dashboard")
      } else {
        setError("Пользователь с таким email уже существует")
      }
      setLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <AtlantLogo variant="icon" className="h-10 w-auto mx-auto" />
          </Link>
          <h1 className="mt-6 text-2xl font-bold">Создать аккаунт</h1>
          <p className="mt-2 text-sm text-muted-foreground">Зарегистрируйтесь для доступа к продуктам</p>
        </div>

        <div className="glass-strong rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input
                id="name"
                type="text"
                placeholder="Ваше имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Минимум 6 символов"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary hover:scale-110 active:scale-95 transition-all duration-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Подтверждение пароля</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Повторите пароль"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="agreeTerms"
                  checked={agreedTerms}
                  onCheckedChange={(v) => setAgreedTerms(v === true)}
                  className="mt-0.5 flex-shrink-0"
                />
                <label htmlFor="agreeTerms" className="cursor-pointer leading-relaxed" style={{ fontFamily: "system-ui, -apple-system, sans-serif", fontSize: "12px", color: "var(--muted-foreground)" }}>
                  Принимаю{" "}
                  <Link href="/user-agreement" className="text-primary hover:underline">
                    пользовательское соглашение
                  </Link>
                </label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="agreePrivacy"
                  checked={agreedPrivacy}
                  onCheckedChange={(v) => setAgreedPrivacy(v === true)}
                  className="mt-0.5 flex-shrink-0"
                />
                <label htmlFor="agreePrivacy" className="cursor-pointer leading-relaxed" style={{ fontFamily: "system-ui, -apple-system, sans-serif", fontSize: "12px", color: "var(--muted-foreground)" }}>
                  Принимаю{" "}
                  <Link href="/privacy-policy" className="text-primary hover:underline">
                    политику конфиденциальности
                  </Link>
                </label>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Создание...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Создать аккаунт
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Уже есть аккаунт?{" "}
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                Войти
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
