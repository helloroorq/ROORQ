import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/typography'
import { radius, spacing } from '../../constants/spacing'

interface ChipProps {
  label: string
  selected: boolean
  onPress: () => void
  pill?: boolean
  style?: ViewStyle
}

export function Chip({ label, selected, onPress, pill = false, style }: ChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.base,
        pill ? styles.pill : styles.square,
        selected ? styles.selected : styles.unselected,
        style,
      ]}
    >
      <Text style={[styles.label, selected ? styles.labelSelected : styles.labelUnselected]}>
        {label}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  square: { borderRadius: radius.subtle },
  pill: { borderRadius: radius.pill },
  selected: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  unselected: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
  },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
  },
  labelSelected: { color: colors.bg },
  labelUnselected: { color: colors.textSecondary },
})
