"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type UserRole = "user" | "admin"

export type User = {
  id: string
  name: string
  email: string
  registeredAt: string
  role: UserRole
  blocked: boolean
}

export type Subscription = {
  id: string
  userId: string
  productId: string
  productName: string
  tariff: string // "1 мес." / "3 мес." / "6 мес."
  months: number
  price: number
  paidAt: string
  expiresAt: string
  icon: string
  active: boolean
}

type Credential = { userId: string; password: string }

type StoredData = {
  currentUserId: string | null
  users: User[]
  credentials: Credential[]
  subscriptions: Subscription[]
  schemaVersion: number
}

type AuthContextType = {
  user: User | null
  subscriptions: Subscription[] // current user's subs
  allUsers: User[] // admin only
  allSubscriptions: Subscription[] // admin only
  login: (email: string, password: string) => { ok: boolean; error?: string }
  register: (name: string, email: string, password: string) => { ok: boolean; error?: string }
  logout: () => void
  changePassword: (oldPassword: string, newPassword: string) => boolean
  updateNickname: (nickname: string) => boolean
  updateEmail: (email: string) => { ok: boolean; error?: string }
  terminateSessions: () => void
  purchaseProduct: (productId: string, tariff: string) => Subscription | null
  // Admin actions
  adminToggleBlockUser: (userId: string) => void
  adminToggleAdmin: (userId: string) => void
  adminDeleteUser: (userId: string) => void
  adminDeleteSubscription: (subId: string) => void
  adminToggleSubscriptionActive: (subId: string) => void
  adminExtendSubscription: (subId: string, addMonths: number) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

const STORAGE_KEY = "twizz_auth_v2"
const SCHEMA_VERSION = 2

const ADMIN_EMAIL = "admin@twizz.local"
const ADMIN_PASSWORD = "admin123"

function emptyStore(): StoredData {
  return {
    currentUserId: null,
    users: [],
    credentials: [],
    subscriptions: [],
    schemaVersion: SCHEMA_VERSION,
  }
}

function seedAdmin(store: StoredData): StoredData {
  if (store.users.some((u) => u.role === "admin")) return store
  const adminId =
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "admin-seed"
  const admin: User = {
    id: adminId,
    name: "Admin",
    email: ADMIN_EMAIL,
    registeredAt: new Date().toISOString(),
    role: "admin",
    blocked: false,
  }
  return {
    ...store,
    users: [...store.users, admin],
    credentials: [...store.credentials, { userId: adminId, password: ADMIN_PASSWORD }],
  }
}

function getStored(): StoredData {
  if (typeof window === "undefined") return emptyStore()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as StoredData
      if (parsed.schemaVersion === SCHEMA_VERSION) {
        return seedAdmin(parsed)
      }
    }
  } catch {}
  // Cleanup legacy keys
  try {
    localStorage.removeItem("twizz_auth")
  } catch {}
  return seedAdmin(emptyStore())
}

function setStored(data: StoredData) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

const productMeta: Record<string, { name: string; icon: string }> = {
  "performancecoach-crm": { name: "PerformanceCoach CRM", icon: "Settings2" },
  "scoutscope-basic": { name: "ScoutScope Basic", icon: "Target" },
  "scoutscope-pro": { name: "ScoutScope Pro", icon: "Shield" },
  "performancecoach-scoutscope": { name: "PerformanceCoach CRM + ScoutScope", icon: "Layers" },
}

