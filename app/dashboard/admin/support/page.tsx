"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  MessageSquare,
  Mail,
  User,
  CheckCircle2,
  Clock,
  Trash2,
} from "lucide-react"
import type { SupportTicket, SupportStatus } from "@/lib/support-types"
import { readStoredSiteToken } from "@/lib/site-api"

const API_BASE = "/api/support"

function formatDate(value: string) {
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const statusLabels: Record<SupportStatus, string> = {
  new: "Новая",
  read: "Прочитана",
  closed: "Закрыта",
}

const statusColors: Record<SupportStatus, string> = {
  new: "bg-green-500/10 text-green-600 border-green-500/20",
  read: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  closed: "bg-muted text-muted-foreground border-border",
}

export default function AdminSupportPage() {
  const { ready, user } = useAuth()
  const router = useRouter()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusMessage, setStatusMessage] = useState("Загрузка заявок...")

  const selected = tickets.find((t) => t.id === selectedId) ?? null

  const fetchTickets = useCallback(async () => {
    const token = readStoredSiteToken()
    if (!token) return
    try {
      const res = await fetch(API_BASE, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to load")
      const data = (await res.json()) as { items: SupportTicket[] }
      setTickets(data.items)
      setStatusMessage(`Загрузок: ${data.items.length}`)
    } catch (err) {
      setStatusMessage("Ошибка загрузки заявок")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (ready && user && user.role !== "admin") {
      router.replace("/dashboard/account")
    }
  }, [ready, router, user])

  useEffect(() => {
    if (!ready || !user || user.role !== "admin") return
    fetchTickets()
  }, [ready, user, fetchTickets])

  const updateStatus = async (id: string, status: SupportStatus) => {
    const token = readStoredSiteToken()
    if (!token) return
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status } : t))
      )
    }
  }

  const deleteTicket = async (id: string) => {
    const token = readStoredSiteToken()
    if (!token) return
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      setTickets((prev) => prev.filter((t) => t.id !== id))
      if (selectedId === id) setSelectedId(null)
    }
  }

  if (!ready || !user || user.role !== "admin") {
    return null
  }

  const newCount = tickets.filter((t) => t.status === "new").length

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/admin")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary mb-3">
            <MessageSquare className="h-3.5 w-3.5" />
            Поддержка
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">Заявки в поддержку</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Заявки, отправленные через форму на сайте
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-secondary/20 px-4 py-3 text-sm text-muted-foreground mb-6 flex items-center gap-2">
        <Clock className="h-4 w-4" />
        {statusMessage}
        {newCount > 0 && (
          <Badge className="ml-auto bg-green-500/10 text-green-600 border-green-500/20">
            {newCount} новых
          </Badge>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        {/* Tickets list */}
        <div className="glass-strong rounded-2xl border border-border xl:overflow-hidden xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:flex xl:flex-col">
          <header className="border-b border-border bg-secondary/30 px-5 py-4">
            <h2 className="text-sm font-bold uppercase tracking-wider">Все заявки</h2>
          </header>

          <div className="overflow-x-auto xl:flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
                Загрузка...
              </div>
            ) : tickets.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
                Нет заявок
              </div>
            ) : (
              <table className="w-full text-sm min-w-[400px]">
                <thead className="sticky top-0 bg-secondary/95 backdrop-blur z-10">
                  <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3 text-left font-semibold">Дата</th>
                    <th className="px-5 py-3 text-left font-semibold">Тема</th>
                    <th className="px-5 py-3 text-left font-semibold">Отправитель</th>
                    <th className="px-5 py-3 text-left font-semibold">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => {
                    const isSelected = ticket.id === selected?.id
                    return (
                      <tr
                        key={ticket.id}
                        onClick={() => setSelectedId(ticket.id)}
                        className={`border-t border-border/60 transition-colors cursor-pointer ${
                          isSelected ? "bg-primary/5" : "hover:bg-secondary/20"
                        } ${ticket.status === "new" ? "font-medium" : ""}`}
                      >
                        <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">
                          {formatDate(ticket.createdAt)}
                        </td>
                        <td className="px-5 py-3">{ticket.subject}</td>
                        <td className="px-5 py-3 text-muted-foreground max-w-[100px] truncate">{ticket.name}</td>
                        <td className="px-5 py-3">
                          <Badge className={statusColors[ticket.status]} variant="outline">
                            {statusLabels[ticket.status]}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Ticket detail */}
        <section className="space-y-6">
          <div className="glass-strong rounded-2xl border border-border p-6">
            {selected ? (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold">{selected.subject}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(selected.createdAt)}
                    </p>
                  </div>
                  <Badge className={statusColors[selected.status]} variant="outline">
                    {statusLabels[selected.status]}
                  </Badge>
                </div>

                <div className="space-y-3 rounded-2xl border border-border bg-secondary/30 p-4">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-primary" />
                    <span className="font-medium">{selected.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-primary" />
                    <a href={`mailto:${selected.email}`} className="text-primary hover:underline">
                      {selected.email}
                    </a>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{selected.message}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selected.status !== "read" && (
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => updateStatus(selected.id, "read")}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Отметить прочитанной
                    </Button>
                  )}
                  {selected.status !== "closed" && (
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => updateStatus(selected.id, "closed")}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Закрыть
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="gap-2 md:ml-auto border-destructive/50 text-destructive hover:bg-destructive/10"
                    onClick={() => deleteTicket(selected.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Удалить
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[300px] text-sm text-muted-foreground">
                Выберите заявку из списка
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
