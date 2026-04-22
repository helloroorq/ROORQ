import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Plus, Bell } from 'lucide-react-native'
import { RoorqLogo } from './RoorqLogo'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/typography'
import { radius } from '../../constants/spacing'

interface AppHeaderProps {
  firstName?: string
  pendingOrders?: number
  disableAvatar?: boolean
}

export function AppHeader({ firstName = '', pendingOrders = 0, disableAvatar = false }: AppHeaderProps) {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const initial = (firstName[0] || '?').toUpperCase()

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      {/* Left: add listing */}
      <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/list-item' as any)}>
        <Plus size={18} color={colors.textPrimary} />
      </TouchableOpacity>

      {/* Center: logo */}
      <RoorqLogo width={80} />

      {/* Right: bell + avatar */}
      <View style={styles.rightRow}>
        <TouchableOpacity style={styles.iconBtn}>
          <Bell size={18} color={colors.textSecondary} />
          {pendingOrders > 0 && <View style={styles.notifDot} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.avatarBtn}
          onPress={() => !disableAvatar && router.push('/(tabs)/profile' as any)}
          disabled={disableAvatar}
        >
          <Text style={styles.avatarText}>{initial}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rightRow: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 36, height: 36,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.subtle,
    alignItems: 'center', justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4, backgroundColor: colors.red,
  },
  avatarBtn: {
    width: 36, height: 36,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.subtle,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.textPrimary },
})
