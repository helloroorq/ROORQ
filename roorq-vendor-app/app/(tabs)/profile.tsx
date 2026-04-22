import { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import {
  Store, Globe, CreditCard, Settings, Bell,
  MessageCircle, HelpCircle, Shield, ChevronRight, LogOut,
} from 'lucide-react-native'
import { supabase } from '../../lib/supabase'
import { AppHeader } from '../../src/components/common/AppHeader'
import { colors } from '../../src/constants/colors'
import { fonts } from '../../src/constants/typography'
import { spacing, radius } from '../../src/constants/spacing'

const MENU = [
  {
    title: 'SHOP',
    items: [
      { icon: Store, label: 'Shop details' },
      { icon: Globe, label: 'Instagram handle' },
    ],
  },
  {
    title: 'PAYOUTS',
    items: [
      { icon: CreditCard, label: 'UPI / Bank details' },
      { icon: Settings, label: 'Payout schedule' },
    ],
  },
  {
    title: 'PREFERENCES',
    items: [
      { icon: Bell, label: 'Notifications' },
      { icon: Settings, label: 'Language' },
    ],
  },
  {
    title: 'SUPPORT',
    items: [
      { icon: MessageCircle, label: 'Chat with ROORQ', isWhatsApp: true },
      { icon: HelpCircle, label: 'FAQ' },
      { icon: Shield, label: 'Report an issue' },
    ],
  },
  {
    title: 'LEGAL',
    items: [
      { icon: Shield, label: 'Vendor Terms' },
      { icon: Shield, label: 'Privacy Policy' },
      { icon: Globe, label: 'About ROORQ' },
    ],
  },
]

export default function ProfileScreen() {
  const router = useRouter()
  const [vendor, setVendor] = useState<any>(null)
  const [stats, setStats] = useState({ listings: 0, sold: 0 })
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ data: v }, { data: products }, { data: orders }] = await Promise.all([
        supabase.from('vendors').select('*').eq('id', user.id).single(),
        supabase.from('products').select('id').eq('vendor_id', user.id),
        supabase.from('orders').select('id').eq('vendor_id', user.id).eq('status', 'delivered'),
      ])
      setVendor(v)
      setStats({ listings: products?.length || 0, sold: orders?.length || 0 })
    }
    load()
  }, [])

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.replace('/(auth)/welcome' as any)
  }

  const firstName = (vendor?.full_name || vendor?.shop_name || '').split(' ')[0] || ''

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <AppHeader firstName={firstName} pendingOrders={0} disableAvatar />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Store size={28} color={colors.textPrimary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.shopName}>{vendor?.shop_name || 'Your Shop'}</Text>
            <Text style={styles.profileMeta}>
              {vendor?.city ? `${vendor.city} · ` : ''}Member since Apr 2026
            </Text>
            {vendor?.tags && <Text style={styles.profileTags}>{vendor.tags}</Text>}
          </View>
        </View>
        <View style={styles.px}>
          <TouchableOpacity style={styles.storefrontBtn}>
            <Text style={styles.storefrontBtnText}>View my storefront on roorq.com</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={[styles.px, styles.statsRow]}>
          {[
            { label: 'Listings', value: stats.listings.toString() },
            { label: 'Sold', value: stats.sold.toString() },
            { label: 'Rating', value: '—' },
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label.toUpperCase()}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        {MENU.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionLabel}>{section.title}</Text>
            {section.items.map((item, i) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuItem, i < section.items.length - 1 && styles.menuItemBorder]}
              >
                <item.icon size={16} color={(item as any).isWhatsApp ? colors.verified : colors.textTertiary} />
                <Text style={[styles.menuLabel, (item as any).isWhatsApp && { color: colors.verified }]}>
                  {item.label}
                </Text>
                <ChevronRight size={14} color={colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Sign out */}
        <View style={styles.signOutSection}>
          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} disabled={signingOut}>
            {signingOut
              ? <ActivityIndicator size="small" color={colors.red} />
              : <LogOut size={16} color={colors.red} />}
            <Text style={styles.signOutText}>{signingOut ? 'Signing out...' : 'Log out'}</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>ROORQ Vendor v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  px: { paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  profileHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.lg,
    paddingHorizontal: spacing.xl, paddingTop: 12, paddingBottom: spacing.lg,
  },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.bgElevated, borderWidth: 1,
    borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  profileInfo: { flex: 1 },
  shopName: { fontFamily: fonts.display, fontSize: 18, color: colors.textPrimary },
  profileMeta: { fontFamily: fonts.body, fontSize: 12, color: colors.textTertiary, marginTop: 2 },
  profileTags: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  storefrontBtn: {
    height: 38, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.subtle, alignItems: 'center', justifyContent: 'center',
  },
  storefrontBtnText: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.textSecondary },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, backgroundColor: colors.bgElevated, borderWidth: 1,
    borderColor: colors.border, borderRadius: radius.subtle,
    padding: 12, alignItems: 'center',
  },
  statValue: { fontFamily: fonts.mono, fontSize: 15, color: colors.textPrimary },
  statLabel: { fontFamily: fonts.body, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: colors.textTertiary, marginTop: 2 },
  section: { paddingHorizontal: spacing.xl, marginTop: spacing.lg, marginBottom: 4 },
  sectionLabel: { fontFamily: fonts.body, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: colors.textTertiary, marginBottom: spacing.sm },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  menuLabel: { flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },
  signOutSection: { paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl, alignItems: 'center', marginTop: spacing.lg },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 },
  signOutText: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.red },
  versionText: { fontFamily: fonts.mono, fontSize: 11, color: colors.textTertiary, marginTop: spacing.md },
})
