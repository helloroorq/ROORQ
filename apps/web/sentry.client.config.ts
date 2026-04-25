import * as Sentry from '@sentry/nextjs'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN
const environment =
  process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ||
  process.env.SENTRY_ENVIRONMENT ||
  process.env.NODE_ENV

const tracesSampleRate = Number(
  process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ||
    process.env.SENTRY_TRACES_SAMPLE_RATE ||
    '0.1'
)

const debugEnabled =
  process.env.NEXT_PUBLIC_SENTRY_DEBUG === 'true' ||
  process.env.SENTRY_DEBUG === 'true'

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment,
  tracesSampleRate: Number.isFinite(tracesSampleRate) ? tracesSampleRate : 0.1,
  debug: debugEnabled,
})
