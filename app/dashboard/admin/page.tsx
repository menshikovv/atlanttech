"use client"

import type { FormEvent, ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import {
  fetchAdminCatalog,
  patchCatalogProduct,
  patchCatalogTariff,
  readStoredSiteToken,
  type SiteCatalogProduct,
  type SiteCatalogResponse,
  type SiteCatalogTariff,
  type SiteTariffHistoryItem,
} from "@/lib/site-api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Calendar,
  Crown,
  Package,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react"

const SITE_ROLE_OPTIONS = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
  { value: "main_admin", label: "Main Admin" },
]

const PRODUCT_ICON_OPTIONS = ["Settings2", "Target", "Shield", "Layers"]

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

function arrayToLines(values: string[]) {
  return values.join("\n")
}

function linesToArray(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function createEmptyTariffFormState() {
  return {
    tag: "",
    title: "",
    description: "",
    productId: "",
    visible: true,
    order: 10,
  }
}

function createEmptyProductFormState() {
  return {
    tag: "",
    name: "",
    description: "",
    forWhom: "",
    tariffCode: "",
    priceRub: "0",
    priceUsd: "0",
    icon: "Target",
    visible: true,
    popular: false,
    order: 10,
    benefits: "",
    features: "",
  }
}

export default function AdminPage() {
  const {
    ready,
    user,
    allUsers,
    allSubscriptions,
    refreshAdminData,
    loadTariffHistory,
    updateUserTariff,
    updateUserAccess,
  } = useAuth()
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [selectedUserId, setSelectedUserId] = useState("")
  const [history, setHistory] = useState<SiteTariffHistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState("Список пользователей загружается.")
  const [tariffSubmitting, setTariffSubmitting] = useState(false)
  const [accessSubmitting, setAccessSubmitting] = useState(false)
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [catalogSubmitting, setCatalogSubmitting] = useState(false)
  const [tariffOptions, setTariffOptions] = useState<Array<{ code: string; title: string }>>([
    { code: "base", title: "ScoutScope Basic" },
    { code: "manager", title: "Manager" },
    { code: "pro", title: "ScoutScope Pro" },
    { code: "admin", title: "Admin Access" },
  ])
  const [catalog, setCatalog] = useState<SiteCatalogResponse | null>(null)
  const [selectedCatalogTariffCode, setSelectedCatalogTariffCode] = useState("base")
  const [selectedProductId, setSelectedProductId] = useState("scoutscope-basic")
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
  const [catalogTariffFormState, setCatalogTariffFormState] = useState(createEmptyTariffFormState())
  const [catalogProductFormState, setCatalogProductFormState] = useState(createEmptyProductFormState())

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
  const canManageCatalog = user?.siteRole === "main_admin"
  const editingSelf = Boolean(selectedUser && user && selectedUser.id === user.id)

  const selectedCatalogTariff = useMemo(
    () => catalog?.tariffs.find((item) => item.code === selectedCatalogTariffCode) || null,
    [catalog, selectedCatalogTariffCode]
  )

  const selectedCatalogProduct = useMemo(
    () => catalog?.products.find((item) => item.id === selectedProductId) || null,
    [catalog, selectedProductId]
  )

  async function loadCatalogData() {
    const token = readStoredSiteToken()
    if (!token) {
      setCatalog(null)
      return
    }

    setCatalogLoading(true)
    try {
      const payload = await fetchAdminCatalog(token)
      setCatalog(payload)
      setTariffOptions(
        payload.tariffs.map((item) => ({
          code: item.code,
          title: item.title,
        }))
      )
    } finally {
      setCatalogLoading(false)
    }
  }

  useEffect(() => {
    if (!user || user.role !== "admin") return
    loadCatalogData().catch((error) => {
      setStatusMessage(error instanceof Error ? error.message : "Не удалось загрузить каталог сайта.")
    })
  }, [user])

  useEffect(() => {
    if (!selectedUserId && filteredUsers.length) {
      setSelectedUserId(filteredUsers[0].id)
    }
  }, [filteredUsers, selectedUserId])

  useEffect(() => {
    if (!selectedUser) {
      setTariffFormState({ tariffCode: "base", tariffStatus: "active", startsAt: "", expiresAt: "", note: "" })
      setAccessFormState({ siteRole: "user", isActive: true, note: "" })
      return
    }

    setTariffFormState({
      tariffCode: selectedUser.tariffCode,
      tariffStatus: selectedUser.tariffStatus,
      startsAt: toInputDateTime(selectedUser.tariffStartsAt),
      expiresAt: toInputDateTime(selectedUser.tariffExpiresAt),
      note: "",
    })
    setAccessFormState({
      siteRole: selectedUser.siteRole || "user",
      isActive: !selectedUser.blocked,
      note: "",
    })
    setTariffOptions((options) =>
      options.some((item) => item.code === selectedUser.tariffCode)
        ? options
        : [...options, { code: selectedUser.tariffCode, title: selectedUser.tariffTitle || selectedUser.tariffCode }]
    )
  }, [selectedUser])

  useEffect(() => {
    let active = true

    if (!selectedUserId) {
      setHistory([])
      setHistoryLoading(false)
      return () => {
        active = false
      }
    }

    setHistoryLoading(true)
    loadTariffHistory(selectedUserId, 20)
      .then((items) => {
        if (active) setHistory(items)
      })
      .catch(() => {
        if (active) setHistory([])
      })
      .finally(() => {
        if (active) setHistoryLoading(false)
      })

    return () => {
      active = false
    }
  }, [loadTariffHistory, selectedUserId])

  useEffect(() => {
    if (!catalog?.tariffs?.length) return
    if (!catalog.tariffs.some((item) => item.code === selectedCatalogTariffCode)) {
      setSelectedCatalogTariffCode(catalog.tariffs[0].code)
    }
  }, [catalog, selectedCatalogTariffCode])

  useEffect(() => {
    if (!catalog?.products?.length) return
    if (!catalog.products.some((item) => item.id === selectedProductId)) {
      setSelectedProductId(catalog.products[0].id)
    }
  }, [catalog, selectedProductId])

  useEffect(() => {
    if (!selectedCatalogTariff) {
      setCatalogTariffFormState(createEmptyTariffFormState())
      return
    }
    setCatalogTariffFormState({
      tag: selectedCatalogTariff.tag,
      title: selectedCatalogTariff.title,
      description: selectedCatalogTariff.description,
      productId: selectedCatalogTariff.productId || "",
      visible: selectedCatalogTariff.visible,
      order: selectedCatalogTariff.order,
    })
  }, [selectedCatalogTariff])

  useEffect(() => {
    if (!selectedCatalogProduct) {
      setCatalogProductFormState(createEmptyProductFormState())
      return
    }
    setCatalogProductFormState({
      tag: selectedCatalogProduct.tag,
      name: selectedCatalogProduct.name,
      description: selectedCatalogProduct.description,
      forWhom: selectedCatalogProduct.forWhom,
      tariffCode: selectedCatalogProduct.tariffCode || "",
      priceRub: String(selectedCatalogProduct.priceRub),
      priceUsd: String(selectedCatalogProduct.priceUsd),
      icon: selectedCatalogProduct.icon,
      visible: selectedCatalogProduct.visible,
      popular: selectedCatalogProduct.popular,
      order: selectedCatalogProduct.order,
      benefits: arrayToLines(selectedCatalogProduct.benefits),
      features: arrayToLines(selectedCatalogProduct.features),
    })
  }, [selectedCatalogProduct])

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
    await refreshAdminData()
    const items = await loadTariffHistory(selectedUser.id, 20)
    setHistory(items)
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
    await refreshAdminData()
    const items = await loadTariffHistory(selectedUser.id, 20)
    setHistory(items)
  }

  const handleCatalogTariffSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedCatalogTariff) {
      setStatusMessage("Выберите тариф витрины.")
      return
    }
    if (!canManageCatalog) {
      setStatusMessage("Только main admin может менять витрину тарифов.")
      return
    }
    const token = readStoredSiteToken()
    if (!token) {
      setStatusMessage("Нет активной admin-сессии.")
      return
    }

    setCatalogSubmitting(true)
    try {
      const payload = await patchCatalogTariff(token, selectedCatalogTariff.code, {
        tag: catalogTariffFormState.tag,
        title: catalogTariffFormState.title,
        description: catalogTariffFormState.description,
        productId: catalogTariffFormState.productId || null,
        visible: catalogTariffFormState.visible,
        order: Number(catalogTariffFormState.order) || 0,
      })
      setCatalog(payload.catalog)
      setStatusMessage(`Витрина тарифа ${selectedCatalogTariff.code} обновлена.`)
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Не удалось обновить витрину тарифа.")
    } finally {
      setCatalogSubmitting(false)
    }
  }

  const handleCatalogProductSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedCatalogProduct) {
      setStatusMessage("Выберите продукт.")
      return
    }
    if (!canManageCatalog) {
      setStatusMessage("Только main admin может менять витрину продуктов.")
      return
    }
    const token = readStoredSiteToken()
    if (!token) {
      setStatusMessage("Нет активной admin-сессии.")
      return
    }

    setCatalogSubmitting(true)
    try {
      const payload = await patchCatalogProduct(token, selectedCatalogProduct.id, {
        tag: catalogProductFormState.tag,
        name: catalogProductFormState.name,
        description: catalogProductFormState.description,
        forWhom: catalogProductFormState.forWhom,
        tariffCode: catalogProductFormState.tariffCode,
        priceRub: Number(catalogProductFormState.priceRub) || 0,
        priceUsd: Number(catalogProductFormState.priceUsd) || 0,
        icon: catalogProductFormState.icon,
        visible: catalogProductFormState.visible,
        popular: catalogProductFormState.popular,
        order: Number(catalogProductFormState.order) || 0,
        benefits: linesToArray(catalogProductFormState.benefits),
        features: linesToArray(catalogProductFormState.features),
      })
      setCatalog(payload.catalog)
      setStatusMessage(`Продукт ${selectedCatalogProduct.id} обновлен.`)
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Не удалось обновить продукт.")
    } finally {
      setCatalogSubmitting(false)
    }
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
            Main admin управляет пользователями, доступами и витриной тарифов/продуктов.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => {
            Promise.all([refreshAdminData(), loadCatalogData()])
              .then(() => setStatusMessage("Пользователи и витрина обновлены."))
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

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="glass-strong rounded-2xl border border-border overflow-hidden">
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

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/40 text-[10px] uppercase tracking-wider text-muted-foreground">
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
                      <td className="px-5 py-3 text-muted-foreground">{item.email}</td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-primary/10 text-primary border-0">{roleLabel(item.siteRole)}</Badge>
                          {item.blocked ? <Badge variant="outline">disabled</Badge> : null}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge className="bg-primary/10 text-primary border-0">{item.tariffTitle}</Badge>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{formatDate(item.tariffExpiresAt)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-6">
          <div className="glass-strong rounded-2xl border border-border p-6">
            <h2 className="text-lg font-bold mb-4">Карточка пользователя</h2>
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

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Статус тарифа</label>
                    <select
                      value={tariffFormState.tariffStatus}
                      onChange={(event) => setTariffFormState((state) => ({ ...state, tariffStatus: event.target.value }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      disabled={!canManageTariffs}
                    >
                      <option value="active">active</option>
                      <option value="inactive">inactive</option>
                      <option value="expired">expired</option>
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

                <form onSubmit={handleAccessSubmit} className="space-y-4 rounded-2xl border border-border bg-secondary/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold">Доступ к админке</h3>
                      <p className="text-xs text-muted-foreground">Main admin управляет ролями, отключением аккаунтов и снятием админ-доступа.</p>
                    </div>
                    <Badge variant="outline">{canManageAccess ? "main admin" : "read only"}</Badge>
                  </div>

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
                    <label className="text-sm font-medium">Аккаунт</label>
                    <select
                      value={accessFormState.isActive ? "active" : "disabled"}
                      onChange={(event) => setAccessFormState((state) => ({ ...state, isActive: event.target.value === "active" }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      disabled={!canManageAccess || editingSelf}
                    >
                      <option value="active">active</option>
                      <option value="disabled">disabled</option>
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
                </form>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Выберите пользователя из таблицы слева.</p>
            )}
          </div>

          <div className="glass-strong rounded-2xl border border-border p-6">
            <h2 className="text-lg font-bold mb-4">История тарифа</h2>
            {historyLoading ? (
              <p className="text-sm text-muted-foreground">Загружаю историю...</p>
            ) : history.length === 0 ? (
              <p className="text-sm text-muted-foreground">История для выбранного пользователя пока пуста.</p>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-border bg-secondary/30 p-4">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge className="bg-primary/10 text-primary border-0">{item.tariffCode}</Badge>
                      <Badge variant="outline">{item.tariffStatus}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Выдан: {formatDate(item.grantedAt)}</p>
                    <p className="text-sm text-muted-foreground">Действует до: {formatDate(item.expiresAt)}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Источник: {item.source || "manual"}{item.note ? ` • ${item.note}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2 mt-6">
        <section className="glass-strong rounded-2xl border border-border p-6">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Витрина тарифов
              </div>
              <h2 className="text-lg font-bold mt-4">Редактирование тарифов</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Здесь меняются названия, описание, привязка к продукту и публичная видимость.
              </p>
            </div>
            <Badge variant="outline">{catalogLoading ? "loading" : canManageCatalog ? "main admin" : "read only"}</Badge>
          </div>

          <form onSubmit={handleCatalogTariffSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Тариф витрины</label>
              <select
                value={selectedCatalogTariffCode}
                onChange={(event) => setSelectedCatalogTariffCode(event.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {(catalog?.tariffs || []).map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.code} — {item.title}
                  </option>
                ))}
              </select>
            </div>

            {selectedCatalogTariff ? (
              <div className="rounded-2xl border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
                Runtime: окно {selectedCatalogTariff.requestWindowHours ? `${selectedCatalogTariff.requestWindowHours} ч` : "без лимита"},
                сравнение {selectedCatalogTariff.comparePlayersLimit ? `до ${selectedCatalogTariff.comparePlayersLimit}` : "без ограничений"},
                ELO {selectedCatalogTariff.maxEloSpan ?? "без ограничений"}.
              </div>
            ) : null}

            <div className="space-y-2">
              <label className="text-sm font-medium">Tag</label>
              <Input
                value={catalogTariffFormState.tag}
                onChange={(event) => setCatalogTariffFormState((state) => ({ ...state, tag: event.target.value }))}
                disabled={!canManageCatalog}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Название</label>
              <Input
                value={catalogTariffFormState.title}
                onChange={(event) => setCatalogTariffFormState((state) => ({ ...state, title: event.target.value }))}
                disabled={!canManageCatalog}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Описание</label>
              <textarea
                value={catalogTariffFormState.description}
                onChange={(event) => setCatalogTariffFormState((state) => ({ ...state, description: event.target.value }))}
                className="flex min-h-[110px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={!canManageCatalog}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Привязанный продукт</label>
                <select
                  value={catalogTariffFormState.productId}
                  onChange={(event) => setCatalogTariffFormState((state) => ({ ...state, productId: event.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  disabled={!canManageCatalog}
                >
                  <option value="">—</option>
                  {(catalog?.products || []).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Порядок</label>
                <Input
                  type="number"
                  value={catalogTariffFormState.order}
                  onChange={(event) => setCatalogTariffFormState((state) => ({ ...state, order: Number(event.target.value) || 0 }))}
                  disabled={!canManageCatalog}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Публичность</label>
              <select
                value={catalogTariffFormState.visible ? "visible" : "hidden"}
                onChange={(event) => setCatalogTariffFormState((state) => ({ ...state, visible: event.target.value === "visible" }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={!canManageCatalog}
              >
                <option value="visible">visible</option>
                <option value="hidden">hidden</option>
              </select>
            </div>

            <Button type="submit" className="w-full" disabled={!canManageCatalog || catalogSubmitting}>
              {catalogSubmitting ? "Сохраняю..." : "Сохранить витрину тарифа"}
            </Button>
          </form>
        </section>

        <section className="glass-strong rounded-2xl border border-border p-6">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary">
                <Package className="h-3.5 w-3.5" />
                Каталог продуктов
              </div>
              <h2 className="text-lg font-bold mt-4">Редактирование продуктов</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Можно менять описание, цены, фичи, иконку, видимость и связанный тариф.
              </p>
            </div>
            <Badge variant="outline">{catalogLoading ? "loading" : canManageCatalog ? "main admin" : "read only"}</Badge>
          </div>

          <form onSubmit={handleCatalogProductSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Продукт</label>
              <select
                value={selectedProductId}
                onChange={(event) => setSelectedProductId(event.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {(catalog?.products || []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.id} — {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tag</label>
                <Input
                  value={catalogProductFormState.tag}
                  onChange={(event) => setCatalogProductFormState((state) => ({ ...state, tag: event.target.value }))}
                  disabled={!canManageCatalog}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Название</label>
                <Input
                  value={catalogProductFormState.name}
                  onChange={(event) => setCatalogProductFormState((state) => ({ ...state, name: event.target.value }))}
                  disabled={!canManageCatalog}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Описание</label>
              <textarea
                value={catalogProductFormState.description}
                onChange={(event) => setCatalogProductFormState((state) => ({ ...state, description: event.target.value }))}
                className="flex min-h-[110px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={!canManageCatalog}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Для кого</label>
              <Input
                value={catalogProductFormState.forWhom}
                onChange={(event) => setCatalogProductFormState((state) => ({ ...state, forWhom: event.target.value }))}
                disabled={!canManageCatalog}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Связанный тариф</label>
                <select
                  value={catalogProductFormState.tariffCode}
                  onChange={(event) => setCatalogProductFormState((state) => ({ ...state, tariffCode: event.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  disabled={!canManageCatalog}
                >
                  <option value="">—</option>
                  {(catalog?.tariffs || []).map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.code}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Иконка</label>
                <select
                  value={catalogProductFormState.icon}
                  onChange={(event) => setCatalogProductFormState((state) => ({ ...state, icon: event.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  disabled={!canManageCatalog}
                >
                  {PRODUCT_ICON_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Цена RUB</label>
                <Input
                  type="number"
                  value={catalogProductFormState.priceRub}
                  onChange={(event) => setCatalogProductFormState((state) => ({ ...state, priceRub: event.target.value }))}
                  disabled={!canManageCatalog}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Цена USD</label>
                <Input
                  type="number"
                  value={catalogProductFormState.priceUsd}
                  onChange={(event) => setCatalogProductFormState((state) => ({ ...state, priceUsd: event.target.value }))}
                  disabled={!canManageCatalog}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Порядок</label>
                <Input
                  type="number"
                  value={catalogProductFormState.order}
                  onChange={(event) => setCatalogProductFormState((state) => ({ ...state, order: Number(event.target.value) || 0 }))}
                  disabled={!canManageCatalog}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Публичность</label>
                <select
                  value={catalogProductFormState.visible ? "visible" : "hidden"}
                  onChange={(event) => setCatalogProductFormState((state) => ({ ...state, visible: event.target.value === "visible" }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  disabled={!canManageCatalog}
                >
                  <option value="visible">visible</option>
                  <option value="hidden">hidden</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Статус</label>
                <select
                  value={catalogProductFormState.popular ? "popular" : "regular"}
                  onChange={(event) => setCatalogProductFormState((state) => ({ ...state, popular: event.target.value === "popular" }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  disabled={!canManageCatalog}
                >
                  <option value="regular">regular</option>
                  <option value="popular">popular</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Преимущества</label>
              <textarea
                value={catalogProductFormState.benefits}
                onChange={(event) => setCatalogProductFormState((state) => ({ ...state, benefits: event.target.value }))}
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={!canManageCatalog}
                placeholder="Одна строка = одно преимущество"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Фичи</label>
              <textarea
                value={catalogProductFormState.features}
                onChange={(event) => setCatalogProductFormState((state) => ({ ...state, features: event.target.value }))}
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={!canManageCatalog}
                placeholder="Одна строка = одна фича"
              />
            </div>

            <Button type="submit" className="w-full" disabled={!canManageCatalog || catalogSubmitting}>
              {catalogSubmitting ? "Сохраняю..." : "Сохранить продукт"}
            </Button>
          </form>
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
