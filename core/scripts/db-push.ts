import { execSync } from 'node:child_process'
import { env, isProduction } from '../env'

if (isProduction()) {
  console.error('please do not run database push in production environment...')
  process.exit(1)
}

console.log('current database:', env.DATABASE_URL)

execSync('drizzle-kit push', { stdio: 'inherit' })

console.log()
