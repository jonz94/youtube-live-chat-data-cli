import { execSync } from 'node:child_process'
import { isProduction } from '../env'

const command = isProduction() ? 'start' : 'start-dev'

execSync(`pnpm run ${command} json`, { stdio: 'inherit' })
execSync(`pnpm run ${command} avatar`, { stdio: 'inherit' })