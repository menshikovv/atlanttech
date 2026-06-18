"use client"

import type { FormEvent } from "react"
import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { fetchPublicTariffs, type SiteTariff } from "@/lib/site-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { AtlantLogo } from "@/components/twizz-logo"
import { Eye, EyeOff, UserPlus } from "lucide-react"

function safeRedirect(value: string | null) {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value
  return "/dashboard/account"
}

function RegisterContent() {
  const { register, ready, user } = useAuth()
  const router = useRouter()
  const params = useSearchParams()
  const redirect = safeRedirect(params.get("redirect"))
  const [login, setLogin] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [tariffs, setTariffs] = useState<SiteTariff[]>([])
  const [tariffCode, setTariffCode] = useState("base")
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [agreedPrivacy, setAgreedPrivacy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (ready && user) {
      router.replace(redirect)
    }
  }, [ready, redirect, router, user])

  useEffect(() => {
    let active = true
    fetchPublicTariffs()
      .then((payload) => {
        if (!active) return
        setTariffs(payload.items || [])
        if (payload.items?.[0]?.code) {
          setTariffCode(payload.items[0].code)
        }
      })
      .catch(() => {
        if (!active) return
        setTariffs([
          { code: "base", title: "ScoutScope Basic", defaultDays: 7, requestWindowHours: 12, maxEloSpan: 500, maxAgeSpan: 3, maxResults: 11000, comparePlayersLimit: 3, unrestricted: false },
          { code: "pro", title: "ScoutScope Pro", defaultDays: 31, requestWindowHours: 0, maxEloSpan: null, maxAgeSpan: null, maxResults: null, comparePlayersLimit: null, unrestricted: true },
        ])
      })

    return () => {
      active = false
    }
  }, [])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError("")

    if (!login || !name || !email || !password || !confirmPassword) {
      setError("Заполните все поля.")
      return
    }
    if (password !== confirmPassword) {
      setError("Пароли не совпадают.")
      return
    }
    if (password.length < 8) {
      setError("Пароль должен быть не короче 8 символов.")
      return
    }
    if (!agreedTerms || !agreedPrivacy) {
      setError("Необходимо принять оба соглашения.")
      return
    }

    setLoading(true)
    const result = await register({
      login,
      name,
      email,
      password,
      tariffCode,
    })
    setLoading(false)

    if (result.ok) {
      router.push(redirect)
      return
    }

    setError(result.error || "Не удалось зарегистрировать пользователя.")
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <AtlantLogo variant="icon" className="h-10 w-auto mx-auto" />
          </Link>
          <h1 className="mt-6 text-2xl font-bold">Создать аккаунт</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Регистрация сохраняется в серверной базе пользователей.
          </p>
        </div>

        <div className="glass-strong rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="login">Логин</Label>
              <Input
                id="login"
                type="text"
                placeholder="diletant"
                value={login}
                onChange={(event) => setLogin(event.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input
                id="name"
                type="text"
                placeholder="Ваше имя"
                value={name}
                onChange={(event) => setName(event.target.value)}
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
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tariff">Тариф</Label>
              <select
                id="tariff"
                value={tariffCode}
                onChange={(event) => setTariffCode(event.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {tariffs.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Минимум 8 символов"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
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
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="agreeTerms"
                  checked={agreedTerms}
                  onCheckedChange={(value) => setAgreedTerms(value === true)}
                  className="mt-0.5 flex-shrink-0"
                />
                <label htmlFor="agreeTerms" className="cursor-pointer leading-relaxed text-xs text-muted-foreground">
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
                  onCheckedChange={(value) => setAgreedPrivacy(value === true)}
                  className="mt-0.5 flex-shrink-0"
                />
                <label htmlFor="agreePrivacy" className="cursor-pointer leading-relaxed text-xs text-muted-foreground">
                  Принимаю{" "}
                  <Link href="/privacy-policy" className="text-primary hover:underline">
                    политику конфиденциальности
                  </Link>
                </label>
              </div>
            </div>

            {error ? (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
            ) : null}

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
              <Link
                href={`/auth/login?redirect=${encodeURIComponent(redirect)}`}
                className="text-primary hover:underline font-medium"
              >
                Войти
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <span className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  )
}
