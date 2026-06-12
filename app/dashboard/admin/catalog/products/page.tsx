"use client"

import type { FormEvent } from "react"
import { useEffect, useMemo, useState } from "react"
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
import { ArrowLeft, Package } from "lucide-react"

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
  const [selectedProductId, setSelectedProductId] = useState("")
  const [productFormState, setProductFormState] = useState(createEmptyProductFormState())

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
      .catch(() => setStatusMessage("Не удалось загрузить каталог."))
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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedProduct) return
    if (!canManage) {
      setStatusMessage("Только main admin может менять витрину продуктов.")
      return
    }
    const token = readStoredSiteToken()
    if (!token) {
      setStatusMessage("Нет активной admin-сессии.")
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
      setStatusMessage(`Продукт ${selectedProduct.id} обновлен.`)
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Не удалось обновить продукт.")
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
            <Package className="h-3.5 w-3.5" />
            Каталог продуктов
          </div>
          <h1 className="text-2xl font-bold mt-2">Редактирование продуктов</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Можно менять описание, цены, фичи, иконку, видимость и связанный тариф.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div className="rounded-2xl border border-border bg-secondary/20 px-4 py-3 text-sm">{statusMessage}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Продукт</label>
          <Badge variant="outline">{canManage ? "main admin" : "read only"}</Badge>
        </div>
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

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tag</label>
            <Input
              value={productFormState.tag}
              onChange={(event) => setProductFormState((state) => ({ ...state, tag: event.target.value }))}
              disabled={!canManage}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Название</label>
            <Input
              value={productFormState.name}
              onChange={(event) => setProductFormState((state) => ({ ...state, name: event.target.value }))}
              disabled={!canManage}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Описание</label>
          <textarea
            value={productFormState.description}
            onChange={(event) => setProductFormState((state) => ({ ...state, description: event.target.value }))}
            className="flex min-h-[110px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled={!canManage}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Для кого</label>
          <Input
            value={productFormState.forWhom}
            onChange={(event) => setProductFormState((state) => ({ ...state, forWhom: event.target.value }))}
            disabled={!canManage}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Связанный тариф</label>
            <select
              value={productFormState.tariffCode}
              onChange={(event) => setProductFormState((state) => ({ ...state, tariffCode: event.target.value }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={!canManage}
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
              value={productFormState.icon}
              onChange={(event) => setProductFormState((state) => ({ ...state, icon: event.target.value }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Цена RUB</label>
            <Input
              type="number"
              value={productFormState.priceRub}
              onChange={(event) => setProductFormState((state) => ({ ...state, priceRub: event.target.value }))}
              disabled={!canManage}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Цена USD</label>
            <Input
              type="number"
              value={productFormState.priceUsd}
              onChange={(event) => setProductFormState((state) => ({ ...state, priceUsd: event.target.value }))}
              disabled={!canManage}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Порядок</label>
            <Input
              type="number"
              value={productFormState.order}
              onChange={(event) => setProductFormState((state) => ({ ...state, order: Number(event.target.value) || 0 }))}
              disabled={!canManage}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Публичность</label>
            <select
              value={productFormState.visible ? "visible" : "hidden"}
              onChange={(event) => setProductFormState((state) => ({ ...state, visible: event.target.value === "visible" }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={!canManage}
            >
              <option value="visible">visible</option>
              <option value="hidden">hidden</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Статус</label>
            <select
              value={productFormState.popular ? "popular" : "regular"}
              onChange={(event) => setProductFormState((state) => ({ ...state, popular: event.target.value === "popular" }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={!canManage}
            >
              <option value="regular">regular</option>
              <option value="popular">popular</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Преимущества</label>
          <textarea
            value={productFormState.benefits}
            onChange={(event) => setProductFormState((state) => ({ ...state, benefits: event.target.value }))}
            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled={!canManage}
            placeholder="Одна строка = одно преимущество"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Фичи</label>
          <textarea
            value={productFormState.features}
            onChange={(event) => setProductFormState((state) => ({ ...state, features: event.target.value }))}
            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled={!canManage}
            placeholder="Одна строка = одна фича"
          />
        </div>

        <Button type="submit" className="w-full" disabled={!canManage || submitting}>
          {submitting ? "Сохраняю..." : "Сохранить продукт"}
        </Button>
      </form>
    </div>
  )
}
