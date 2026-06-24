import { NextResponse } from "next/server"
import fs from "fs"
import { getBuildFile } from "@/lib/app-builds-storage"

export const runtime = "nodejs"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const found = getBuildFile(slug)
  if (!found) {
    return NextResponse.json({ error: "Build not found" }, { status: 404 })
  }

  const data = fs.readFileSync(found.fullPath)
  const asciiName = found.build.originalName.replace(/[^\x20-\x7E]/g, "_")
  const encodedName = encodeURIComponent(found.build.originalName)

  return new NextResponse(data as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${asciiName}"; filename*=UTF-8''${encodedName}`,
      "Content-Length": String(found.build.size),
      "Cache-Control": "no-store",
    },
  })
}
