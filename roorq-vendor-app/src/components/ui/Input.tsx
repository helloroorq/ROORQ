import { View, Text, TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/typography'
import { radius, spacing } from '../../constants/spacing'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  containerStyle?: ViewStyle
  prefix?: string
}

export function Input({ label, error, containerStyle, prefix, style, ...props }: InputProps) {
  return (
    <View style={[{ width: '100%' }, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputRow, error ? styles.inputError : null]}>
        {prefix && <Text style={styles.prefix}>{prefix}</Text>}
        <TextInput
          placeholderTextColor={colors.textTertiary}
          style={[styles.input, prefix ? { paddingLeft: 0 } : null, style]}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.body,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.subtle,
    paddingHorizontal: 14,
  },
  inputError: {
    borderColor: colors.red,
  },
  prefix: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: 48,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.red,
    marginTop: 4,
  },
})
