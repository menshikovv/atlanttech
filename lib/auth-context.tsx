"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type User = {
  id: string
  name: string
  email: string
  registeredAt: string
}

export type License = {
  id: string
  productName: string
  tariff: string
  key: string
  issuedAt: string
  expiresAt: string
  active: boolean
}

export type PurchasedProduct = {
  id: string
  productName: string
  tariff: string
  price: number
  key: string
  expiresAt: string
  icon: string
}

type AuthContextType = {
  user: User | null
  licenses: License[]
  purchasedProducts: PurchasedProduct[]
  login: (email: string, password: string) => boolean
  register: (name: string, email: string, password: string) => boolean
  logout: () => void
  changePassword: (oldPassword: string, newPassword: string) => boolean
  updateNickname: (nickname: string) => boolean
  updateEmail: (email: string) => { ok: boolean; error?: string }
  terminateSessions: () => void
  purchaseProduct: (productId: string, tariff: string) => PurchasedProduct | null
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

const STORAGE_KEY = "twizz_auth"

type StoredData = {
  user: User | null
  credentials: { email: string; password: string }[]
  licenses: License[]
  purchasedProducts: PurchasedProduct[]
}

function getStored(): StoredData {
  if (typeof window === "undefined") return { user: null, credentials: [], licenses: [], purchasedProducts: [] }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { user: null, credentials: [], licenses: [], purchasedProducts: [] }
}

function setStored(data: StoredData) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function generateKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  const segments = 4
  const segLen = 4
  const parts: string[] = []
  for (let s = 0; s < segments; s++) {
    let seg = ""
    for (let i = 0; i < segLen; i++) {
      seg += chars[Math.floor(Math.random() * chars.length)]
    }
    parts.push(seg)
  }
  return parts.join("-")
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [credentials, setCredentials] = useState<{ email: string; password: string }[]>([])
  const [licenses, setLicenses] = useState<License[]>([])
  const [purchasedProducts, setPurchasedProducts] = useState<PurchasedProduct[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const data = getStored()
    setUser(data.user)
    setCredentials(data.credentials)
    setLicenses(data.licenses)
    setPurchasedProducts(data.purchasedProducts)
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    setStored({ user, credentials, licenses, purchasedProducts })
  }, [user, credentials, licenses, purchasedProducts, loaded])

  const login = (email: string, password: string): boolean => {
    const cred = credentials.find((c) => c.email === email && c.password === password)
    if (!cred) return false
    const stored = getStored()
    const existingUser = stored.user?.email === email ? stored.user : null
    if (existingUser) {
      setUser(existingUser)
    } else {
      setUser({ id: crypto.randomUUID(), name: email.split("@")[0], email, registeredAt: new Date().toISOString() })
    }
    return true
  }

  const register = (name: string, email: string, password: string): boolean => {
    if (credentials.some((c) => c.email === email)) return false
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      registeredAt: new Date().toISOString(),
    }
    setCredentials((prev) => [...prev, { email, password }])
    setUser(newUser)
    return true
  }

  const logout = () => {
    setUser(null)
  }

  const changePassword = (oldPassword: string, newPassword: string): boolean => {
    if (!user) return false
    const idx = credentials.findIndex((c) => c.email === user.email && c.password === oldPassword)
    if (idx === -1) return false
    setCredentials((prev) => prev.map((c, i) => (i === idx ? { ...c, password: newPassword } : c)))
    return true
  }

  const updateNickname = (nickname: string): boolean => {
    if (!user) return false
    const trimmed = nickname.trim()
    if (!trimmed) return false
    setUser({ ...user, name: trimmed })
    return true
  }

  const updateEmail = (email: string): { ok: boolean; error?: string } => {
    if (!user) return { ok: false, error: "Не авторизован" }
    const trimmed = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return { ok: false, error: "Некорректный email" }
    }
    if (trimmed === user.email) return { ok: true }
    if (credentials.some((c) => c.email === trimmed)) {
      return { ok: false, error: "Этот email уже используется" }
    }
    setCredentials((prev) => prev.map((c) => (c.email === user.email ? { ...c, email: trimmed } : c)))
    setUser({ ...user, email: trimmed })
    return { ok: true }
  }

  const terminateSessions = () => {
    // frontend-only stub
  }

  const purchaseProduct = (productId: string, tariff: string): PurchasedProduct | null => {
    if (!user) return null
    const key = generateKey()
    const now = new Date()
    const expires = new Date(now)
    expires.setMonth(expires.getMonth() + (tariff.includes("6") ? 6 : tariff.includes("3") ? 3 : 1))

    const icons: Record<string, string> = {
      "performancecoach-crm": "Settings2",
      "scoutscope-basic": "Target",
      "scoutscope-pro": "Shield",
      "performancecoach-scoutscope": "Layers",
    }

    const names: Record<string, string> = {
      "performancecoach-crm": "PerformanceCoach CRM",
      "scoutscope-basic": "ScoutScope Basic",
      "scoutscope-pro": "ScoutScope Pro",
      "performancecoach-scoutscope": "PerformanceCoach CRM + ScoutScope",
    }

    const purchased: PurchasedProduct = {
      id: crypto.randomUUID(),
      productName: names[productId] || productId,
      tariff,
      price: 0,
      key,
      expiresAt: expires.toISOString(),
      icon: icons[productId] || "Settings2",
    }

    const license: License = {
      id: crypto.randomUUID(),
      productName: purchased.productName,
      tariff,
      key,
      issuedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      active: true,
    }

    setPurchasedProducts((prev) => [...prev, purchased])
    setLicenses((prev) => [...prev, license])
    return purchased
  }

  if (!loaded) return null

  return (
    <AuthContext.Provider
      value={{ user, licenses, purchasedProducts, login, register, logout, changePassword, updateNickname, updateEmail, terminateSessions, purchaseProduct }}
    >
      {children}
    </AuthContext.Provider>
  )
}
