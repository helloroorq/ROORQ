import { View, Text, StyleSheet, ViewStyle } from 'react-native'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/typography'
import { radius } from '../../constants/spacing'

type BadgeVariant = 'live' | 'review' | 'sold' | 'draft' | 'rejected' | 'justIn'

interface BadgeProps {
  variant: BadgeVariant
  style?: ViewStyle
}

const config: Record<BadgeVariant, { dot: string; text: string; label: string }> = {
  live:     { dot: colors.verified,  text: colors.verified,  label: 'LIVE' },
  review:   { dot: colors.warning,   text: colors.warning,   label: 'REVIEW' },
  sold:     { dot: colors.red,       text: colors.red,       label: 'SOLD' },
  draft:    { dot: colors.textTertiary, text: colors.textTertiary, label: 'DRAFT' },
  rejected: { dot: colors.red,       text: colors.red,       label: 'REJECTED' },
  justIn:   { dot: colors.textPrimary, text: colors.textPrimary, label: 'JUST IN' },
}

export function Badge({ variant, style }: BadgeProps) {
  const cfg = config[variant]
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.dot, { backgroundColor: cfg.dot }]} />
      <Text style={[styles.label, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(13,13,13,0.85)',
    borderRadius: radius.subtle,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 10,
    letterSpacing: 0.8,
  },
})
