"use client"

import type { FormEvent, ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  ChevronDown,
  Crown,
  History,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react"

const SITE_ROLE_OPTIONS = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
  { value: "main_admin", label: "Main Admin" },
]

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

function roleLabel(role: string) {
  const normalized = String(role || "user").trim().toLowerCase()
  if (normalized === "main_admin") return "Main Admin"
  if (normalized === "admin") return "Admin"
  return "User"
}

function toInputDateTime(value: string | null) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export default function AdminUsersPage() {
  const {
    ready,
    user,
    allUsers,
    allSubscriptions,
    refreshAdminData,
    updateUserTariff,
    updateUserAccess,
    deleteUser,
  } = useAuth()
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [selectedUserId, setSelectedUserId] = useState("")
  const [statusMessage, setStatusMessage] = useState("Список пользователей загружается.")
  const [tariffSubmitting, setTariffSubmitting] = useState(false)
  const [accessSubmitting, setAccessSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [tariffOptions, setTariffOptions] = useState<Array<{ code: string; title: string }>>([
    { code: "base", title: "ScoutScope Basic" },
    { code: "manager", title: "Manager" },
    { code: "pro", title: "ScoutScope Pro" },
    { code: "admin", title: "Admin Access" },
  ])
  const [tariffFormState, setTariffFormState] = useState({
    tariffCode: "base",
    tariffStatus: "active",
    startsAt: "",
    expiresAt: "",
    note: "",
  })
  const [accessFormState, setAccessFormState] = useState({
    siteRole: "user",
    isActive: true,
    note: "",
  })
  const [accessOpen, setAccessOpen] = useState(false)

  useEffect(() => {
    if (ready && user && user.role !== "admin") {
      router.replace("/dashboard/account")
    }
  }, [ready, router, user])

  useEffect(() => {
    if (!user || user.role !== "admin") return
    refreshAdminData()
      .then(() => setStatusMessage("Список пользователей обновлен."))
      .catch((error) => setStatusMessage(error instanceof Error ? error.message : "Не удалось загрузить пользователей."))
  }, [refreshAdminData, user])

  const filteredUsers = useMemo(() => {
    const needle = search.trim().toLowerCase()
    const sorted = [...allUsers].sort(
      (left, right) => new Date(right.registeredAt).getTime() - new Date(left.registeredAt).getTime()
    )
    if (!needle) return sorted
    return sorted.filter((item) =>
      [item.login, item.name, item.email, item.id, item.siteRole].some((value) =>
        String(value || "").toLowerCase().includes(needle)
      )
    )
  }, [allUsers, search])

  const selectedUser = useMemo(
    () =>
      filteredUsers.find((item) => item.id === selectedUserId) ||
      allUsers.find((item) => item.id === selectedUserId) ||
      null,
    [allUsers, filteredUsers, selectedUserId]
  )

  const stats = useMemo(() => {
    const activeUsers = allUsers.filter((item) => !item.blocked && item.tariffStatus === "active")
    const adminUsers = allUsers.filter((item) => item.siteRole === "admin" || item.siteRole === "main_admin")
    return {
      totalUsers: allUsers.length,
      activeUsers: activeUsers.length,
      adminUsers: adminUsers.length,
      activeTariffs: allSubscriptions.filter((item) => item.active).length,
    }
  }, [allSubscriptions, allUsers])

  const canManageAccess = user?.siteRole === "main_admin"
  const canManageTariffs = user?.siteRole === "main_admin"
  const editingSelf = Boolean(selectedUser && user && selectedUser.id === user.id)

  useEffect(() => {
    setDeleteConfirm("")
    if (!selectedUserId) {
      setTariffFormState({ tariffCode: "base", tariffStatus: "active", startsAt: "", expiresAt: "", note: "" })
      setAccessFormState({ siteRole: "user", isActive: true, note: "" })
      return
    }
    const currentUser = allUsers.find((item) => item.id === selectedUserId) || null
    if (!currentUser) return

    setTariffFormState({
      tariffCode: currentUser.tariffCode,
      tariffStatus: currentUser.tariffStatus,
      startsAt: toInputDateTime(currentUser.tariffStartsAt),
      expiresAt: toInputDateTime(currentUser.tariffExpiresAt),
      note: "",
    })
    setAccessFormState({
      siteRole: currentUser.siteRole || "user",
      isActive: !currentUser.blocked,
      note: "",
    })
    setTariffOptions((options) =>
      options.some((item) => item.code === currentUser.tariffCode)
        ? options
        : [...options, { code: currentUser.tariffCode, title: currentUser.tariffTitle || currentUser.tariffCode }]
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId])

  const handleDeleteUser = async () => {
    if (!selectedUser || deleteConfirm !== selectedUser.login) return
    if (editingSelf) {
      setStatusMessage("Нельзя удалить свой собственный аккаунт.")
      return
    }

    setDeleting(true)
    const result = await deleteUser(selectedUser.id)
    setDeleting(false)

    if (!result.ok) {
      setStatusMessage(result.error || "Не удалось удалить пользователя.")
      return
    }

    setStatusMessage(`Пользователь ${selectedUser.login} удалён.`)
    setSelectedUserId("")
    setDeleteConfirm("")
  }

  if (!ready || !user || user.role !== "admin") {
    return null
  }

  const handleTariffSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedUser) {
      setStatusMessage("Выберите пользователя.")
      return
    }
    if (!canManageTariffs) {
      setStatusMessage("Только main admin может менять тарифы.")
      return
    }

    setTariffSubmitting(true)
    const result = await updateUserTariff(selectedUser.id, {
      tariffCode: tariffFormState.tariffCode,
      tariffStatus: tariffFormState.tariffStatus,
      startsAt: tariffFormState.startsAt ? new Date(tariffFormState.startsAt).toISOString() : null,
      expiresAt: tariffFormState.expiresAt ? new Date(tariffFormState.expiresAt).toISOString() : null,
      note: tariffFormState.note || "Updated from website admin panel",
    })
    setTariffSubmitting(false)

    if (!result.ok) {
      setStatusMessage(result.error || "Не удалось обновить тариф.")
      return
    }

    setStatusMessage(`Тариф пользователя ${selectedUser.email} обновлен.`)
  }

  const handleAccessSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedUser) {
      setStatusMessage("Выберите пользователя.")
      return
    }
    if (!canManageAccess) {
      setStatusMessage("Только main admin может менять доступы аккаунтов.")
      return
    }

    setAccessSubmitting(true)
    const result = await updateUserAccess(selectedUser.id, {
      siteRole: accessFormState.siteRole,
      isActive: accessFormState.isActive,
      note: accessFormState.note || "Updated from website access panel",
    })
    setAccessSubmitting(false)

    if (!result.ok) {
      setStatusMessage(result.error || "Не удалось обновить доступы аккаунта.")
      return
    }

    setStatusMessage(`Доступы пользователя ${selectedUser.email} обновлены.`)
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/admin")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary mb-3">
            <Users className="h-3.5 w-3.5" />
            Управление
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">Пользователи</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Main admin управляет пользователями, тарифами и доступами.
          </p>
        </div>
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

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="glass-strong rounded-2xl border border-border xl:overflow-hidden xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:flex xl:flex-col">
          <header className="flex flex-col gap-3 border-b border-border bg-secondary/30 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider">Пользователи</h2>
              <p className="text-xs text-muted-foreground mt-1">Выберите пользователя, чтобы управлять тарифом и доступом.</p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Поиск по login, email, role"
                className="pl-9"
              />
            </div>
          </header>

          <div className="overflow-x-auto xl:flex-1">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="sticky top-0 bg-secondary/95 backdrop-blur z-10">
                <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 text-left font-semibold">Login</th>
                  <th className="px-5 py-3 text-left font-semibold">Email</th>
                  <th className="px-5 py-3 text-left font-semibold">Role</th>
                  <th className="px-5 py-3 text-left font-semibold">Тариф</th>
                  <th className="px-5 py-3 text-left font-semibold">До</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((item) => {
                  const isSelected = item.id === selectedUserId
                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedUserId(item.id)}
                      className={`border-t border-border/60 transition-colors cursor-pointer ${isSelected ? "bg-primary/5" : "hover:bg-secondary/20"}`}
                    >
                      <td className="px-5 py-3">
                        <div className="font-medium">{item.login}</div>
                        <div className="text-xs text-muted-foreground">{item.name}</div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground max-w-[120px] truncate">{item.email}</td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-primary/10 text-primary border-0">{roleLabel(item.siteRole)}</Badge>
                          {item.blocked ? <Badge variant="outline">disabled</Badge> : null}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge className="bg-primary/10 text-primary border-0">{item.tariffTitle}</Badge>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">{formatDate(item.tariffExpiresAt)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <section className="space-y-6">
          <div className="glass-strong rounded-2xl border border-border p-6">
            {selectedUser ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-secondary/30 p-4">
                  <p className="text-sm font-semibold">{selectedUser.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{selectedUser.email}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge className="bg-primary/10 text-primary border-0">{selectedUser.tariffCode}</Badge>
                    <Badge variant="outline">{roleLabel(selectedUser.siteRole)}</Badge>
                    <Badge variant="outline">{selectedUser.blocked ? "disabled" : "active"}</Badge>
                  </div>
                </div>

                <Link href={`/dashboard/admin/history/${selectedUser.id}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full gap-2 py-3">
                    <History className="h-4 w-4" />
                    История тарифов
                  </Button>
                </Link>

                <form onSubmit={handleTariffSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Тариф</label>
                    <select
                      value={tariffFormState.tariffCode}
                      onChange={(event) => setTariffFormState((state) => ({ ...state, tariffCode: event.target.value }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      disabled={!canManageTariffs}
                    >
                      {tariffOptions.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Дата старта</label>
                      <Input
                        type="datetime-local"
                        value={tariffFormState.startsAt}
                        onChange={(event) => setTariffFormState((state) => ({ ...state, startsAt: event.target.value }))}
                        disabled={!canManageTariffs}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Дата окончания</label>
                      <Input
                        type="datetime-local"
                        value={tariffFormState.expiresAt}
                        onChange={(event) => setTariffFormState((state) => ({ ...state, expiresAt: event.target.value }))}
                        disabled={!canManageTariffs}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Комментарий</label>
                    <Input
                      value={tariffFormState.note}
                      onChange={(event) => setTariffFormState((state) => ({ ...state, note: event.target.value }))}
                      placeholder="Например: продление доступа"
                      disabled={!canManageTariffs}
                    />
                  </div>

                  {!canManageTariffs ? (
                    <p className="text-xs text-muted-foreground">Обычный admin может просматривать данные, но не менять тарифы.</p>
                  ) : null}

                  <Button type="submit" className="w-full" disabled={!canManageTariffs || tariffSubmitting}>
                    {tariffSubmitting ? "Сохраняю..." : "Сохранить тариф"}
                  </Button>
                </form>

                <Collapsible open={accessOpen} onOpenChange={setAccessOpen} asChild>
                  <form onSubmit={handleAccessSubmit} className="space-y-4 rounded-2xl border border-border bg-secondary/20 p-4">
                    <CollapsibleTrigger asChild>
                      <div className="flex cursor-pointer items-center justify-between gap-3 select-none">
                        <div>
                          <h3 className="text-sm font-semibold">Доступ к админке</h3>
                          <p className="text-xs text-muted-foreground">Main admin управляет ролями, отключением аккаунтов и снятием админ-доступа.</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{canManageAccess ? "main admin" : "read only"}</Badge>
                          <ChevronDown className={`size-4 transition-transform ${accessOpen ? "rotate-180" : ""}`} />
                        </div>
                      </div>
                    </CollapsibleTrigger>

                  <CollapsibleContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Role</label>
                      <select
                        value={accessFormState.siteRole}
                        onChange={(event) => setAccessFormState((state) => ({ ...state, siteRole: event.target.value }))}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        disabled={!canManageAccess || editingSelf}
                      >
                        {SITE_ROLE_OPTIONS.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Комментарий</label>
                      <Input
                        value={accessFormState.note}
                        onChange={(event) => setAccessFormState((state) => ({ ...state, note: event.target.value }))}
                        placeholder="Например: снятие admin-доступа"
                        disabled={!canManageAccess}
                      />
                    </div>

                    {canManageAccess && !editingSelf && selectedUser && selectedUser.siteRole !== "user" ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          setAccessFormState((state) => ({
                            ...state,
                            siteRole: "user",
                            note: state.note || "Снятие admin-доступа",
                          }))
                        }
                      >
                        Снять админ-доступ
                      </Button>
                    ) : null}

                    {editingSelf ? (
                      <p className="text-xs text-muted-foreground">Свой собственный доступ и статус аккаунта менять нельзя.</p>
                    ) : null}

                    <Button type="submit" className="w-full" disabled={!canManageAccess || accessSubmitting || editingSelf}>
                      {accessSubmitting ? "Сохраняю..." : "Сохранить доступы"}
                    </Button>
                  </CollapsibleContent>
                </form>
                </Collapsible>

                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-semibold text-destructive mb-3">Опасная зона</h3>
                  {editingSelf ? (
                    <p className="text-xs text-muted-foreground">Нельзя удалить свой собственный аккаунт.</p>
                  ) : deleteConfirm === selectedUser.login ? (
                    <div className="space-y-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        Подтверждение удаления
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Вы уверены, что хотите удалить пользователя <strong>{selectedUser.login}</strong>?
                        Это действие необратимо.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          className="flex-1 gap-2"
                          onClick={handleDeleteUser}
                          disabled={deleting}
                        >
                          {deleting ? "Удаляю..." : <><Trash2 className="h-4 w-4" /> Удалить</>}
                        </Button>
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={() => setDeleteConfirm("")}
                        >
                          <X className="h-4 w-4" />
                          Отмена
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteConfirm(selectedUser.login)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Удалить пользователя
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[300px] text-sm text-muted-foreground">
                Выберите пользователя из таблицы
              </div>
            )}
          </div>
        </section>
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
