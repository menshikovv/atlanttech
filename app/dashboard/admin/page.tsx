"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Crown,
  Package,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react"

export default function AdminPage() {
  const {
    ready,
    user,
    allUsers,
    allSubscriptions,
    refreshAdminData,
  } = useAuth()
  const router = useRouter()
  const [statusMessage, setStatusMessage] = useState("Данные загружаются.")

  useEffect(() => {
    if (ready && user && user.role !== "admin") {
      router.replace("/dashboard/account")
    }
  }, [ready, router, user])

  useEffect(() => {
    if (!user || user.role !== "admin") return
    refreshAdminData()
      .then(() => setStatusMessage("Данные обновлены."))
      .catch((error) => setStatusMessage(error instanceof Error ? error.message : "Не удалось загрузить данные."))
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

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary mb-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            Live admin mode
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">Админ-панель сайта</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Main admin управляет пользователями, доступами.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => {
            refreshAdminData()
              .then(() => setStatusMessage("Данные обновлены."))
              .catch((error) => setStatusMessage(error instanceof Error ? error.message : "Ошибка обновления."))
          }}
        >
          <RefreshCcw className="h-4 w-4" />
          Обновить
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Всего пользователей" value={stats.totalUsers} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Активных" value={stats.activeUsers} icon={<ShieldCheck className="h-5 w-5" />} />
        <StatCard label="Админов" value={stats.adminUsers} icon={<Crown className="h-5 w-5" />} />
        <StatCard label="Активных тарифов" value={stats.activeTariffs} icon={<Calendar className="h-5 w-5" />} />
      </div>

      <div className="rounded-2xl border border-border bg-secondary/20 px-4 py-3 text-sm text-muted-foreground mb-6">
        {statusMessage}
      </div>

      <div className="grid gap-4">
        <Link href="/dashboard/admin/users" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="w-full gap-3 py-4 justify-start text-base">
            <Users className="h-5 w-5 text-primary" />
            <span className="font-medium">Пользователи</span>
            <span className="text-xs text-muted-foreground ml-auto">Управление пользователями, тарифами и доступами</span>
          </Button>
        </Link>
        <Link href="/dashboard/admin/catalog/tariffs" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="w-full gap-3 py-4 justify-start text-base">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-medium">Редактирование тарифов</span>
            <span className="text-xs text-muted-foreground ml-auto">Витрина тарифов</span>
          </Button>
        </Link>
        <Link href="/dashboard/admin/catalog/products" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="w-full gap-3 py-4 justify-start text-base">
            <Package className="h-5 w-5 text-primary" />
            <span className="font-medium">Редактирование продуктов</span>
            <span className="text-xs text-muted-foreground ml-auto">Каталог продуктов</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon: ReactNode
}) {
  return (
    <div className="glass-strong rounded-2xl border border-border p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold mt-3">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
    </div>
  )
}
