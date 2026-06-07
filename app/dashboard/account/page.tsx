"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  CreditCard,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react"

function formatDate(value: string | null) {
  if (!value) return "—"
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function roleLabel(role: string, siteRole: string) {
  const normalizedSiteRole = String(siteRole || "").trim().toLowerCase()
  if (normalizedSiteRole === "main_admin") return "Main Admin"
  if (normalizedSiteRole === "admin" || role === "admin") return "Администратор"
  return "Пользователь"
}

export default function AccountPage() {
  const { user, subscriptions } = useAuth()

  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Аккаунт</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Данные загружаются из серверной базы пользователей ScoutScope.
          </p>
        </div>
        {user.role === "admin" ? (
          <Link
            href="/dashboard/admin"
            className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10"
          >
            <ShieldCheck className="h-4 w-4" />
            Открыть админ-панель
          </Link>
        ) : null}
      </div>

      <section className="glass-strong rounded-2xl p-6 md:p-8 mb-6">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Профиль
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <InfoCard icon={<User className="h-5 w-5 text-muted-foreground" />} label="Логин" value={user.login} />
          <InfoCard icon={<User className="h-5 w-5 text-muted-foreground" />} label="Имя" value={user.name} />
          <InfoCard icon={<Mail className="h-5 w-5 text-muted-foreground" />} label="Email" value={user.email} />
          <InfoCard
            icon={<ShieldCheck className="h-5 w-5 text-muted-foreground" />}
            label="Роль"
            value={roleLabel(user.role, user.siteRole)}
          />
          <InfoCard
            icon={<Calendar className="h-5 w-5 text-muted-foreground" />}
            label="Дата регистрации"
            value={formatDate(user.registeredAt)}
          />
          <InfoCard
            icon={<Clock className="h-5 w-5 text-muted-foreground" />}
            label="Последний вход"
            value={formatDate(user.lastLoginAt)}
          />
        </div>
      </section>

      <section className="glass-strong rounded-2xl p-6 md:p-8 mb-6">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Текущий доступ
        </h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <TariffCard
            label="Тариф"
            value={user.tariffTitle}
            accent={user.tariffCode}
            extra={`Код: ${user.tariffCode}`}
          />
          <TariffCard
            label="Статус"
            value={user.tariffStatus}
            accent={user.tariffStatus}
            extra={user.blocked ? "Аккаунт отключен" : "Аккаунт активен"}
          />
          <TariffCard
            label="Действует до"
            value={formatDate(user.tariffExpiresAt)}
            extra={user.tariffDaysLeft === null ? "Без ограничений" : `Осталось дней: ${user.tariffDaysLeft}`}
          />
          <TariffCard
            label="Выдан"
            value={formatDate(user.tariffGrantedAt)}
            extra={user.tariffStartsAt ? `Старт: ${formatDate(user.tariffStartsAt)}` : "Дата старта не указана"}
          />
        </div>
      </section>

      <section className="glass-strong rounded-2xl p-6 md:p-8">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Подписки и продукты
        </h2>

        {subscriptions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            Для этого пользователя не найдено активных продуктов.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {subscriptions.map((subscription) => (
              <div key={subscription.id} className="rounded-2xl border border-border bg-secondary/30 p-5">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-semibold">{subscription.productName}</p>
                    <p className="text-xs text-muted-foreground">Привязано к тарифу пользователя</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-0">{subscription.tariff}</Badge>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Доступ до: {formatDate(subscription.expiresAt)}</p>
                  <p>Статус: {subscription.active ? "Активен" : "Неактивен"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4">
      <div className="flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  )
}

function TariffCard({
  label,
  value,
  extra,
  accent,
}: {
  label: string
  value: string
  extra: string
  accent?: string
}) {
  const tone =
    accent === "admin"
      ? "border-primary/30 bg-primary/5"
      : accent === "active"
        ? "border-emerald-500/20 bg-emerald-500/5"
        : "border-border bg-secondary/30"

  return (
    <div className={`rounded-2xl border p-5 ${tone}`}>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold mt-2">{value}</p>
      <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{extra}</p>
    </div>
  )
}
