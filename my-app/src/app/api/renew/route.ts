import { NextResponse } from "next/server"
import path from "path"
import fs from "fs"
import archiver from "archiver"

export async function POST(req: Request) {
  try {
    const { fqdn } = await req.json()

    if (!fqdn || typeof fqdn !== "string") {
      return NextResponse.json({ error: "Invalid FQDN" }, { status: 400 })
    }

    const certsDir = path.join(process.cwd(), "public", "certs", fqdn)
    const csrFile = path.join(certsDir, `${fqdn}.csr`)
    const zipFile = path.join(certsDir, `${fqdn}.zip`)
    const publicZipPath = `/certs/${fqdn}/${fqdn}.zip`

    // Check if directory exists
    if (!fs.existsSync(certsDir)) {
      return NextResponse.json({ error: "Certificate directory not found" }, { status: 404 })
    }

    // Check if CSR file exists
    if (!fs.existsSync(csrFile)) {
      return NextResponse.json({ error: "CSR file not found" }, { status: 404 })
    }

    // Create zip
    const output = fs.createWriteStream(zipFile)
    const archive = archiver("zip", { zlib: { level: 9 } })

    archive.pipe(output)
    archive.file(csrFile, { name: `${fqdn}.csr` })
    await archive.finalize()

    // Schedule deletion after 1 hour
    setTimeout(() => {
      if (fs.existsSync(zipFile)) {
        fs.unlink(zipFile, (err) => {
          if (err) console.error("Failed to delete ZIP:", err)
        })
      }
    }, 60 * 60 * 1000) // 1 hour

    return NextResponse.json({ url: publicZipPath }, { status: 200 })

  } catch (error: any) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
