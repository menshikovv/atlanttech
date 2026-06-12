"use client"

import { useEffect, useState } from "react"
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

export default function TariffHistoryPage() {
  const params = useParams()
  const router = useRouter()
  const { ready, user, allUsers, loadTariffHistory } = useAuth()
  const [history, setHistory] = useState<SiteTariffHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  const userId = params?.userId as string | undefined

  useEffect(() => {
    if (ready && user && user.role !== "admin") {
      router.replace("/dashboard/account")
    }
  }, [ready, router, user])

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    loadTariffHistory(userId, 50)
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoading(false))
  }, [loadTariffHistory, userId])

  const selectedUser = allUsers.find((item) => item.id === userId)

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/admin")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">История тарифов</h1>
          {selectedUser && (
            <p className="text-sm text-foreground/80 mt-1">
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
        <div className="space-y-3">
          {history.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className="bg-primary/20 text-primary border-0 font-semibold">{item.tariffCode}</Badge>
                <Badge variant="secondary">{item.tariffStatus}</Badge>
              </div>
              <p className="text-sm text-foreground">Выдан: {formatDate(item.grantedAt)}</p>
              <p className="text-sm text-foreground">Действует до: {formatDate(item.expiresAt)}</p>
              <p className="text-xs text-foreground/70 mt-2">
                Источник: {item.source || "manual"}{item.note ? ` • ${item.note}` : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
