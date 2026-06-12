"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Crown,
  MessageSquare,
  Package,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Users,
  ArrowRight,
  UserCog,
  HelpCircle,
} from "lucide-react"

function roleLabel(role: string) {
  const normalized = String(role || "user").trim().toLowerCase()
  if (normalized === "main_admin") return "Main Admin"
  if (normalized === "admin") return "Admin"
  return "User"
}

export default function AdminPage() {
  const {
    ready,
    user,
    allUsers,
    allSubscriptions,
    refreshAdminData,
  } = useAuth()
  const router = useRouter()
  const [statusMessage, setStatusMessage] = useState("Загрузка данных...")
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (ready && user && user.role !== "admin") {
      router.replace("/dashboard/account")
    }
  }, [ready, router, user])

  useEffect(() => {
    if (!user || user.role !== "admin") return
    refreshAdminData()
      .then(() => setStatusMessage("Данные обновлены"))
      .catch((error) => setStatusMessage(error instanceof Error ? error.message : "Ошибка загрузки"))
  }, [refreshAdminData, user])

  if (!ready || !user || user.role !== "admin") {
    return null
  }

  const activeUsers = allUsers.filter((item) => !item.blocked && item.tariffStatus === "active")
  const adminUsers = allUsers.filter((item) => item.siteRole === "admin" || item.siteRole === "main_admin")
  const stats = {
    totalUsers: allUsers.length,
    activeUsers: activeUsers.length,
    adminUsers: adminUsers.length,
    activeTariffs: allSubscriptions.filter((item) => item.active).length,
  }

  const canManage = user?.siteRole === "main_admin"

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refreshAdminData()
      setStatusMessage("Данные обновлены")
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Ошибка обновления")
    } finally {
      setRefreshing(false)
    }
  }

  const navItems = [
    {
      href: "/dashboard/admin/users",
      icon: Users,
      label: "Пользователи",
      desc: "Управление пользователями, тарифами и доступами",
      color: "from-primary/20 to-primary/5",
      iconBg: "bg-primary/10 text-primary",
      badge: `${stats.totalUsers} чел.`,
    },
    {
      href: "/dashboard/admin/catalog/tariffs",
      icon: Sparkles,
      label: "Тарифы",
      desc: "Редактирование витрины тарифов",
      color: "from-primary/20 to-primary/5",
      iconBg: "bg-primary/10 text-primary",
      badge: "Витрина",
    },
    {
      href: "/dashboard/admin/catalog/products",
      icon: Package,
      label: "Продукты",
      desc: "Редактирование каталога продуктов",
      color: "from-primary/20 to-primary/5",
      iconBg: "bg-primary/10 text-primary",
      badge: "Каталог",
    },
    {
      href: "/dashboard/admin/support",
      icon: MessageSquare,
      label: "Поддержка",
      desc: "Заявки, отправленные через форму на сайте",
      color: "from-primary/20 to-primary/5",
      iconBg: "bg-primary/10 text-primary",
      badge: "Заявки",
    },
  ]

  return (
    <div className="relative min-h-screen">
      {/* Background blobs */}
      <div className="fixed top-0 right-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[170px] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 py-8 md:py-12 max-w-7xl">
        {/* ─── Hero Header ─── */}
        <div className="relative mb-10 overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 md:p-10">
          <div className="absolute top-0 right-0 h-40 w-40 translate-x-1/4 -translate-y-1/4 rounded-full bg-primary/20 blur-[80px]" />
          <div className="absolute bottom-0 left-1/4 h-20 w-20 rounded-full bg-accent/20 blur-[60px]" />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-4">
                <ShieldCheck className="h-3.5 w-3.5" />
                {canManage ? "Полный доступ" : "Чтение"}
              </div>
              <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl">
                Админ-панель
              </h1>
              <p className="mt-2 max-w-xl text-muted-foreground">
                {canManage
                  ? "Управляйте пользователями, тарифами, продуктами и заявками."
                  : "Просмотр данных. Только main_admin может вносить изменения."}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-1.5 text-sm">
                  <UserCog className="h-4 w-4 text-primary" />
                  <span className="font-medium">{user.name}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {roleLabel(user.siteRole)}
                  </Badge>
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="gap-2 bg-background/50 backdrop-blur-sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Обновление..." : "Обновить"}
            </Button>
          </div>
        </div>

        {/* ─── Status Bar ─── */}
        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-border/60 bg-secondary/30 px-5 py-3 text-sm text-muted-foreground backdrop-blur-sm">
          <div className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          {statusMessage}
          {stats.activeUsers > 0 && (
            <Badge variant="outline" className="ml-auto bg-primary/5 text-primary border-primary/20">
              {stats.activeUsers} активных
            </Badge>
          )}
        </div>

        {/* ─── Stats Grid ─── */}
        <div className="mb-10 grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Всего пользователей"
            value={stats.totalUsers}
            icon={<Users className="h-5 w-5" />}
            gradient="from-primary/20 to-primary/5"
            iconBg="bg-primary/10 text-primary"
          />
          <StatCard
            label="Активных"
            value={stats.activeUsers}
            icon={<ShieldCheck className="h-5 w-5" />}
            gradient="from-primary/15 to-primary/5"
            iconBg="bg-primary/10 text-primary"
          />
          <StatCard
            label="Админов"
            value={stats.adminUsers}
            icon={<Crown className="h-5 w-5" />}
            gradient="from-primary/20 to-primary/5"
            iconBg="bg-primary/10 text-primary"
          />
          <StatCard
            label="Активных тарифов"
            value={stats.activeTariffs}
            icon={<Calendar className="h-5 w-5" />}
            gradient="from-primary/15 to-primary/5"
            iconBg="bg-primary/10 text-primary"
          />
        </div>

        {/* ─── Navigation ─── */}
        <div>
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Разделы управления
            </h2>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href} className="group block">
                  <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5">
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    <div className="relative flex items-start gap-5">
                      <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl ${item.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold">{item.label}</h3>
                          <Badge variant="outline" className="text-[10px] border-primary/20 bg-primary/5 text-primary">
                            {item.badge}
                          </Badge>
                        </div>
                        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-secondary/50 text-muted-foreground transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/25">
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* ─── Footer info ─── */}
        <div className="mt-10 rounded-2xl border border-border/40 bg-secondary/20 px-6 py-4">
          <div className="flex flex-col gap-2 text-center text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <HelpCircle className="h-3.5 w-3.5" />
              {canManage
                ? "Вы можете управлять всеми разделами."
                : "Для внесения изменений обратитесь к main admin."}
            </div>
            <span>
              Всего записей: {stats.totalUsers} пользователей · {stats.adminUsers} админов
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  gradient,
  iconBg,
}: {
  label: string
  value: number
  icon: ReactNode
  gradient: string
  iconBg: string
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {label}
          </p>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
            {icon}
          </div>
        </div>
        <p className="mt-4 text-3xl font-bold tracking-tight">{value}</p>
        <div className="mt-3 h-1 w-full rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-primary/30 transition-all duration-500 group-hover:bg-primary/50"
            style={{ width: `${Math.min(100, (value / 200) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
