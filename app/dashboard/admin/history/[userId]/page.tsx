"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import type { SiteTariffHistoryItem } from "@/lib/site-api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock } from "lucide-react"

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

function sourceLabel(source: string) {
  if (source === "admin") return "Вручную"
  if (source === "payment") return "Оплата"
  if (source === "registration") return "Регистрация"
  if (source === "promo") return "Промо"
  if (source === "extension") return "Продление"
  return source || "Вручную"
}

const EXTEND_OPTIONS = [
  { label: "1 месяц", months: 1 },
  { label: "3 месяца", months: 3 },
  { label: "6 месяцев", months: 6 },
]

export default function TariffHistoryPage() {
  const params = useParams()
  const router = useRouter()
  const { ready, user, allUsers, loadTariffHistory, updateUserTariff } = useAuth()
  const [history, setHistory] = useState<SiteTariffHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [extendingId, setExtendingId] = useState<string | null>(null)
  const [extendMonths, setExtendMonths] = useState(1)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const userId = params?.userId as string | undefined
  const selectedUser = allUsers.find((item) => item.id === userId)

  const fetchHistory = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    loadTariffHistory(userId, 50)
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoading(false))
  }, [loadTariffHistory, userId])

  useEffect(() => {
    if (ready && user && user.role !== "admin") {
      router.replace("/dashboard/account")
    }
  }, [ready, router, user])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const handleCancel = async (item: SiteTariffHistoryItem) => {
    setActionLoading(`cancel-${item.id}`)
    await updateUserTariff(item.userId, {
      tariffCode: item.tariffCode,
      tariffStatus: "cancelled",
      note: "Аннулирован из истории тарифов",
    })
    setActionLoading(null)
    fetchHistory()
  }

  const handleExtend = async (item: SiteTariffHistoryItem) => {
    setActionLoading(`extend-${item.id}`)
    const currentExpiry = item.expiresAt ? new Date(item.expiresAt) : new Date()
    const newExpiry = new Date(currentExpiry)
    newExpiry.setMonth(newExpiry.getMonth() + extendMonths)

    await updateUserTariff(item.userId, {
      tariffCode: item.tariffCode,
      tariffStatus: "active",
      expiresAt: newExpiry.toISOString(),
      note: `Продлён на ${extendMonths} мес. из истории тарифов`,
    })
    setActionLoading(null)
    setExtendingId(null)
    setExtendMonths(1)
    fetchHistory()
  }

  const renderActions = (item: SiteTariffHistoryItem) => (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="border-destructive/50 text-destructive hover:bg-destructive/10 h-8 text-xs"
        onClick={() => handleCancel(item)}
        disabled={actionLoading === `cancel-${item.id}` || item.tariffStatus !== "active"}
      >
        {actionLoading === `cancel-${item.id}` ? "..." : "Аннулировать"}
      </Button>

      {extendingId === item.id ? (
        <div className="flex items-center gap-1">
          <select
            value={extendMonths}
            onChange={(e) => setExtendMonths(Number(e.target.value))}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
          >
            {EXTEND_OPTIONS.map((opt) => (
              <option key={opt.months} value={opt.months}>
                {opt.label}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            className="h-8 text-xs"
            onClick={() => handleExtend(item)}
            disabled={actionLoading === `extend-${item.id}`}
          >
            {actionLoading === `extend-${item.id}` ? "..." : "ОК"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={() => { setExtendingId(null); setExtendMonths(1) }}
          >
            Отмена
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => setExtendingId(item.id)}
          disabled={item.tariffStatus !== "active"}
        >
          Продлить
        </Button>
      )}
    </div>
  )

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <div className="flex items-start gap-3 sm:gap-4">
        <Button variant="outline" size="icon" className="flex-shrink-0" onClick={() => router.push("/dashboard/admin/users")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold">История тарифов</h1>
          {selectedUser && (
            <p className="text-xs sm:text-sm text-foreground/80 mt-1 break-words">
              {selectedUser.name} — {selectedUser.email}
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Clock className="mr-3 h-5 w-5 animate-spin text-foreground/70" />
          <span className="text-foreground/70">Загружаю историю...</span>
        </div>
      ) : history.length === 0 ? (
        <p className="text-sm text-foreground/60 py-16 text-center">
          История для этого пользователя пока пуста.
        </p>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="space-y-3 md:hidden">
            {history.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-medium break-all">{selectedUser?.login || item.userId}</span>
                  <div className="flex flex-wrap items-center justify-end gap-2 flex-shrink-0">
                    <Badge className="bg-primary/10 text-primary border-0">{item.tariffCode}</Badge>
                    <Badge variant="outline" className="text-[10px]">{item.tariffStatus}</Badge>
                  </div>
                </div>
                <dl className="space-y-1.5 text-xs">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground flex-shrink-0">Период</dt>
                    <dd className="text-right">{formatDate(item.startsAt)} — {formatDate(item.expiresAt)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground flex-shrink-0">Приобретён</dt>
                    <dd className="text-right">{formatDate(item.grantedAt || item.createdAt)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground flex-shrink-0">Как получен</dt>
                    <dd className="text-right">{sourceLabel(item.source)}</dd>
                  </div>
                </dl>
                {renderActions(item)}
              </div>
            ))}
          </div>

          {/* Tablet+: table */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-border bg-secondary/50 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 text-left font-semibold">Пользователь</th>
                  <th className="px-4 py-3 text-left font-semibold">С какого по какое</th>
                  <th className="px-4 py-3 text-left font-semibold">Тариф</th>
                  <th className="px-4 py-3 text-left font-semibold">Дата приобретения</th>
                  <th className="px-4 py-3 text-left font-semibold">Как получен</th>
                  <th className="px-4 py-3 text-left font-semibold">Действия</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="border-b border-border/60 transition-colors hover:bg-secondary/20">
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{selectedUser?.login || item.userId}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDate(item.startsAt)} — {formatDate(item.expiresAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-primary/10 text-primary border-0">{item.tariffCode}</Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {item.tariffStatus}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(item.grantedAt || item.createdAt)}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{sourceLabel(item.source)}</td>
                    <td className="px-4 py-3">
                      {renderActions(item)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
