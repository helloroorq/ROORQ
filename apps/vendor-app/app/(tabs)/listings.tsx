import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Plus } from 'lucide-react-native'
import { colors } from '../../src/constants/colors'
import { spacing, radius } from '../../src/constants/spacing'

export default function ListingsScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Listings</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.emptyIcon}>📦</Text>
        <Text style={styles.emptyTitle}>No listings yet</Text>
        <Text style={styles.emptyBody}>Add your first product and start selling to IITR students.</Text>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => router.push('/list-item')}
          activeOpacity={0.85}
        >
          <Plus color={colors.textPrimary} size={18} />
          <Text style={styles.btnText}>ADD NEW PRODUCT</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl * 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyBody: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: spacing.xxl,
  },
  btn: {
    height: 52,
    backgroundColor: colors.red,
    borderRadius: radius.subtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xxl,
  },
  btnText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.textPrimary,
  },
})
