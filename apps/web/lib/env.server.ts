import 'server-only'

const requireServerEnv = (name: string): string => {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`)
  }
  return value
}

const optionalServerEnv = (name: string): string | undefined => {
  const value = process.env[name]
  return value && value.length > 0 ? value : undefined
}

const parseBoolean = (name: string, defaultValue = false): boolean => {
  const value = optionalServerEnv(name)
  if (value === undefined) {
    return defaultValue
  }
  if (value === 'true') {
    return true
  }
  if (value === 'false') {
    return false
  }
  throw new Error(`Invalid boolean for ${name}. Use "true" or "false".`)
}

export const serverEnv = {
  MAILCHIMP_API_KEY: optionalServerEnv('MAILCHIMP_API_KEY'),
  MAILCHIMP_AUDIENCE_ID: optionalServerEnv('MAILCHIMP_AUDIENCE_ID'),
  MAILCHIMP_DOUBLE_OPT_IN: parseBoolean('MAILCHIMP_DOUBLE_OPT_IN', false),
  RESEND_API_KEY: optionalServerEnv('RESEND_API_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: optionalServerEnv('SUPABASE_SERVICE_ROLE_KEY'),
  SENTRY_DSN: optionalServerEnv('SENTRY_DSN'),
  SENTRY_ENVIRONMENT: optionalServerEnv('SENTRY_ENVIRONMENT'),
  SENTRY_TRACES_SAMPLE_RATE: optionalServerEnv('SENTRY_TRACES_SAMPLE_RATE'),
  SENTRY_DEBUG: parseBoolean('SENTRY_DEBUG', false),
  TURNSTILE_SECRET_KEY: optionalServerEnv('TURNSTILE_SECRET_KEY'),
  CONTACT_INBOX_EMAIL: optionalServerEnv('CONTACT_INBOX_EMAIL'),
}

export { requireServerEnv, optionalServerEnv, parseBoolean }
