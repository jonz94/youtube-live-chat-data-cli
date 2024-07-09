import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export function getDirname() {
  return import.meta.dirname ?? dirname(fileURLToPath(import.meta.url))
}

const youtubeiProjectRoot = resolve(getDirname(), '..', '..', 'YouTube.js')

const hasYoutubeiBuild = existsSync(resolve(youtubeiProjectRoot, 'dist'))

if (hasYoutubeiBuild) {
  process.exit(0)
}

execSync('npm ci', { cwd: youtubeiProjectRoot })
