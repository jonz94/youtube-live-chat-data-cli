import dotenv from 'dotenv'

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: string
      COOKIE?: string
      DATABASE_URL: string
      DATABASE_AUTH_TOKEN: string
      BLACKLISTED_ACCOUNTS: string[]
    }
  }
}

function isProduction() {
  const currentEnv = process.env.NODE_ENV

  return currentEnv === undefined || currentEnv === 'production'
}

function parseJsonStringIntoArray(key: string, input: any) {
  try {
    const parsedInput = JSON.parse(input) as unknown

    if (!Array.isArray(parsedInput)) {
      throw new Error('BLACKLISTED_ACCOUNTS must a valid array')
    }

    if (!parsedInput.every((item) => typeof item === 'string')) {
      throw new Error('All items in BLACKLISTED_ACCOUNTS must be strings')
    }

    return parsedInput
  } catch (error) {
    throw new Error(`Cannot parse ${key}`)
  }
}

// credits: https://github.com/motdotla/dotenv/issues/272#issuecomment-364677176
const envFile = isProduction() ? `.env` : process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env'
dotenv.config({ path: envFile })

const { COOKIE, DATABASE_URL, DATABASE_AUTH_TOKEN, BLACKLISTED_ACCOUNTS } = process.env

const env = {
  COOKIE,
  DATABASE_URL,
  DATABASE_AUTH_TOKEN,
  BLACKLISTED_ACCOUNTS,
}

for (const [key, value] of Object.entries(env) as [keyof typeof env, (typeof env)[keyof typeof env]][]) {
  if (key === 'COOKIE') {
    continue
  }

  if (key === 'BLACKLISTED_ACCOUNTS') {
    env.BLACKLISTED_ACCOUNTS = value ? parseJsonStringIntoArray(key, value) : []
    continue
  }

  if (value === undefined) {
    throw new Error(`Missing environment variables ${key}`)
  }
}

export { env, isProduction }
