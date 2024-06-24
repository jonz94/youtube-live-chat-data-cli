import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const youtubeiProjectRoot = resolve(import.meta.dirname, '..', '..', 'YouTube.js')

const hasYoutubeiBuild = existsSync(resolve(youtubeiProjectRoot, 'dist'))

if (hasYoutubeiBuild) {
  process.exit(0)
}

execSync('npm ci', { cwd: youtubeiProjectRoot })
