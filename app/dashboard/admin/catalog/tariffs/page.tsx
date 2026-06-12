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
import { ArrowLeft, Sparkles } from "lucide-react"

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
      .catch(() => setStatusMessage("Не удалось загрузить каталог."))
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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedTariff) return
    if (!canManage) {
      setStatusMessage("Только main admin может менять витрину тарифов.")
      return
    }
    const token = readStoredSiteToken()
    if (!token) {
      setStatusMessage("Нет активной admin-сессии.")
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
      setStatusMessage(`Витрина тарифа ${selectedTariff.code} обновлена.`)
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Не удалось обновить витрину тарифа.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="text-foreground/70">Загружаю каталог...</span>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/admin")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Витрина тарифов
          </div>
          <h1 className="text-2xl font-bold mt-2">Редактирование тарифов</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Здесь меняются названия, описание, привязка к продукту и публичная видимость.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div className="rounded-2xl border border-border bg-secondary/20 px-4 py-3 text-sm">{statusMessage}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Тариф витрины</label>
          <Badge variant="outline">{canManage ? "main admin" : "read only"}</Badge>
        </div>
        <select
          value={selectedCode}
          onChange={(event) => setSelectedCode(event.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {(catalog?.tariffs || []).map((item) => (
            <option key={item.code} value={item.code}>
              {item.code} — {item.title}
            </option>
          ))}
        </select>

        {selectedTariff ? (
          <div className="rounded-2xl border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
            Runtime: окно {selectedTariff.requestWindowHours ? `${selectedTariff.requestWindowHours} ч` : "без лимита"},
            сравнение {selectedTariff.comparePlayersLimit ? `до ${selectedTariff.comparePlayersLimit}` : "без ограничений"},
            ELO {selectedTariff.maxEloSpan ?? "без ограничений"}.
          </div>
        ) : null}

        <div className="space-y-2">
          <label className="text-sm font-medium">Tag</label>
          <Input
            value={tariffFormState.tag}
            onChange={(event) => setTariffFormState((state) => ({ ...state, tag: event.target.value }))}
            disabled={!canManage}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Название</label>
          <Input
            value={tariffFormState.title}
            onChange={(event) => setTariffFormState((state) => ({ ...state, title: event.target.value }))}
            disabled={!canManage}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Описание</label>
          <textarea
            value={tariffFormState.description}
            onChange={(event) => setTariffFormState((state) => ({ ...state, description: event.target.value }))}
            className="flex min-h-[110px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled={!canManage}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Привязанный продукт</label>
            <select
              value={tariffFormState.productId}
              onChange={(event) => setTariffFormState((state) => ({ ...state, productId: event.target.value }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
            <label className="text-sm font-medium">Порядок</label>
            <Input
              type="number"
              value={tariffFormState.order}
              onChange={(event) => setTariffFormState((state) => ({ ...state, order: Number(event.target.value) || 0 }))}
              disabled={!canManage}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Публичность</label>
          <select
            value={tariffFormState.visible ? "visible" : "hidden"}
            onChange={(event) => setTariffFormState((state) => ({ ...state, visible: event.target.value === "visible" }))}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled={!canManage}
          >
            <option value="visible">visible</option>
            <option value="hidden">hidden</option>
          </select>
        </div>

        <Button type="submit" className="w-full" disabled={!canManage || submitting}>
          {submitting ? "Сохраняю..." : "Сохранить витрину тарифа"}
        </Button>
      </form>
    </div>
  )
}
