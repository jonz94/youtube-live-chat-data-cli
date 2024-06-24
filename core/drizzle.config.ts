import { defineConfig } from 'drizzle-kit'
import { env } from './env'

export default defineConfig({
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'turso',
  dbCredentials: {
    url: env.DATABASE_URL,
    authToken: env.DATABASE_AUTH_TOKEN,
  },
  migrations: {
    table: 'migrations',
  },
})
