import { Text, StyleSheet } from 'react-native'
import { colors } from '../../constants/colors'

interface Props {
  width?: number
  color?: string
}

export function RoorqLogo({ width = 80, color }: Props) {
  return (
    <Text style={[styles.logo, color ? { color } : undefined]}>
      ROORQ
    </Text>
  )
}

const styles = StyleSheet.create({
  logo: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 3,
    color: colors.textPrimary,
  },
})
