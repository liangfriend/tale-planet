import { ZipArchive } from 'archiver'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { DE_BASE_URL } from '../../shared/constants/export'

const RESOURCE_URL_KEYS = new Set(['url', 'bgUrl'])

type ExportPayload = {
  gameData: unknown
  extraData: Record<string, unknown>
}

function isLocalResourceUrl(value: string): boolean {
  return value.startsWith('file://') || /^[a-zA-Z]:[\\/]/.test(value)
}

function toLocalPath(url: string): string {
  if (url.startsWith('file://')) {
    try {
      return fileURLToPath(url)
    } catch {
      return url.replace(/^file:\/\//, '').replace(/\//g, path.sep)
    }
  }
  return url
}

function uniqueBasename(filePath: string, used: Map<string, number>): string {
  const base = path.basename(filePath)
  const count = used.get(base) ?? 0
  used.set(base, count + 1)
  if (count === 0) return base
  const ext = path.extname(base)
  const name = path.basename(base, ext)
  return `${name}_${count}${ext}`
}

/** 遍历 gameData，收集本地资源并替换为 de-base-url/文件名 */
function rewriteResourceUrls(
  root: unknown,
  urlToZipPath: Map<string, string>,
  usedNames: Map<string, number>
): void {
  if (root == null) return

  if (Array.isArray(root)) {
    root.forEach((item) => rewriteResourceUrls(item, urlToZipPath, usedNames))
    return
  }

  if (typeof root !== 'object') return

  for (const [key, value] of Object.entries(root as Record<string, unknown>)) {
    if (typeof value === 'string' && RESOURCE_URL_KEYS.has(key) && value && isLocalResourceUrl(value)) {
      if (!urlToZipPath.has(value)) {
        const localPath = toLocalPath(value)
        const fileName = uniqueBasename(localPath, usedNames)
        urlToZipPath.set(value, `${DE_BASE_URL}/${fileName}`)
      }
      ;(root as Record<string, unknown>)[key] = urlToZipPath.get(value)!
    } else {
      rewriteResourceUrls(value, urlToZipPath, usedNames)
    }
  }
}

export class ExportService {
  async exportGameBundle(
    savePath: string,
    payload: ExportPayload
  ): Promise<{ filePath: string; resourceCount: number }> {
    const gameData = JSON.parse(JSON.stringify(payload.gameData))
    const extraData = JSON.parse(JSON.stringify(payload.extraData ?? {}))
    const urlToZipPath = new Map<string, string>()
    const usedNames = new Map<string, number>()

    rewriteResourceUrls(gameData, urlToZipPath, usedNames)

    const manifest = { gameData, extraData }
    const zipPath = savePath.endsWith('.zip') ? savePath : `${savePath}.zip`

    await new Promise<void>((resolve, reject) => {
      const output = fs.createWriteStream(zipPath)
      const archive = new ZipArchive({ zlib: { level: 6 } })

      const done = () => resolve()
      output.on('close', done)
      output.on('finish', done)
      output.on('error', reject)
      archive.on('error', reject)

      archive.pipe(output)
      archive.append(JSON.stringify(manifest, null, 2), { name: 'game.json' })

      for (const [originalUrl, zipEntry] of urlToZipPath) {
        const localPath = toLocalPath(originalUrl)
        if (fs.existsSync(localPath)) {
          archive.file(localPath, { name: zipEntry })
        }
      }

      archive.finalize()
    })

    return { filePath: zipPath, resourceCount: urlToZipPath.size }
  }
}
