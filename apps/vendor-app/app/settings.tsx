import { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowLeft, LogOut } from 'lucide-react-native'
import { supabase } from '../lib/supabase'
import { colors } from '../src/constants/colors'
import { spacing, radius } from '../src/constants/spacing'

interface Vendor {
  store_name: string | null
  full_name: string | null
  phone: string | null
  whatsapp_number: string | null
  upi_id: string | null
  instagram: string | null
  city: string | null
  bio: string | null
}

export default function SettingsScreen() {
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
        .select('store_name, full_name, phone, whatsapp_number, upi_id, instagram, city, bio')
        .eq('id', user.id)
        .single()
      setVendor(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut()
          router.replace('/(auth)/welcome')
        },
      },
    ])
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={colors.red} />
      </View>
    )
  }

  const rows: { label: string; value: string | null | undefined }[] = [
    { label: 'SHOP / BRAND', value: vendor?.store_name },
    { label: 'FULL NAME', value: vendor?.full_name },
    { label: 'PHONE', value: vendor?.phone ? '+91 ' + vendor.phone : null },
    { label: 'WHATSAPP', value: vendor?.whatsapp_number ? '+91 ' + vendor.whatsapp_number : null },
    { label: 'UPI ID', value: vendor?.upi_id },
    { label: 'INSTAGRAM', value: vendor?.instagram ? '@' + vendor.instagram.replace(/^@/, '') : null },
    { label: 'CITY', value: vendor?.city },
  ]

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backBtn}>
          <ArrowLeft color={colors.textSecondary} size={22} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {rows.map((row, i) => (
            <View key={row.label} style={[styles.row, i < rows.length - 1 && styles.rowBorder]}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Text style={styles.rowValue} numberOfLines={1}>
                {row.value || '—'}
              </Text>
            </View>
          ))}
        </View>

        {vendor?.bio ? (
          <View style={styles.bioCard}>
            <Text style={styles.rowLabel}>BIO</Text>
            <Text style={styles.bioText}>{vendor.bio}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <LogOut color={colors.red} size={18} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  scroll: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
  },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rowLabel: {
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textTertiary,
    fontWeight: '600',
    flexShrink: 0,
    marginRight: spacing.md,
  },
  rowValue: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  bioCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  bioText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
    marginTop: spacing.sm,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 52,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.subtle,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.lg,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.red,
  },
})
