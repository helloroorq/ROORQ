import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native'
import { colors } from '../../constants/colors'
import { fonts, typography } from '../../constants/typography'
import { radius } from '../../constants/spacing'

type Variant = 'primary' | 'ghost' | 'outline'

interface ButtonProps {
  label: string
  onPress: () => void
  variant?: Variant
  loading?: boolean
  disabled?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
  fullWidth?: boolean
}

export function Button({ label, onPress, variant = 'primary', loading, disabled, style, textStyle, fullWidth = true }: ButtonProps) {
  const vs = variantStyles[variant]
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[styles.base, vs.container, fullWidth && { width: '100%' }, (disabled || loading) && styles.disabled, style]}
    >
      {loading && <ActivityIndicator size="small" color={variant === 'primary' ? colors.textPrimary : colors.red} style={{ marginRight: 8 }} />}
      <Text style={[styles.label, vs.label, textStyle]}>{label}</Text>
    </TouchableOpacity>
  )
}

const variantStyles: Record<Variant, { container: ViewStyle; label: TextStyle }> = {
  primary: {
    container: { backgroundColor: colors.red },
    label: { color: colors.textPrimary },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    label: { color: colors.textPrimary },
  },
  outline: {
    container: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
    label: { color: colors.textSecondary },
  },
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radius.subtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    letterSpacing: 0.2,
  },
  disabled: {
    opacity: 0.5,
  },
})
