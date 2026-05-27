"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Mail,
  Calendar,
  Shield,
  Key,
  Lock,
  LogOut,
  Check,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function AccountPage() {
  const { user, licenses, changePassword, terminateSessions } = useAuth()
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [sessionsMsg, setSessionsMsg] = useState(false)

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!oldPassword || !newPassword) {
      setPwMsg({ ok: false, text: "Заполните оба поля" })
      return
    }
    if (newPassword.length < 6) {
      setPwMsg({ ok: false, text: "Минимум 6 символов" })
      return
    }
    const ok = changePassword(oldPassword, newPassword)
    if (ok) {
      setPwMsg({ ok: true, text: "Пароль успешно изменён" })
      setOldPassword("")
      setNewPassword("")
      setTimeout(() => {
        setShowChangePassword(false)
        setPwMsg(null)
      }, 2000)
    } else {
      setPwMsg({ ok: false, text: "Неверный текущий пароль" })
    }
  }

  const handleTerminate = () => {
    terminateSessions()
    setSessionsMsg(true)
    setTimeout(() => setSessionsMsg(false), 3000)
  }

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">Аккаунт</h1>

      {/* Basic info */}
      <section className="glass-strong rounded-2xl p-6 md:p-8 mb-6">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Основная информация
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4">
            <User className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Имя</p>
              <p className="text-sm font-medium">{user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4">
            <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4">
            <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Дата регистрации</p>
              <p className="text-sm font-medium">{formatDate(user.registeredAt)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="glass-strong rounded-2xl p-6 md:p-8 mb-6">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Безопасность
        </h2>
        <div className="space-y-4">
          <div>
            <Button
              variant="outline"
              onClick={() => setShowChangePassword(!showChangePassword)}
              className="gap-2"
            >
              <Lock className="h-4 w-4" />
              Сменить пароль
            </Button>

            {showChangePassword && (
              <form onSubmit={handleChangePassword} className="mt-4 max-w-md space-y-4 p-4 rounded-xl bg-secondary/30 border border-border">
                <div className="space-y-2">
                  <Label>Текущий пароль</Label>
                  <div className="relative">
                    <Input
                      type={showOld ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                    />
                    <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Новый пароль</Label>
                  <div className="relative">
                    <Input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {pwMsg && (
                  <p className={cn("text-sm rounded-lg px-3 py-2", pwMsg.ok ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive")}>
                    {pwMsg.text}
                  </p>
                )}
                <Button type="submit" size="sm">Сохранить</Button>
              </form>
            )}
          </div>

          <div>
            <Button variant="outline" onClick={handleTerminate} className="gap-2">
              <LogOut className="h-4 w-4" />
              Завершить все сессии
            </Button>
            {sessionsMsg && (
              <p className="mt-2 text-sm text-primary bg-primary/10 rounded-lg px-3 py-2 inline-block">
                Все сессии завершены
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Licenses */}
      <section className="glass-strong rounded-2xl p-6 md:p-8">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          Лицензии
        </h2>

        {licenses.length === 0 ? (
          <div className="text-center py-8">
            <Key className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">У вас пока нет активных лицензий</p>
            <Button asChild variant="outline" className="mt-4" size="sm">
              <a href="/dashboard/subscriptions">Перейти к продуктам</a>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {licenses.map((lic) => (
              <div key={lic.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-xl border border-border p-4 bg-secondary/20">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm">{lic.productName}</p>
                    <Badge variant={lic.active ? "default" : "secondary"} className="text-[10px]">
                      {lic.active ? "Активна" : "Истекла"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Тариф: {lic.tariff}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="text-xs bg-secondary px-2 py-1 rounded font-mono">{lic.key}</code>
                    <button
                      onClick={() => copyKey(lic.key)}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {copiedKey === lic.key ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>Выдан: {formatDate(lic.issuedAt)}</p>
                  <p>Действует до: {formatDate(lic.expiresAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
