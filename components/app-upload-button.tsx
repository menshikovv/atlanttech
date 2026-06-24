"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { readStoredSiteToken } from "@/lib/site-api"
import { Upload, Download, Clock, GitBranch, Loader2 } from "lucide-react"

type AppBuild = {
  slug: string
  fileName: string
  originalName: string
  size: number
  version: number
  uploadedAt: string
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} КБ`
  return `${bytes} Б`
}

export function AppUploadButton({
  slug,
  label,
  accept = ".zip,.rar,.exe,.dmg,.7z,.msi,.apk,.json,.csv,.xlsx",
  canManage,
}: {
  slug: string
  label: string
  accept?: string
  canManage: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [build, setBuild] = useState<AppBuild | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    fetch("/api/app-builds")
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data: { items: AppBuild[] }) => {
        if (!active) return
        setBuild(data.items.find((item) => item.slug === slug) ?? null)
      })
      .catch(() => {
        // молча оставляем пустое состояние
      })
    return () => {
      active = false
    }
  }, [slug])

  const handleUpload = async (event: FormEvent<HTMLInputElement>) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    ;(event.target as HTMLInputElement).value = ""
    if (!file) return

    const token = readStoredSiteToken()
    if (!token) {
      setError("Нет активной admin-сессии.")
      return
    }

    setUploading(true)
    setError("")
    try {
      const form = new FormData()
      form.append("slug", slug)
      form.append("file", file)
      const res = await fetch("/api/app-builds", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || "Не удалось загрузить файл.")
      }
      setBuild(payload.build as AppBuild)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки.")
    } finally {
      setUploading(false)
    }
  }

  const versionTitle = build
    ? `Версия v${build.version} · ${build.originalName} · ${formatSize(build.size)} · ${formatDate(build.uploadedAt)}`
    : "Файл ещё не загружен"

  return (
    <div className="space-y-2">
      <div className="group relative">
        <Button
          type="button"
          variant="secondary"
          title={versionTitle}
          className="w-full gap-2 rounded-xl border border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground"
          onClick={() => inputRef.current?.click()}
          disabled={!canManage || uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Загрузка...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              {label}
              {build ? (
                <span className="ml-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold">
                  v{build.version}
                </span>
              ) : null}
            </>
          )}
        </Button>

        {/* Тултип с версией при наведении */}
        {build ? (
          <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max max-w-[260px] -translate-x-1/2 rounded-xl border border-border bg-popover px-3 py-2 text-xs text-popover-foreground opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <GitBranch className="h-3.5 w-3.5 text-primary" />
              Версия v{build.version}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-primary" />
              {formatDate(build.uploadedAt)}
            </div>
            <div className="mt-1 truncate text-muted-foreground">
              {build.originalName} · {formatSize(build.size)}
            </div>
          </div>
        ) : null}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {build ? (
        <a
          href={`/api/app-builds/${encodeURIComponent(slug)}/download`}
          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <Download className="h-3.5 w-3.5" />
          Скачать текущую сборку (v{build.version})
        </a>
      ) : (
        <p className="text-xs text-muted-foreground">Сборка ещё не загружена.</p>
      )}

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
