"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  clearStoredSiteToken,
  deleteUser as deleteUserApi,
  fetchAdminUsers,
  fetchCurrentSiteUser,
  fetchUserTariffHistory,
  loginSiteUser,
  patchUserAccess,
  patchUserTariff,
  readStoredSiteToken,
  registerSiteUser,
  writeStoredSiteToken,
  type SiteTariffHistoryItem,
  type SiteUserPayload,
} from "@/lib/site-api"

export type UserRole = "user" | "admin"

export type User = {
  id: string
  login: string
  name: string
  email: string
  registeredAt: string
  lastLoginAt: string | null
  role: UserRole
  blocked: boolean
  tariffCode: string
  tariffTitle: string
  tariffStatus: string
  tariffGrantedAt: string | null
  tariffStartsAt: string | null
  tariffExpiresAt: string | null
  tariffDaysLeft: number | null
  isTariffExpired: boolean
  siteRole: string
}

export type Subscription = {
  id: string
  userId: string
  productId: string
  productName: string
  tariff: string
  months: number
  price: number
  paidAt: string
  expiresAt: string
  icon: string
  active: boolean
}

type AuthResult = {
  ok: boolean
  error?: string
}

type RegisterPayload = {
  login: string
  name: string
  email: string
  password: string
  tariffCode: string
}

type TariffPatchPayload = {
  tariffCode: string
  tariffStatus: string
  startsAt?: string | null
  expiresAt?: string | null
  note?: string
}

type AccessPatchPayload = {
  siteRole: string
  isActive: boolean
  note?: string
}

type AuthContextType = {
  ready: boolean
  loading: boolean
  user: User | null
  subscriptions: Subscription[]
  allUsers: User[]
  allSubscriptions: Subscription[]
  login: (loginOrEmail: string, password: string) => Promise<AuthResult>
  register: (payload: RegisterPayload) => Promise<AuthResult>
  logout: () => void
  refreshUser: () => Promise<void>
  refreshAdminData: () => Promise<void>
  loadTariffHistory: (userId: string, limit?: number) => Promise<SiteTariffHistoryItem[]>
  updateUserTariff: (userId: string, payload: TariffPatchPayload) => Promise<AuthResult>
  updateUserAccess: (userId: string, payload: AccessPatchPayload) => Promise<AuthResult>
  deleteUser: (userId: string) => Promise<AuthResult>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

function isAdminUser(payload: SiteUserPayload | User | null) {
  if (!payload) return false
  const siteRole = String("siteRole" in payload ? payload.siteRole : "").trim().toLowerCase()
  return siteRole === "admin" || siteRole === "main_admin"
}

function mapUser(payload: SiteUserPayload): User {
  return {
    id: String(payload.id || ""),
    login: String(payload.login || ""),
    name: String(payload.name || payload.login || ""),
    email: String(payload.email || ""),
    registeredAt: String(payload.registeredAt || payload.createdAt || new Date().toISOString()),
    lastLoginAt: payload.lastLoginAt || null,
    role: isAdminUser(payload) ? "admin" : "user",
    blocked: !payload.isActive,
    tariffCode: String(payload.tariff?.code || "base"),
    tariffTitle: String(payload.tariff?.title || "Base"),
    tariffStatus: String(payload.tariff?.status || "inactive"),
    tariffGrantedAt: payload.tariff?.grantedAt || null,
    tariffStartsAt: payload.tariff?.startsAt || null,
    tariffExpiresAt: payload.tariff?.expiresAt || null,
    tariffDaysLeft: typeof payload.tariff?.daysLeft === "number" ? payload.tariff.daysLeft : null,
    isTariffExpired: Boolean(payload.tariff?.isExpired),
    siteRole: String(payload.siteRole || "user"),
  }
}

function iconForTariff(tariffCode: string) {
  if (tariffCode === "pro" || tariffCode === "admin") return "Shield"
  if (tariffCode === "manager") return "Layers"
  return "Target"
}

function productIdForTariff(tariffCode: string) {
  if (tariffCode === "pro" || tariffCode === "admin") return "scoutscope-pro"
  if (tariffCode === "manager") return "performancecoach-scoutscope"
  return "scoutscope-basic"
}

function productNameForTariff(user: User) {
  if (user.tariffCode === "admin") return "Admin Access"
  if (user.tariffCode === "manager") return "Manager"
  if (user.tariffCode === "pro") return "ScoutScope Pro"
  return "ScoutScope Basic"
}

function monthsBetween(start: string | null, end: string | null) {
  if (!start || !end) return 0
  const startDate = new Date(start)
  const endDate = new Date(end)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return 0
  const diffMonths =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth())
  return Math.max(0, diffMonths || 1)
}

