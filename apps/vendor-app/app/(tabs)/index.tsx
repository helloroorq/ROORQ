import { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Image, ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ChevronRight, Plus } from 'lucide-react-native'
import { supabase } from '../../lib/supabase'
import { RoorqLogo } from '../../src/components/common/RoorqLogo'
import { colors } from '../../src/constants/colors'
import { spacing, radius } from '../../src/constants/spacing'

interface Vendor {
  store_name: string | null
  avatar_url: string | null
}

export default function DashboardScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/(auth)/welcome')
        return
      }
      const { data } = await supabase
        .from('vendors')
        .select('store_name, avatar_url')
        .eq('id', user.id)
        .single()
      setVendor(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.red} />
      </View>
    )
  }

  const storeName = vendor?.store_name ?? 'Vendor'
  const initials = storeName.charAt(0).toUpperCase()

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      <View style={styles.topBar}>
        <RoorqLogo />
        <TouchableOpacity
          onPress={() => router.push('/settings')}
          activeOpacity={0.8}
          style={styles.avatarBtn}
        >
          {vendor?.avatar_url ? (
            <Image source={{ uri: vendor.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarInitialsWrap}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greeting}>Hey {storeName} 👋</Text>
        <Text style={styles.greetingSub}>Here's your store at a glance.</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>ACTIVE LISTINGS</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>PENDING ORDERS</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>₹0</Text>
            <Text style={styles.statLabel}>THIS WEEK</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/list-item')}
          activeOpacity={0.85}
        >
          <Plus color={colors.textPrimary} size={18} />
          <Text style={styles.primaryBtnText}>ADD NEW PRODUCT</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.outlineBtn}
          onPress={() => router.push('/(tabs)/listings')}
          activeOpacity={0.8}
        >
          <Text style={styles.outlineBtnText}>View All Listings</Text>
          <ChevronRight color={colors.textSecondary} size={16} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.outlineBtn}
          onPress={() => router.push('/(tabs)/orders')}
          activeOpacity={0.8}
        >
          <Text style={styles.outlineBtnText}>View Orders</Text>
          <ChevronRight color={colors.textSecondary} size={16} />
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>RECENT ACTIVITY</Text>
        </View>

        <View style={styles.emptyFeed}>
          <Text style={styles.emptyFeedText}>No activity yet. List your first product!</Text>
        </View>

        <View style={styles.verifiedBanner}>
          <Text style={styles.verifiedDot}>●</Text>
          <Text style={styles.verifiedText}>Verify your first product to start selling</Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  avatarBtn: {},
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarInitialsWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgHigher,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarInitials: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scroll: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  greetingSub: {
    fontSize: 14,
    color: colors.textTertiary,
    marginBottom: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 9,
    letterSpacing: 0.8,
    color: colors.textTertiary,
    textAlign: 'center',
    fontWeight: '600',
  },
  primaryBtn: {
    height: 52,
    backgroundColor: colors.red,
    borderRadius: radius.subtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.textPrimary,
  },
  outlineBtn: {
    height: 48,
    backgroundColor: 'transparent',
    borderRadius: radius.subtle,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  outlineBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  sectionHeader: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textTertiary,
    fontWeight: '600',
  },
  emptyFeed: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.card,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  emptyFeedText: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  verifiedBanner: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.card,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.verified,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  verifiedDot: {
    color: colors.verified,
    fontSize: 10,
  },
  verifiedText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
})
