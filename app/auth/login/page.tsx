"use client"

import type { FormEvent } from "react"
import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AtlantLogo } from "@/components/twizz-logo"
import { Eye, EyeOff, LogIn } from "lucide-react"

function safeRedirect(value: string | null) {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value
  return "/dashboard/account"
}

function LoginContent() {
  const { login, ready, user } = useAuth()
  const router = useRouter()
  const params = useSearchParams()
  const redirect = safeRedirect(params.get("redirect"))
  const [loginOrEmail, setLoginOrEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (ready && user) {
      router.replace(redirect)
    }
  }, [ready, redirect, router, user])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError("")
    if (!loginOrEmail || !password) {
      setError("Заполните логин и пароль.")
      return
    }

    setLoading(true)
    const result = await login(loginOrEmail, password)
    setLoading(false)

    if (result.ok) {
      router.push(redirect)
      return
    }

    setError(result.error || "Не удалось войти.")
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <AtlantLogo variant="icon" className="h-10 w-auto mx-auto" />
          </Link>
          <h1 className="mt-6 text-2xl font-bold">Вход в аккаунт</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Используйте логин или email от серверной учетной записи.
          </p>
        </div>

        <div className="glass-strong rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="loginOrEmail">Логин или email</Label>
              <Input
                id="loginOrEmail"
                type="text"
                placeholder="diletant или you@example.com"
                value={loginOrEmail}
                onChange={(event) => setLoginOrEmail(event.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
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

            {error ? (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
            ) : null}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Вход...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Войти
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Нет аккаунта?{" "}
              <Link
                href={`/auth/register?redirect=${encodeURIComponent(redirect)}`}
                className="text-primary hover:underline font-medium"
              >
                Регистрация
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <span className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
