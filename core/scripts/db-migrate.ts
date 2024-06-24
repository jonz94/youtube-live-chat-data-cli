import { execSync } from 'node:child_process'
import { env } from '../env'

console.log('current database:', env.DATABASE_URL)

execSync('drizzle-kit migrate', { stdio: 'inherit' })

console.log()
