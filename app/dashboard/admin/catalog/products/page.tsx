"use client"

import type { FormEvent } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import {
  fetchAdminCatalog,
  patchCatalogProduct,
  readStoredSiteToken,
  type SiteCatalogProduct,
  type SiteCatalogResponse,
} from "@/lib/site-api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Package, Eye, Star, DollarSign, ListOrdered, Hash, Tag, FileText, UserCheck, Upload, Database, Clock, GitBranch } from "lucide-react"

type UploadLog = {
  fileName: string
  uploadedAt: string
  version: string
}

function formatLogDate(value: string) {
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const PRODUCT_ICON_OPTIONS = ["Settings2", "Target", "Shield", "Layers"]

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

function arrayToLines(values: string[]) {
  return values.join("\n")
}

function linesToArray(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export default function CatalogProductsPage() {
  const router = useRouter()
  const { ready, user } = useAuth()
  const [catalog, setCatalog] = useState<SiteCatalogResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [statusType, setStatusType] = useState<"success" | "error" | "info">("info")
  const [selectedProductId, setSelectedProductId] = useState("")
  const [productFormState, setProductFormState] = useState(createEmptyProductFormState())
  const dbInputRef = useRef<HTMLInputElement>(null)
  const scoutInputRef = useRef<HTMLInputElement>(null)
  const [dbLog, setDbLog] = useState<UploadLog | null>(null)
  const [scoutLog, setScoutLog] = useState<UploadLog | null>(null)

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
        if (payload.products.length) {
          setSelectedProductId(payload.products[0].id)
        }
      })
      .catch(() => {
        setStatus("Не удалось загрузить каталог.", "error")
      })
      .finally(() => setLoading(false))
  }, [user])

  const selectedProduct = useMemo(
    () => catalog?.products.find((item) => item.id === selectedProductId) || null,
    [catalog, selectedProductId]
  )

  useEffect(() => {
    if (!selectedProduct) return
    setProductFormState({
      tag: selectedProduct.tag,
      name: selectedProduct.name,
      description: selectedProduct.description,
      forWhom: selectedProduct.forWhom,
      tariffCode: selectedProduct.tariffCode || "",
      priceRub: String(selectedProduct.priceRub),
      priceUsd: String(selectedProduct.priceUsd),
      icon: selectedProduct.icon,
      visible: selectedProduct.visible,
      popular: selectedProduct.popular,
      order: selectedProduct.order,
      benefits: arrayToLines(selectedProduct.benefits),
      features: arrayToLines(selectedProduct.features),
    })
  }, [selectedProduct])

  const setStatus = (msg: string, type: "success" | "error" | "info" = "info") => {
    setStatusMessage(msg)
    setStatusType(type)
  }

  const isScoutScope = useMemo(() => {
    const code = productFormState.tariffCode
    if (!code) return false
    const tariff = catalog?.tariffs.find((item) => item.code === code)
    const haystack = `${code} ${tariff?.title ?? ""}`.toLowerCase()
    return haystack.includes("scoutscope") || haystack.includes("scoute scope")
  }, [catalog, productFormState.tariffCode])

  const nextVersion = (current: UploadLog | null) => {
    const base = current ? Number(current.version.replace(/^v/, "")) || 0 : 0
    return `v${base + 1}`
  }

  const handleUpload = (
    event: FormEvent<HTMLInputElement>,
    setter: (log: UploadLog) => void,
    current: UploadLog | null,
    label: string
  ) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return
    setter({
      fileName: file.name,
      uploadedAt: new Date().toISOString(),
      version: nextVersion(current),
    })
    setStatus(`${label}: файл "${file.name}" загружен.`, "success")
    ;(event.target as HTMLInputElement).value = ""
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedProduct) return
    if (!canManage) {
      setStatus("Только main admin может менять витрину продуктов.", "error")
      return
    }
    const token = readStoredSiteToken()
    if (!token) {
      setStatus("Нет активной admin-сессии.", "error")
      return
    }

    setSubmitting(true)
    try {
      const payload = await patchCatalogProduct(token, selectedProduct.id, {
        tag: productFormState.tag,
        name: productFormState.name,
        description: productFormState.description,
        forWhom: productFormState.forWhom,
        tariffCode: productFormState.tariffCode,
        priceRub: Number(productFormState.priceRub) || 0,
        priceUsd: Number(productFormState.priceUsd) || 0,
        icon: productFormState.icon,
        visible: productFormState.visible,
        popular: productFormState.popular,
        order: Number(productFormState.order) || 0,
        benefits: linesToArray(productFormState.benefits),
        features: linesToArray(productFormState.features),
      })
      setCatalog(payload.catalog)
      const updated = payload.item as SiteCatalogProduct
      setProductFormState({
        tag: updated.tag,
        name: updated.name,
        description: updated.description,
        forWhom: updated.forWhom,
        tariffCode: updated.tariffCode || "",
        priceRub: String(updated.priceRub),
        priceUsd: String(updated.priceUsd),
        icon: updated.icon,
        visible: updated.visible,
        popular: updated.popular,
        order: updated.order,
        benefits: arrayToLines(updated.benefits),
        features: arrayToLines(updated.features),
      })
      setStatus(`Продукт "${updated.name}" обновлён.`, "success")
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Не удалось обновить продукт.", "error")
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
      <div className="fixed top-0 left-1/4 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 h-[350px] w-[350px] rounded-full bg-primary/5 blur-[170px] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-3 sm:px-4 py-6 md:py-12 max-w-4xl">
        {/* ─── Hero Header ─── */}
        <div className="relative mb-6 md:mb-8 overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-5 sm:p-8">
          <div className="absolute top-0 right-0 h-32 w-32 translate-x-1/4 -translate-y-1/4 rounded-full bg-primary/20 blur-[80px]" />
          <div className="flex items-start gap-3 sm:gap-4">
            <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/admin")} className="shrink-0 bg-background/50 backdrop-blur-sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 sm:px-4 py-1.5 text-xs font-semibold text-primary mb-2 md:mb-3">
                <Package className="h-3.5 w-3.5" />
                Каталог продуктов
              </div>
              <h1 className="text-xl sm:text-2xl font-bold md:text-3xl">Редактирование продуктов</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {canManage
                  ? "Описание, цены, фичи, иконка, видимость и связанный тариф."
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
          {/* Product selector */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <h2 className="text-base font-bold">Выбор продукта</h2>
              </div>
              <Badge variant="outline" className={canManage ? "border-primary/20 bg-primary/5 text-primary" : ""}>
                {canManage ? "main admin" : "read only"}
              </Badge>
            </div>
            <select
              value={selectedProductId}
              onChange={(event) => setSelectedProductId(event.target.value)}
              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            >
              {(catalog?.products || []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.id} — {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* Загрузка данных ScoutScope */}
          {isScoutScope && (
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  <h2 className="text-base font-bold">Данные ScoutScope</h2>
                </div>
                <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                  {selectedProduct?.name}
                </Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="gap-2 rounded-xl border border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() => dbInputRef.current?.click()}
                  disabled={!canManage}
                >
                  <Upload className="h-4 w-4" />
                  Загрузить базу
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="gap-2 rounded-xl border border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() => scoutInputRef.current?.click()}
                  disabled={!canManage}
                >
                  <Upload className="h-4 w-4" />
                  Загрузить ScoutScope
                </Button>
                <input
                  ref={dbInputRef}
                  type="file"
                  className="hidden"
                  accept=".json,.csv,.xlsx"
                  onChange={(event) => handleUpload(event, setDbLog, dbLog, "База")}
                />
                <input
                  ref={scoutInputRef}
                  type="file"
                  className="hidden"
                  accept=".json,.csv,.xlsx"
                  onChange={(event) => handleUpload(event, setScoutLog, scoutLog, "ScoutScope")}
                />
              </div>

              {/* Логи */}
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <UploadLogCard title="База игроков" log={dbLog} />
                <UploadLogCard title="ScoutScope" log={scoutLog} />
              </div>
            </div>
          )}

          {/* Основная информация */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold">Основная информация</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-sm font-medium">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  Tag
                </label>
                <Input
                  value={productFormState.tag}
                  onChange={(event) => setProductFormState((state) => ({ ...state, tag: event.target.value }))}
                  disabled={!canManage}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-sm font-medium">
                  <Package className="h-3.5 w-3.5 text-muted-foreground" />
                  Название
                </label>
                <Input
                  value={productFormState.name}
                  onChange={(event) => setProductFormState((state) => ({ ...state, name: event.target.value }))}
                  disabled={!canManage}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <label className="flex items-center gap-1.5 text-sm font-medium">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                Описание
              </label>
              <textarea
                value={productFormState.description}
                onChange={(event) => setProductFormState((state) => ({ ...state, description: event.target.value }))}
                className="flex min-h-[100px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                disabled={!canManage}
              />
            </div>

            <div className="mt-5 space-y-2">
              <label className="flex items-center gap-1.5 text-sm font-medium">
                <UserCheck className="h-3.5 w-3.5 text-muted-foreground" />
                Для кого
              </label>
              <Input
                value={productFormState.forWhom}
                onChange={(event) => setProductFormState((state) => ({ ...state, forWhom: event.target.value }))}
                disabled={!canManage}
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Цены и настройки */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <DollarSign className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold">Цены и настройки</h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-sm font-medium">
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                  Цена RUB
                </label>
                <Input
                  type="number"
                  value={productFormState.priceRub}
                  onChange={(event) => setProductFormState((state) => ({ ...state, priceRub: event.target.value }))}
                  disabled={!canManage}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-sm font-medium">
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                  Цена USD
                </label>
                <Input
                  type="number"
                  value={productFormState.priceUsd}
                  onChange={(event) => setProductFormState((state) => ({ ...state, priceUsd: event.target.value }))}
                  disabled={!canManage}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-sm font-medium">
                  <ListOrdered className="h-3.5 w-3.5 text-muted-foreground" />
                  Порядок
                </label>
                <Input
                  type="number"
                  value={productFormState.order}
                  onChange={(event) => setProductFormState((state) => ({ ...state, order: Number(event.target.value) || 0 }))}
                  disabled={!canManage}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-sm font-medium">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                  Связанный тариф
                </label>
                <select
                  value={productFormState.tariffCode}
                  onChange={(event) => setProductFormState((state) => ({ ...state, tariffCode: event.target.value }))}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  disabled={!canManage}
                >
                  <option value="">—</option>
                  {(catalog?.tariffs || []).map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.code} — {item.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-sm font-medium">
                  <Package className="h-3.5 w-3.5 text-muted-foreground" />
                  Иконка
                </label>
                <select
                  value={productFormState.icon}
                  onChange={(event) => setProductFormState((state) => ({ ...state, icon: event.target.value }))}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  disabled={!canManage}
                >
                  {PRODUCT_ICON_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-sm font-medium">
                  <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                  Публичность
                </label>
                <select
                  value={productFormState.visible ? "visible" : "hidden"}
                  onChange={(event) => setProductFormState((state) => ({ ...state, visible: event.target.value === "visible" }))}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  disabled={!canManage}
                >
                  <option value="visible">visible</option>
                  <option value="hidden">hidden</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-sm font-medium">
                  <Star className="h-3.5 w-3.5 text-muted-foreground" />
                  Статус
                </label>
                <select
                  value={productFormState.popular ? "popular" : "regular"}
                  onChange={(event) => setProductFormState((state) => ({ ...state, popular: event.target.value === "popular" }))}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  disabled={!canManage}
                >
                  <option value="regular">regular</option>
                  <option value="popular">popular</option>
                </select>
              </div>
            </div>
          </div>

          {/* Преимущества и фичи */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-primary" />
                <h2 className="text-base font-bold">Преимущества</h2>
              </div>
              <textarea
                value={productFormState.benefits}
                onChange={(event) => setProductFormState((state) => ({ ...state, benefits: event.target.value }))}
                className="flex min-h-[140px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                disabled={!canManage}
                placeholder="Одна строка = одно преимущество"
              />
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-base font-bold">Фичи</h2>
              </div>
              <textarea
                value={productFormState.features}
                onChange={(event) => setProductFormState((state) => ({ ...state, features: event.target.value }))}
                className="flex min-h-[140px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                disabled={!canManage}
                placeholder="Одна строка = одна фича"
              />
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
              "Сохранить продукт"
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

function UploadLogCard({ title, log }: { title: string; log: UploadLog | null }) {
  return (
    <div className="rounded-xl border border-border/60 bg-secondary/20 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">
        {title}
      </p>
      {log ? (
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>Дата загрузки:</span>
            <span className="font-medium text-foreground">{formatLogDate(log.uploadedAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <GitBranch className="h-3.5 w-3.5 text-primary" />
            <span>Версия:</span>
            <span className="font-medium text-foreground">{log.version}</span>
          </div>
          <p className="truncate text-xs text-muted-foreground">{log.fileName}</p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Загрузок ещё не было.</p>
      )}
    </div>
  )
}
