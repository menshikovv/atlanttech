"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  ShieldCheck,
  Users,
  UserPlus,
  CreditCard,
  Wallet,
  Ban,
  Unlock,
  Trash2,
  Crown,
  Calendar,
  Clock,
  Search,
  Plus,
  Power,
  PowerOff,
  Package,
} from "lucide-react"

export default function AdminPage() {
  const {
    user,
    allUsers,
    allSubscriptions,
    adminToggleBlockUser,
    adminToggleAdmin,
    adminDeleteUser,
    adminDeleteSubscription,
    adminToggleSubscriptionActive,
    adminExtendSubscription,
  } = useAuth()
  const router = useRouter()
  const [userQuery, setUserQuery] = useState("")
  const [subQuery, setSubQuery] = useState("")

  // Access guard — only admin can view this page
  useEffect(() => {
    if (user && user.role !== "admin") {
      router.replace("/dashboard")
    }
  }, [user, router])

  const stats = useMemo(() => {
    const now = new Date()
    const activeSubs = allSubscriptions.filter(
      (s) => s.active && new Date(s.expiresAt) > now
    )
    const revenue = allSubscriptions.reduce((sum, s) => sum + (s.price || 0), 0)
    return {
      totalUsers: allUsers.filter((u) => u.role !== "admin").length,
      totalSubs: allSubscriptions.length,
      activeSubs: activeSubs.length,
      revenue,
    }
  }, [allUsers, allSubscriptions])

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase()
    const sorted = [...allUsers].sort(
      (a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()
    )
    if (!q) return sorted
    return sorted.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
    )
  }, [allUsers, userQuery])

  const filteredSubs = useMemo(() => {
    const q = subQuery.trim().toLowerCase()
    const sorted = [...allSubscriptions].sort(
      (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
    )
    if (!q) return sorted
    return sorted.filter((s) => {
      const owner = allUsers.find((u) => u.id === s.userId)
      return (
        s.productName.toLowerCase().includes(q) ||
        s.tariff.toLowerCase().includes(q) ||
        owner?.email.toLowerCase().includes(q) ||
        owner?.name.toLowerCase().includes(q)
      )
    })
  }, [allSubscriptions, allUsers, subQuery])

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  const confirmAndRun = (msg: string, action: () => void) => {
    if (window.confirm(msg)) action()
  }

  if (!user || user.role !== "admin") return null

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Административная панель</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Управление пользователями, подписками и доступом
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-10">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Пользователей"
          value={stats.totalUsers}
          tone="primary"
        />
        <StatCard
          icon={<UserPlus className="h-5 w-5" />}
          label="Всего регистраций"
          value={allUsers.length}
          tone="accent"
        />
        <StatCard
          icon={<CreditCard className="h-5 w-5" />}
          label="Активных подписок"
          value={stats.activeSubs}
          tone="emerald"
        />
        <StatCard
          icon={<Wallet className="h-5 w-5" />}
          label="Всего подписок"
          value={stats.totalSubs}
          tone="amber"
        />
      </div>

      {/* Users section */}
      <section className="glass-strong rounded-2xl border border-border overflow-hidden mb-10">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Пользователи</h2>
            <Badge variant="outline" className="ml-1 text-[10px]">
              {filteredUsers.length}
            </Badge>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по email, имени, ID…"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </header>

        {filteredUsers.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            Пользователи не найдены
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/40 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 text-left font-semibold">ID</th>
                  <th className="px-5 py-3 text-left font-semibold">Никнейм</th>
                  <th className="px-5 py-3 text-left font-semibold">Email</th>
                  <th className="px-5 py-3 text-left font-semibold">Регистрация</th>
                  <th className="px-5 py-3 text-left font-semibold">Подписки</th>
                  <th className="px-5 py-3 text-left font-semibold">Роль</th>
                  <th className="px-5 py-3 text-left font-semibold">Статус</th>
                  <th className="px-5 py-3 text-right font-semibold">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const userSubs = allSubscriptions.filter((s) => s.userId === u.id)
                  const activeSubs = userSubs.filter(
                    (s) => s.active && new Date(s.expiresAt) > new Date()
                  )
                  const isSelf = u.id === user.id
                  return (
                    <tr
                      key={u.id}
                      className="border-t border-border/60 hover:bg-secondary/20 transition-colors"
                    >
                      <td className="px-5 py-3 font-mono text-[11px] text-muted-foreground">
                        {u.id.slice(0, 8)}…
                      </td>
                      <td className="px-5 py-3 font-medium">{u.name}</td>
                      <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {formatDate(u.registeredAt)}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm font-medium">{activeSubs.length}</span>
                        <span className="text-xs text-muted-foreground"> / {userSubs.length}</span>
                      </td>
                      <td className="px-5 py-3">
                        {u.role === "admin" ? (
                          <Badge className="bg-primary/10 text-primary border-0 text-[10px] gap-1">
                            <Crown className="h-3 w-3" />
                            Админ
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">
                            Юзер
                          </Badge>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {u.blocked ? (
                          <Badge className="bg-destructive/10 text-destructive border-0 text-[10px]">
                            Заблокирован
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-500/10 text-emerald-700 border-0 text-[10px]">
                            Активен
                          </Badge>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <IconAction
                            title={u.blocked ? "Разблокировать" : "Заблокировать"}
                            disabled={isSelf}
                            onClick={() =>
                              confirmAndRun(
                                u.blocked
                                  ? `Разблокировать ${u.email}?`
                                  : `Заблокировать ${u.email}? Аккаунт не сможет войти.`,
                                () => adminToggleBlockUser(u.id)
                              )
                            }
                            variant={u.blocked ? "primary" : "destructive"}
                          >
                            {u.blocked ? <Unlock className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                          </IconAction>
                          <IconAction
                            title={u.role === "admin" ? "Снять админа" : "Сделать админом"}
                            disabled={isSelf}
                            onClick={() =>
                              confirmAndRun(
                                u.role === "admin"
                                  ? `Снять права администратора у ${u.email}?`
                                  : `Назначить ${u.email} администратором?`,
                                () => adminToggleAdmin(u.id)
                              )
                            }
                            variant="accent"
                          >
                            <Crown className="h-3.5 w-3.5" />
                          </IconAction>
                          <IconAction
                            title="Удалить пользователя"
                            disabled={isSelf}
                            onClick={() =>
                              confirmAndRun(
                                `Удалить ${u.email} и все его подписки? Это действие необратимо.`,
                                () => adminDeleteUser(u.id)
                              )
                            }
                            variant="destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </IconAction>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Subscriptions section */}
      <section className="glass-strong rounded-2xl border border-border overflow-hidden">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Все подписки</h2>
            <Badge variant="outline" className="ml-1 text-[10px]">
              {filteredSubs.length}
            </Badge>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по продукту, email…"
              value={subQuery}
              onChange={(e) => setSubQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </header>

        {filteredSubs.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            Подписки не найдены
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/40 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 text-left font-semibold">Продукт</th>
                  <th className="px-5 py-3 text-left font-semibold">Пользователь</th>
                  <th className="px-5 py-3 text-left font-semibold">Тариф</th>
                  <th className="px-5 py-3 text-left font-semibold">Дата оплаты</th>
                  <th className="px-5 py-3 text-left font-semibold">Действует до</th>
                  <th className="px-5 py-3 text-left font-semibold">Статус</th>
                  <th className="px-5 py-3 text-right font-semibold">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubs.map((s) => {
                  const owner = allUsers.find((u) => u.id === s.userId)
                  const expired = new Date(s.expiresAt) <= new Date()
                  const isActive = s.active && !expired
                  return (
                    <tr
                      key={s.id}
                      className="border-t border-border/60 hover:bg-secondary/20 transition-colors"
                    >
                      <td className="px-5 py-3 font-medium">{s.productName}</td>
                      <td className="px-5 py-3">
                        <p className="text-sm">{owner?.name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">{owner?.email ?? s.userId}</p>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant="outline" className="text-[10px]">
                          {s.tariff}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDateTime(s.paidAt)}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground text-xs">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(s.expiresAt)}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {isActive ? (
                          <Badge className="bg-emerald-500/10 text-emerald-700 border-0 text-[10px]">
                            Активна
                          </Badge>
                        ) : expired ? (
                          <Badge className="bg-muted text-muted-foreground border-0 text-[10px]">
                            Истекла
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/10 text-amber-700 border-0 text-[10px]">
                            Отключена
                          </Badge>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <IconAction
                            title="Продлить на 1 мес"
                            onClick={() => adminExtendSubscription(s.id, 1)}
                            variant="primary"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </IconAction>
                          <IconAction
                            title={s.active ? "Отключить доступ" : "Включить доступ"}
                            onClick={() => adminToggleSubscriptionActive(s.id)}
                            variant={s.active ? "amber" : "primary"}
                          >
                            {s.active ? (
                              <PowerOff className="h-3.5 w-3.5" />
                            ) : (
                              <Power className="h-3.5 w-3.5" />
                            )}
                          </IconAction>
                          <IconAction
                            title="Удалить подписку"
                            onClick={() =>
                              confirmAndRun(
                                `Удалить подписку «${s.productName}» пользователя ${owner?.email ?? ""}?`,
                                () => adminDeleteSubscription(s.id)
                              )
                            }
                            variant="destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </IconAction>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

// ---------- helpers ----------

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  tone: "primary" | "accent" | "emerald" | "amber"
}) {
  const tones: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-blue-500/10 text-blue-600",
    emerald: "bg-emerald-500/10 text-emerald-700",
    amber: "bg-amber-500/10 text-amber-700",
  }
  return (
    <div className="glass-strong rounded-2xl border border-border p-5 text-center">
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-xl mx-auto mb-3",
          tones[tone]
        )}
      >
        {icon}
      </div>
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}

function IconAction({
  children,
  onClick,
  title,
  disabled,
  variant,
}: {
  children: React.ReactNode
  onClick: () => void
  title: string
  disabled?: boolean
  variant: "primary" | "destructive" | "accent" | "amber"
}) {
  const variants: Record<string, string> = {
    primary: "bg-primary/10 text-primary hover:bg-primary/20",
    destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20",
    accent: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20",
    amber: "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20",
  }
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100",
        variants[variant]
      )}
    >
      {children}
    </button>
  )
}