function mapSubscriptions(users: User[]) {
  return users
    .filter((user) => user.tariffCode)
    .map<Subscription>((user) => ({
      id: `tariff-${user.id}`,
      userId: user.id,
      productId: productIdForTariff(user.tariffCode),
      productName: productNameForTariff(user),
      tariff: user.tariffTitle,
      months: monthsBetween(user.tariffStartsAt, user.tariffExpiresAt),
      price: 0,
      paidAt: user.tariffGrantedAt || user.registeredAt,
      expiresAt: user.tariffExpiresAt || user.registeredAt,
      icon: iconForTariff(user.tariffCode),
      active: !user.blocked && user.tariffStatus === "active" && !user.isTariffExpired,
    }))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState("")
  const [user, setUser] = useState<User | null>(null)
  const [allUsers, setAllUsers] = useState<User[]>([])

  const logout = useCallback(() => {
    clearStoredSiteToken()
    setToken("")
    setUser(null)
    setAllUsers([])
  }, [])

  const refreshAdminData = useCallback(
    async (overrideToken?: string) => {
      const effectiveToken = overrideToken || token
      if (!effectiveToken || !isAdminUser(user)) {
        setAllUsers([])
        return
      }
      const payload = await fetchAdminUsers(effectiveToken, { limit: 200, offset: 0 })
      setAllUsers(payload.items.map(mapUser))
    },
    [token, user]
  )

  const refreshUser = useCallback(
    async (overrideToken?: string) => {
      const effectiveToken = overrideToken || token
      if (!effectiveToken) {
        setUser(null)
        setAllUsers([])
        return
      }
      const payload = await fetchCurrentSiteUser(effectiveToken)
      const nextUser = mapUser(payload.user)
      setUser(nextUser)
      if (isAdminUser(nextUser)) {
        const adminPayload = await fetchAdminUsers(effectiveToken, { limit: 200, offset: 0 })
        setAllUsers(adminPayload.items.map(mapUser))
      } else {
        setAllUsers([])
      }
    },
    [token]
  )

  useEffect(() => {
    let active = true

    async function bootstrap() {
      const storedToken = readStoredSiteToken()
      if (!storedToken) {
        if (!active) return
        setReady(true)
        setLoading(false)
        return
      }

      try {
        if (!active) return
        setToken(storedToken)
        const payload = await fetchCurrentSiteUser(storedToken)
        if (!active) return
        const nextUser = mapUser(payload.user)
        setUser(nextUser)
        if (isAdminUser(nextUser)) {
          const adminPayload = await fetchAdminUsers(storedToken, { limit: 200, offset: 0 })
          if (!active) return
          setAllUsers(adminPayload.items.map(mapUser))
        }
      } catch {
        if (active) {
          logout()
        }
      } finally {
        if (active) {
          setReady(true)
          setLoading(false)
        }
      }
    }

    bootstrap()

    return () => {
      active = false
    }
  }, [logout])

  const login = useCallback(async (loginOrEmail: string, password: string) => {
    try {
      setLoading(true)
      const payload = await loginSiteUser(loginOrEmail, password)
      writeStoredSiteToken(payload.token)
      setToken(payload.token)
      const nextUser = mapUser(payload.user)
      setUser(nextUser)
      if (isAdminUser(nextUser)) {
        const adminPayload = await fetchAdminUsers(payload.token, { limit: 200, offset: 0 })
        setAllUsers(adminPayload.items.map(mapUser))
      } else {
        setAllUsers([])
      }
      return { ok: true }
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Login failed.",
      }
    } finally {
      setReady(true)
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    try {
      setLoading(true)
      const response = await registerSiteUser(payload)
      writeStoredSiteToken(response.token)
      setToken(response.token)
      const nextUser = mapUser(response.user)
      setUser(nextUser)
      if (isAdminUser(nextUser)) {
        const adminPayload = await fetchAdminUsers(response.token, { limit: 200, offset: 0 })
        setAllUsers(adminPayload.items.map(mapUser))
      } else {
        setAllUsers([])
      }
      return { ok: true }
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Registration failed.",
      }
    } finally {
      setReady(true)
      setLoading(false)
    }
  }, [])

  const loadTariffHistory = useCallback(
    async (userId: string, limit = 20) => {
      if (!token) return []
      const payload = await fetchUserTariffHistory(token, userId, limit)
      return payload.items || []
    },
    [token]
  )

  const updateUserTariff = useCallback(
    async (userId: string, payload: TariffPatchPayload) => {
      if (!token) {
        return { ok: false, error: "No active admin session." }
      }
      try {
        const response = await patchUserTariff(token, userId, payload)
        const updated = mapUser(response.user)
        setAllUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)))
        return { ok: true }
      } catch (error) {
        return {
          ok: false,
          error: error instanceof Error ? error.message : "Failed to update tariff.",
        }
      }
    },
    [token]
  )

  const updateUserAccess = useCallback(
    async (userId: string, payload: AccessPatchPayload) => {
      if (!token) {
        return { ok: false, error: "No active admin session." }
      }
      try {
        const response = await patchUserAccess(token, userId, payload)
        const updated = mapUser(response.user)
        setAllUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)))
        return { ok: true }
      } catch (error) {
        return {
          ok: false,
          error: error instanceof Error ? error.message : "Failed to update account access.",
        }
      }
    },
    [token]
  )

  const deleteUser = useCallback(
    async (userId: string) => {
      if (!token) {
        return { ok: false, error: "No active admin session." }
      }
      try {
        await deleteUserApi(token, userId)
        setAllUsers((prev) => prev.filter((u) => u.id !== userId))
        return { ok: true }
      } catch (error) {
        return {
          ok: false,
          error: error instanceof Error ? error.message : "Failed to delete user.",
        }
      }
    },
    [token]
  )

  const subscriptions = useMemo(() => (user ? mapSubscriptions([user]) : []), [user])
  const allSubscriptions = useMemo(() => mapSubscriptions(allUsers), [allUsers])

  return (
    <AuthContext.Provider
      value={{
        ready,
        loading,
        user,
        subscriptions,
        allUsers,
        allSubscriptions,
        login,
        register,
        logout,
        refreshUser: () => refreshUser(),
        refreshAdminData: () => refreshAdminData(),
        loadTariffHistory,
        updateUserTariff,
        updateUserAccess,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