function monthsFromTariff(tariff: string): number {
  if (tariff.includes("6")) return 6
  if (tariff.includes("3")) return 3
  return 1
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [store, setStoreState] = useState<StoredData>(emptyStore())
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setStoreState(getStored())
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    setStored(store)
  }, [store, loaded])

  const user = store.users.find((u) => u.id === store.currentUserId) ?? null
  const subscriptions = user ? store.subscriptions.filter((s) => s.userId === user.id) : []

  const login = (email: string, password: string) => {
    const normEmail = email.trim().toLowerCase()
    const target = store.users.find((u) => u.email.toLowerCase() === normEmail)
    if (!target) return { ok: false, error: "Неверный email или пароль" }
    if (target.blocked) return { ok: false, error: "Аккаунт заблокирован администратором" }
    const cred = store.credentials.find((c) => c.userId === target.id && c.password === password)
    if (!cred) return { ok: false, error: "Неверный email или пароль" }
    setStoreState((s) => ({ ...s, currentUserId: target.id }))
    return { ok: true }
  }

  const register = (name: string, email: string, password: string) => {
    const normEmail = email.trim().toLowerCase()
    if (store.users.some((u) => u.email.toLowerCase() === normEmail)) {
      return { ok: false, error: "Пользователь с таким email уже существует" }
    }
    const id = crypto.randomUUID()
    const newUser: User = {
      id,
      name: name.trim() || normEmail.split("@")[0],
      email: normEmail,
      registeredAt: new Date().toISOString(),
      role: "user",
      blocked: false,
    }
    setStoreState((s) => ({
      ...s,
      users: [...s.users, newUser],
      credentials: [...s.credentials, { userId: id, password }],
      currentUserId: id,
    }))
    return { ok: true }
  }

  const logout = () => setStoreState((s) => ({ ...s, currentUserId: null }))

  const changePassword = (oldPassword: string, newPassword: string) => {
    if (!user) return false
    const cred = store.credentials.find((c) => c.userId === user.id)
    if (!cred || cred.password !== oldPassword) return false
    setStoreState((s) => ({
      ...s,
      credentials: s.credentials.map((c) =>
        c.userId === user.id ? { ...c, password: newPassword } : c
      ),
    }))
    return true
  }

  const updateNickname = (nickname: string) => {
    if (!user) return false
    const trimmed = nickname.trim()
    if (!trimmed) return false
    setStoreState((s) => ({
      ...s,
      users: s.users.map((u) => (u.id === user.id ? { ...u, name: trimmed } : u)),
    }))
    return true
  }

  const updateEmail = (email: string) => {
    if (!user) return { ok: false, error: "Не авторизован" }
    const trimmed = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return { ok: false, error: "Некорректный email" }
    }
    if (trimmed === user.email) return { ok: true }
    if (store.users.some((u) => u.id !== user.id && u.email.toLowerCase() === trimmed)) {
      return { ok: false, error: "Этот email уже используется" }
    }
    setStoreState((s) => ({
      ...s,
      users: s.users.map((u) => (u.id === user.id ? { ...u, email: trimmed } : u)),
    }))
    return { ok: true }
  }

  const terminateSessions = () => {
    // frontend-only stub
  }

  const purchaseProduct = (productId: string, tariff: string): Subscription | null => {
    if (!user) return null
    const meta = productMeta[productId]
    if (!meta) return null
    const months = monthsFromTariff(tariff)
    const now = new Date()
    const expires = new Date(now)
    expires.setMonth(expires.getMonth() + months)

    const sub: Subscription = {
      id: crypto.randomUUID(),
      userId: user.id,
      productId,
      productName: meta.name,
      tariff,
      months,
      price: 0,
      paidAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      icon: meta.icon,
      active: true,
    }
    setStoreState((s) => ({ ...s, subscriptions: [...s.subscriptions, sub] }))
    return sub
  }

  // ---------- Admin ----------
  const adminToggleBlockUser = (userId: string) => {
    setStoreState((s) => ({
      ...s,
      users: s.users.map((u) => (u.id === userId ? { ...u, blocked: !u.blocked } : u)),
      // If blocking currently logged-in user, log out
      currentUserId:
        s.currentUserId === userId && !s.users.find((u) => u.id === userId)?.blocked
          ? null
          : s.currentUserId,
    }))
  }

  const adminToggleAdmin = (userId: string) => {
    setStoreState((s) => ({
      ...s,
      users: s.users.map((u) =>
        u.id === userId ? { ...u, role: u.role === "admin" ? "user" : "admin" } : u
      ),
    }))
  }

  const adminDeleteUser = (userId: string) => {
    setStoreState((s) => ({
      ...s,
      users: s.users.filter((u) => u.id !== userId),
      credentials: s.credentials.filter((c) => c.userId !== userId),
      subscriptions: s.subscriptions.filter((sub) => sub.userId !== userId),
      currentUserId: s.currentUserId === userId ? null : s.currentUserId,
    }))
  }

  const adminDeleteSubscription = (subId: string) => {
    setStoreState((s) => ({ ...s, subscriptions: s.subscriptions.filter((sub) => sub.id !== subId) }))
  }

  const adminToggleSubscriptionActive = (subId: string) => {
    setStoreState((s) => ({
      ...s,
      subscriptions: s.subscriptions.map((sub) =>
        sub.id === subId ? { ...sub, active: !sub.active } : sub
      ),
    }))
  }

  const adminExtendSubscription = (subId: string, addMonths: number) => {
    setStoreState((s) => ({
      ...s,
      subscriptions: s.subscriptions.map((sub) => {
        if (sub.id !== subId) return sub
        const newExpires = new Date(sub.expiresAt)
        newExpires.setMonth(newExpires.getMonth() + addMonths)
        return { ...sub, expiresAt: newExpires.toISOString() }
      }),
    }))
  }

  if (!loaded) return null

  return (
    <AuthContext.Provider
      value={{
        user,
        subscriptions,
        allUsers: store.users,
        allSubscriptions: store.subscriptions,
        login,
        register,
        logout,
        changePassword,
        updateNickname,
        updateEmail,
        terminateSessions,
        purchaseProduct,
        adminToggleBlockUser,
        adminToggleAdmin,
        adminDeleteUser,
        adminDeleteSubscription,
        adminToggleSubscriptionActive,
        adminExtendSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
