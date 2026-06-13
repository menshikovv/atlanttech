"use client"

export type SiteTariff = {
  code: string
  title: string
  tag?: string
  description?: string
  productId?: string | null
  defaultDays: number
  requestWindowHours: number
  maxEloSpan: number | null
  maxAgeSpan: number | null
  maxResults: number | null
  comparePlayersLimit?: number | null
  unrestricted: boolean
}

export type SiteCatalogTariff = {
  code: string
  tag: string
  title: string
  description: string
  productId: string | null
  visible: boolean
  order: number
  defaultDays: number
  requestWindowHours: number
  maxEloSpan: number | null
  maxAgeSpan: number | null
  maxResults: number | null
  comparePlayersLimit: number | null
  unrestricted: boolean
}

export type SiteCatalogProduct = {
  id: string
  tariffCode: string
  tag: string
  name: string
  description: string
  forWhom: string
  priceRub: number
  priceUsd: number
  benefits: string[]
  features: string[]
  icon: string
  popular: boolean
  visible: boolean
  order: number
}

export type SiteSubscriptionPeriod = {
  label: string
  months: number
  discount: number
}

export type SiteCatalogResponse = {
  version: number
  updatedAt: string
  subscriptionPeriods: SiteSubscriptionPeriod[]
  tariffs: SiteCatalogTariff[]
  products: SiteCatalogProduct[]
}

export type SiteUserPayload = {
  id: string
  login: string
  name: string
  email: string
  isActive: boolean
  isEmailVerified: boolean
  registeredAt: string | null
  lastLoginAt: string | null
  createdAt: string | null
  updatedAt: string | null
  tariff: {
    code: string
    title: string
    status: string
    grantedAt: string | null
    startsAt: string | null
    expiresAt: string | null
    daysLeft: number | null
    isExpired: boolean
  }
  profileMeta?: Record<string, unknown>
  siteRole?: string
}

export type SiteAuthResponse = {
  user: SiteUserPayload
  token: string
  access: {
    tariffActive: boolean
    admin: boolean
  }
}

export type SiteAdminUsersResponse = {
  items: SiteUserPayload[]
  total: number
  limit: number
  offset: number
}

export type SiteTariffHistoryItem = {
  id: string
  userId: string
  tariffCode: string
  tariffStatus: string
  startsAt: string | null
  expiresAt: string | null
  grantedAt: string | null
  source: string
  paymentId: string | null
  note: string | null
  createdAt: string | null
}

type SiteTariffHistoryResponse = {
  items: SiteTariffHistoryItem[]
  count: number
}

type SiteUserMutationResponse = {
  status: string
  user: SiteUserPayload
}

type SiteCatalogMutationResponse = {
  status: string
  item: SiteCatalogTariff | SiteCatalogProduct
  catalog: SiteCatalogResponse
}

export type SiteRobokassaCheckoutResponse = {
  action: string
  method: "POST"
  invoiceId: string
  amountRub: number
  period: SiteSubscriptionPeriod
  product: {
    id: string
    name: string
    tariffCode: string
  }
  fields: Record<string, string>
}

type RequestOptions = {
  body?: unknown
  method?: string
  token?: string | null
}

const API_PREFIX = "https://atlanttech.pro/api/site"
const TOKEN_STORAGE_KEY = "twizz_site_token_v1"

export function readStoredSiteToken() {
  if (typeof window === "undefined") return ""
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY) || ""
  } catch {
    return ""
  }
}

export function writeStoredSiteToken(token: string) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearStoredSiteToken() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(TOKEN_STORAGE_KEY)
}

export class SiteApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "SiteApiError"
    this.status = status
  }
}

async function request<T>(path: string, options: RequestOptions = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`
  }

  const response = await fetch(`${API_PREFIX}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = payload?.error?.message || `Request failed with status ${response.status}`
    throw new SiteApiError(message, response.status)
  }

  return payload as T
}

export async function loginSiteUser(loginOrEmail: string, password: string) {
  return request<SiteAuthResponse>("/auth/login", {
    method: "POST",
    body: {
      loginOrEmail,
      password,
    },
  })
}

export async function registerSiteUser(payload: {
  login: string
  name: string
  email: string
  password: string
  tariffCode: string
}) {
  return request<SiteAuthResponse>("/auth/register", {
    method: "POST",
    body: {
      login: payload.login,
      name: payload.name,
      email: payload.email,
      password: payload.password,
      tariff: payload.tariffCode,
    },
  })
}

export async function fetchCurrentSiteUser(token: string) {
  return request<{ user: SiteUserPayload }>("/auth/me", {
    token,
  })
}

export async function fetchPublicTariffs() {
  return request<{ items: SiteTariff[] }>("/tariffs")
}

export async function fetchPublicCatalog() {
  return request<SiteCatalogResponse>("/catalog")
}

export async function fetchAdminCatalog(token: string) {
  return request<SiteCatalogResponse>("/admin/catalog", {
    token,
  })
}

export async function fetchAdminUsers(
  token: string,
  params: {
    limit?: number
    offset?: number
    search?: string
    tariffCode?: string
  } = {}
) {
  const query = new URLSearchParams()
  query.set("limit", String(params.limit ?? 100))
  query.set("offset", String(params.offset ?? 0))
  if (params.search) query.set("search", params.search)
  if (params.tariffCode) query.set("tariffCode", params.tariffCode)
  return request<SiteAdminUsersResponse>(`/admin/users?${query.toString()}`, {
    token,
  })
}

export async function fetchUserTariffHistory(token: string, userId: string, limit = 20) {
  return request<SiteTariffHistoryResponse>(`/admin/users/${encodeURIComponent(userId)}/tariff-history?limit=${limit}`, {
    token,
  })
}

export async function patchUserTariff(
  token: string,
  userId: string,
  payload: {
    tariffCode: string
    tariffStatus: string
    startsAt?: string | null
    expiresAt?: string | null
    note?: string
  }
) {
  return request<SiteUserMutationResponse>(`/admin/users/${encodeURIComponent(userId)}/tariff`, {
    method: "PATCH",
    token,
    body: payload,
  })
}

export async function patchUserAccess(
  token: string,
  userId: string,
  payload: {
    siteRole: string
    isActive: boolean
    note?: string
  }
) {
  return request<SiteUserMutationResponse>(`/admin/users/${encodeURIComponent(userId)}/access`, {
    method: "PATCH",
    token,
    body: payload,
  })
}

export async function deleteUser(token: string, userId: string) {
  return request<SiteUserMutationResponse>(`/admin/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
    token,
  })
}

export async function patchCatalogTariff(
  token: string,
  tariffCode: string,
  payload: Partial<SiteCatalogTariff>
) {
  return request<SiteCatalogMutationResponse>(`/admin/catalog/tariffs/${encodeURIComponent(tariffCode)}`, {
    method: "PATCH",
    token,
    body: payload,
  })
}

export async function patchCatalogProduct(
  token: string,
  productId: string,
  payload: Partial<SiteCatalogProduct>
) {
  return request<SiteCatalogMutationResponse>(`/admin/catalog/products/${encodeURIComponent(productId)}`, {
    method: "PATCH",
    token,
    body: payload,
  })
}

export async function createRobokassaCheckout(
  token: string,
  payload: {
    productId: string
    months: number
  }
) {
  return request<SiteRobokassaCheckoutResponse>("/payments/robokassa/checkout", {
    method: "POST",
    token,
    body: payload,
  })
}
