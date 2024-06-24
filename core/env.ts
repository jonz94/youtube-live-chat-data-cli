import dotenv from 'dotenv'

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: string
      DATABASE_URL: string
      DATABASE_AUTH_TOKEN: string
    }
  }
}

function isProduction() {
  const currentEnv = process.env.NODE_ENV

  return currentEnv === undefined || currentEnv === 'production'
}

// credits: https://github.com/motdotla/dotenv/issues/272#issuecomment-364677176
const envFile = isProduction() ? `.env` : process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env'
dotenv.config({ path: envFile })

const { DATABASE_URL, DATABASE_AUTH_TOKEN } = process.env

const env = {
  DATABASE_URL,
  DATABASE_AUTH_TOKEN,
}

for (const [key, value] of Object.entries(env)) {
  if (value === undefined) {
    throw new Error(`Missing environment variables ${key}`)
  }
}

export { env, isProduction }
