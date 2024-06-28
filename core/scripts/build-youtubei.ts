import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { getDirname } from '../src/utils'

const youtubeiProjectRoot = resolve(getDirname(), '..', '..', 'YouTube.js')

const hasYoutubeiBuild = existsSync(resolve(youtubeiProjectRoot, 'dist'))

if (hasYoutubeiBuild) {
  process.exit(0)
}

execSync('npm ci', { cwd: youtubeiProjectRoot })
