"use client"

import type { FormEvent } from "react"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import {
  fetchAdminCatalog,
  patchCatalogTariff,
  readStoredSiteToken,
  type SiteCatalogResponse,
  type SiteCatalogTariff,
} from "@/lib/site-api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Sparkles, Tag, FileText, Package, Eye, ListOrdered, Info, Hash, Clock, Users, Gauge } from "lucide-react"

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

export default function CatalogTariffsPage() {
  const router = useRouter()
  const { ready, user } = useAuth()
  const [catalog, setCatalog] = useState<SiteCatalogResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [statusType, setStatusType] = useState<"success" | "error" | "info">("info")
  const [selectedCode, setSelectedCode] = useState("")
  const [tariffFormState, setTariffFormState] = useState(createEmptyTariffFormState())

  const canManage = user?.siteRole === "main_admin"

  useEffect(() => {
    if (ready && user && user.role !== "admin") {
      router.replace("/dashboard/account")
    }
  }, [ready, router, user])

  useEffect(() => {
    if (!user || user.role !== "admin") return
    const token = readStoredSiteToken()
    if (!token) return
    setLoading(true)
    fetchAdminCatalog(token)
      .then((payload) => {
        setCatalog(payload)
        if (payload.tariffs.length) {
          setSelectedCode(payload.tariffs[0].code)
        }
      })
      .catch(() => {
        setStatus("Не удалось загрузить каталог.", "error")
      })
      .finally(() => setLoading(false))
  }, [user])

  const selectedTariff = useMemo(
    () => catalog?.tariffs.find((item) => item.code === selectedCode) || null,
    [catalog, selectedCode]
  )

  useEffect(() => {
    if (!selectedTariff) return
    setTariffFormState({
      tag: selectedTariff.tag,
      title: selectedTariff.title,
      description: selectedTariff.description,
      productId: selectedTariff.productId || "",
      visible: selectedTariff.visible,
      order: selectedTariff.order,
    })
  }, [selectedCode])

  const setStatus = (msg: string, type: "success" | "error" | "info" = "info") => {
    setStatusMessage(msg)
    setStatusType(type)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedTariff) return
    if (!canManage) {
      setStatus("Только main admin может менять витрину тарифов.", "error")
      return
    }
    const token = readStoredSiteToken()
    if (!token) {
      setStatus("Нет активной admin-сессии.", "error")
      return
    }

    setSubmitting(true)
    try {
      const payload = await patchCatalogTariff(token, selectedTariff.code, {
        tag: tariffFormState.tag,
        title: tariffFormState.title,
        description: tariffFormState.description,
        productId: tariffFormState.productId || null,
        visible: tariffFormState.visible,
        order: Number(tariffFormState.order) || 0,
      })
      setCatalog(payload.catalog)
      const updated = payload.item as SiteCatalogTariff
      setTariffFormState({
        tag: updated.tag,
        title: updated.title,
        description: updated.description,
        productId: updated.productId || "",
        visible: updated.visible,
        order: updated.order,
      })
      setStatus(`Витрина тарифа "${updated.title}" обновлена.`, "success")
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Не удалось обновить витрину тарифа.", "error")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Загружаю каталог...</p>
        </div>
      </div>
    )
  }

  const statusColors = {
    success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
    error: "border-red-500/20 bg-red-500/10 text-red-600",
    info: "border-primary/20 bg-primary/5 text-primary",
  }

  return (
    <div className="relative min-h-screen">
      {/* Background blobs */}
      <div className="fixed top-0 right-1/4 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 h-[350px] w-[350px] rounded-full bg-primary/5 blur-[170px] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 py-8 md:py-12 max-w-4xl">
        {/* ─── Hero Header ─── */}
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8">
          <div className="absolute top-0 right-0 h-32 w-32 translate-x-1/4 -translate-y-1/4 rounded-full bg-primary/20 blur-[80px]" />
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/admin")} className="shrink-0 bg-background/50 backdrop-blur-sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                Витрина тарифов
              </div>
              <h1 className="text-2xl font-bold md:text-3xl">Редактирование тарифов</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {canManage
                  ? "Названия, описание, привязка к продукту и публичная видимость."
                  : "Просмотр. Только main admin может редактировать."}
              </p>
            </div>
          </div>
        </div>

        {/* ─── Status ─── */}
        {statusMessage && (
          <div className={`mb-6 flex items-center gap-3 rounded-2xl border px-5 py-3 text-sm backdrop-blur-sm ${statusColors[statusType]}`}>
            <div className={`h-2 w-2 rounded-full ${statusType === "success" ? "bg-emerald-500 animate-pulse" : statusType === "error" ? "bg-red-500" : "bg-primary"}`} />
            {statusMessage}
          </div>
        )}

        {/* ─── Form ─── */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Tariff selector */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-base font-bold">Выбор тарифа</h2>
              </div>
              <Badge variant="outline" className={canManage ? "border-primary/20 bg-primary/5 text-primary" : ""}>
                {canManage ? "main admin" : "read only"}
              </Badge>
            </div>
            <select
              value={selectedCode}
              onChange={(event) => setSelectedCode(event.target.value)}
              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            >
              {(catalog?.tariffs || []).map((item) => (
                <option key={item.code} value={item.code}>
                  {item.code} — {item.title}
                </option>
              ))}
            </select>
          </div>

          {/* Runtime info */}
          {selectedTariff && (
            <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 to-background p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Info className="h-5 w-5 text-primary" />
                <h2 className="text-base font-bold">Параметры тарифа (runtime)</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/50 px-4 py-3">
                  <Clock className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Окно запроса</p>
                    <p className="text-sm font-medium">{selectedTariff.requestWindowHours ? `${selectedTariff.requestWindowHours} ч` : "Без лимита"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/50 px-4 py-3">
                  <Users className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Сравнение</p>
                    <p className="text-sm font-medium">{selectedTariff.comparePlayersLimit ? `до ${selectedTariff.comparePlayersLimit}` : "Без ограничений"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/50 px-4 py-3">
                  <Gauge className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">ELO</p>
                    <p className="text-sm font-medium">{selectedTariff.maxEloSpan ?? "Без ограничений"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Основная информация */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold">Основная информация</h2>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-sm font-medium">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                Tag
              </label>
              <Input
                value={tariffFormState.tag}
                onChange={(event) => setTariffFormState((state) => ({ ...state, tag: event.target.value }))}
                disabled={!canManage}
                className="rounded-xl"
              />
            </div>

            <div className="mt-5 space-y-2">
              <label className="flex items-center gap-1.5 text-sm font-medium">
                <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                Название
              </label>
              <Input
                value={tariffFormState.title}
                onChange={(event) => setTariffFormState((state) => ({ ...state, title: event.target.value }))}
                disabled={!canManage}
                className="rounded-xl"
              />
            </div>

            <div className="mt-5 space-y-2">
              <label className="flex items-center gap-1.5 text-sm font-medium">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                Описание
              </label>
              <textarea
                value={tariffFormState.description}
                onChange={(event) => setTariffFormState((state) => ({ ...state, description: event.target.value }))}
                className="flex min-h-[100px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                disabled={!canManage}
              />
            </div>
          </div>

          {/* Связи и настройки */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Hash className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold">Связи и настройки</h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-sm font-medium">
                  <Package className="h-3.5 w-3.5 text-muted-foreground" />
                  Привязанный продукт
                </label>
                <select
                  value={tariffFormState.productId}
                  onChange={(event) => setTariffFormState((state) => ({ ...state, productId: event.target.value }))}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  disabled={!canManage}
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
                <label className="flex items-center gap-1.5 text-sm font-medium">
                  <ListOrdered className="h-3.5 w-3.5 text-muted-foreground" />
                  Порядок
                </label>
                <Input
                  type="number"
                  value={tariffFormState.order}
                  onChange={(event) => setTariffFormState((state) => ({ ...state, order: Number(event.target.value) || 0 }))}
                  disabled={!canManage}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <label className="flex items-center gap-1.5 text-sm font-medium">
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                Публичность
              </label>
              <select
                value={tariffFormState.visible ? "visible" : "hidden"}
                onChange={(event) => setTariffFormState((state) => ({ ...state, visible: event.target.value === "visible" }))}
                className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                disabled={!canManage}
              >
                <option value="visible">visible</option>
                <option value="hidden">hidden</option>
              </select>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-xl text-base font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
            disabled={!canManage || submitting}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Сохраняю...
              </span>
            ) : (
              "Сохранить витрину тарифа"
            )}
          </Button>
        </form>

        {/* ─── Footer ─── */}
        <div className="mt-8 rounded-2xl border border-border/40 bg-secondary/20 px-6 py-4 text-center text-xs text-muted-foreground">
          {canManage
            ? "Все изменения применяются сразу к витрине сайта."
            : "Для редактирования обратитесь к main admin."}
        </div>
      </div>
    </div>
  )
}
