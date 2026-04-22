import { TextStyle } from 'react-native'
import { colors } from './colors'

export const fonts = {
  display: 'Inter_700Bold',
  body: 'Inter_400Regular',
  bodySemi: 'Inter_600SemiBold',
  mono: 'JetBrainsMono_500Medium',
} as const

export const typography: Record<string, TextStyle> = {
  hero: {
    fontFamily: fonts.mono,
    fontSize: 48,
    lineHeight: 52,
    color: colors.textPrimary,
  },
  h1: {
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 38,
    color: colors.textPrimary,
  },
  h2: {
    fontFamily: fonts.display,
    fontSize: 24,
    lineHeight: 30,
    color: colors.textPrimary,
  },
  h3: {
    fontFamily: fonts.bodySemi,
    fontSize: 18,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  bodySmall: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textTertiary,
  },
  mono: {
    fontFamily: fonts.mono,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textTertiary,
  },
}
