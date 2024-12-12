import { defineConfig } from 'drizzle-kit'
import { env } from './env'

export default defineConfig({
  schema: './src/db/schema.ts',
  casing: 'snake_case',
  out: './src/db/drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: env.DATABASE_URL,
    authToken: env.DATABASE_AUTH_TOKEN,
  },
  migrations: {
    table: 'migrations',
  },
})
