import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const MIME_MAP = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.ogg': 'video/ogg',
  '.ogv': 'video/ogg',
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.doc': 'application/msword',
  '.csv': 'text/csv',
  '.txt': 'text/plain',
  '.json': 'application/json',
}

// Roots searched (recursively) for any requested upload asset.
const SEARCH_ROOTS = [
  path.resolve(__dirname, 'public/uploads'),
  path.resolve(__dirname, '../backend/uploads'),
]

// Cached recursive index of all files under SEARCH_ROOTS.
let fileIndex = null
let fileIndexBuiltAt = 0
const INDEX_TTL = 2000

function walkDir(dir, out) {
  let entries
  try { entries = fs.readdirSync(dir, { withFileTypes: true }) } catch (_) { return }
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      walkDir(full, out)
    } else if (e.isFile()) {
      out.push({ fullPath: full, basename: e.name })
    }
  }
}

function getFileIndex() {
  const now = Date.now()
  if (fileIndex && now - fileIndexBuiltAt < INDEX_TTL) return fileIndex
  const out = []
  for (const root of SEARCH_ROOTS) {
    if (fs.existsSync(root)) walkDir(root, out)
  }
  fileIndex = out
  fileIndexBuiltAt = now
  return fileIndex
}

function nameVariants(s) {
  const v = new Set()
  const base = (s || '').trim()
  if (!base) return v
  v.add(base)
  v.add(base.replace(/ /g, '-'))
  v.add(base.replace(/-/g, ' '))
  v.add(base.replace(/\s+/g, ' '))
  v.add(base.replace(/\s+/g, '-'))
  return v
}

function normalizeForCompare(s) {
  return (s || '').toLowerCase().replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim()
}

function resolveFile(requestedPath) {
  // Strip the leading /uploads/ or /downloads/ prefix.
  let rel = (requestedPath || '').replace(/^\/(uploads|downloads)\/?/i, '')
  try { rel = decodeURIComponent(rel) } catch (_) {}

  const cleanSub = rel.trim()

  // 1. Direct candidate resolution (with space/hyphen variants) — handles exact subpaths.
  const directVariants = [...nameVariants(cleanSub)]
  for (const root of SEARCH_ROOTS) {
    const rootNorm = path.normalize(root).toLowerCase()
    for (const variant of directVariants) {
      const candidate = path.resolve(root, variant)
      const candNorm = path.normalize(candidate).toLowerCase()
      try {
        if (candNorm.startsWith(rootNorm + path.sep) || candNorm === rootNorm) {
          if (fs.existsSync(candidate)) {
            const st = fs.statSync(candidate)
            if (st.isFile()) return candidate
          }
        }
      } catch (_) {}
    }
  }

  // 2. Recursive resolution by basename (handles nested subfolders like all_pages/, partner/).
  const requestedBase = path.basename(cleanSub)
  const wantedLower = new Set([...nameVariants(requestedBase)].map((x) => x.toLowerCase()))
  const wantedNorm = new Set([...wantedLower].map(normalizeForCompare))

  const idx = getFileIndex()
  for (const entry of idx) {
    if (wantedLower.has(entry.basename.toLowerCase())) {
      return entry.fullPath
    }
  }
  for (const entry of idx) {
    if (wantedNorm.has(normalizeForCompare(entry.basename))) {
      return entry.fullPath
    }
  }
  return null
}

function serveUploadsMiddleware() {
  return {
    name: 'serve-uploads-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next()

        const rawUrl = req.url.split('?')[0].split('#')[0]
        let decodedPath = rawUrl
        try { decodedPath = decodeURI(rawUrl) } catch (_) {
          try { decodedPath = decodeURIComponent(rawUrl) } catch (_) { decodedPath = rawUrl }
        }

        const isUpload = /^\/(uploads|downloads)\//i.test(decodedPath)
        if (!isUpload) return next()

        const filePath = resolveFile(decodedPath)
        if (!filePath) {
          res.writeHead(404, {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*',
          })
          res.end(`Upload asset not found: ${rawUrl}`)
          return
        }

        let stat
        try { stat = fs.statSync(filePath) } catch (_) {
          res.writeHead(404, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' })
          res.end(`Upload asset not found: ${rawUrl}`)
          return
        }
        if (!stat.isFile()) {
          res.writeHead(404, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' })
          res.end(`Upload asset not found: ${rawUrl}`)
          return
        }

        const ext = path.extname(filePath).toLowerCase()
        const contentType = MIME_MAP[ext] || 'application/octet-stream'
        const fileSize = stat.size
        const fileName = path.basename(filePath)

        // Robust RFC 7233 byte-range parsing (critical for PDF viewers & video players)
        const rangeHeader = req.headers.range
        let start = 0
        let end = fileSize - 1
        let isRange = false

        if (rangeHeader && typeof rangeHeader === 'string') {
          const rangeMatch = rangeHeader.trim().match(/^bytes=(\d*)-(\d*)$/)
          if (rangeMatch) {
            isRange = true
            const partStart = rangeMatch[1]
            const partEnd = rangeMatch[2]

            if (partStart === '' && partEnd !== '') {
              const suffix = parseInt(partEnd, 10)
              start = Math.max(0, fileSize - suffix)
              end = fileSize - 1
            } else if (partStart !== '' && partEnd === '') {
              start = parseInt(partStart, 10)
              end = fileSize - 1
            } else if (partStart !== '' && partEnd !== '') {
              start = parseInt(partStart, 10)
              end = Math.min(fileSize - 1, parseInt(partEnd, 10))
            }

            if (isNaN(start) || isNaN(end) || start > end || start >= fileSize) {
              res.writeHead(416, {
                'Content-Range': `bytes */${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Access-Control-Allow-Origin': '*',
              })
              res.end()
              return
            }
          } else {
            isRange = false
          }
        }

        if (isRange) {
          const chunkSize = end - start + 1
          res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': contentType,
            'Content-Disposition': `inline; filename="${encodeURIComponent(fileName)}"`,
            'X-Content-Type-Options': 'nosniff',
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*',
          })
          fs.createReadStream(filePath, { start, end }).pipe(res)
          return
        }

        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': contentType,
          'Accept-Ranges': 'bytes',
          'Content-Disposition': `inline; filename="${encodeURIComponent(fileName)}"`,
          'X-Content-Type-Options': 'nosniff',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Access-Control-Allow-Origin': '*',
        })
        fs.createReadStream(filePath).pipe(res)
        return
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), serveUploadsMiddleware()],
})
