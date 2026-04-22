import { useEffect, useState, useCallback, useRef } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator, Animated,
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import {
  Package, TrendingUp, DollarSign,
  CheckCircle, Sparkles, Eye,
} from 'lucide-react-native'
import { supabase } from '../../lib/supabase'
import { AppHeader } from '../../src/components/common/AppHeader'
import { colors } from '../../src/constants/colors'
import { fonts } from '../../src/constants/typography'
import { spacing, radius } from '../../src/constants/spacing'

function getDropCountdown(targetDate: Date) {
  const now = new Date()
  const diff = targetDate.getTime() - now.getTime()
  if (diff <= 0) return null
  const d = Math.floor(diff / (1000 * 60 * 60 * 24))
  const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${d}D  ${h}H  ${m}M`
}

function timeAgo(dateStr: string) {
  if (!dateStr) return ''
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function HomeScreen() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [countdown, setCountdown] = useState('')
  const dropDate = new Date('2025-05-02T00:00:00')
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start()
    const timer = setInterval(() => {
      const c = getDropCountdown(dropDate)
      setCountdown(c || '')
    }, 60000)
    setCountdown(getDropCountdown(dropDate) || '')
    return () => clearInterval(timer)
  }, [])

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    const [{ data: vendor }, { data: ord }, { data: prod }] = await Promise.all([
      supabase.from('vendors').select('*').eq('id', user.id).single(),
      supabase.from('orders').select('*').eq('vendor_id', user.id).order('created_at', { ascending: false }).limit(10),
      supabase.from('products').select('*').eq('vendor_id', user.id).limit(20),
    ])
    setProfile(vendor)
    setOrders(ord || [])
    setProducts(prod || [])
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { load() }, [load])

  const pendingPayout = orders
    .filter(o => o.status === 'delivered')
    .reduce((s, o) => s + Math.round((o.amount || 0) * 0.8), 0)
  const deliveredCount = orders.filter(o => o.status === 'delivered').length
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const totalEarned = orders
    .filter(o => o.status === 'delivered')
    .reduce((s, o) => s + Math.round((o.amount || 0) * 0.8), 0)
  const firstName = (profile?.full_name || profile?.store_name || '').split(' ')[0] || 'Vendor'
  const liveListings = products.filter(p => p.status === 'active').length

  const day = new Date().getDay()
  const weekProgress = Math.min(((day === 0 ? 5 : Math.min(day, 5)) / 5) * 100, 100)

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.red} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <AppHeader firstName={firstName} pendingOrders={pendingOrders} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load() }}
            tintColor={colors.red}
          />
        }
      >
        {/* Greeting */}
        <View style={styles.px}>
          <Text style={styles.greeting}>Hey, {firstName} 👋</Text>
        </View>

        {/* Payout Hero */}
        <View style={styles.px}>
          <View style={styles.payoutCard}>
            <Text style={styles.payoutLabel}>PENDING PAYOUT · CLEARS FRIDAY</Text>
            <Text style={styles.payoutAmount}>
              ₹{pendingPayout.toLocaleString('en-IN')}
            </Text>
            <Text style={styles.payoutSub}>
              From {deliveredCount} delivered order{deliveredCount !== 1 ? 's' : ''} this week
            </Text>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${weekProgress}%` as any }]} />
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={[styles.px, styles.statsRow]}>
          {[
            { label: 'LIVE LISTINGS', value: liveListings.toString(), icon: Package },
            { label: 'ORDERS (7D)', value: orders.length.toString(), icon: TrendingUp },
            { label: 'TOTAL EARNED', value: `₹${(totalEarned / 1000).toFixed(1)}K`, icon: DollarSign },
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
            </View>
          ))}
        </View>

        {/* Primary CTA */}
        <View style={styles.px}>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => router.push('/list-item')}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaBtnText}>+ LIST NEW ITEM</Text>
          </TouchableOpacity>
        </View>

        {/* Drop Countdown */}
        {countdown ? (
          <View style={styles.px}>
            <View style={styles.dropCard}>
              <View style={styles.dropRow}>
                <Animated.View style={[styles.dropDot, { opacity: pulseAnim }]} />
                <Text style={styles.dropTitle}>DROP 002 — MAY 2</Text>
              </View>
              <Text style={styles.dropSub}>Submit items by April 29 to be featured</Text>
              <View style={styles.dropBottom}>
                <Text style={styles.dropTimer}>{countdown}</Text>
                <TouchableOpacity style={styles.dropBtn}>
                  <Text style={styles.dropBtnText}>Prepare items</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : null}

        {/* Activity Feed */}
        <View style={styles.px}>
          <Text style={styles.sectionLabel}>RECENT ACTIVITY</Text>
          {orders.length === 0 && products.length === 0 ? (
            <View style={styles.emptyActivity}>
              <Text style={styles.emptyText}>
                No activity yet. List items to get started.
              </Text>
            </View>
          ) : (
            <>
              {orders.slice(0, 4).map(o => (
                <TouchableOpacity
                  key={o.id}
                  style={styles.activityRow}
                  onPress={() => router.push(`/order-detail?id=${o.id}` as any)}
                >
                  <View style={[
                    styles.activityIcon,
                    { backgroundColor: o.status === 'delivered' ? '#1a3d2a' : o.status === 'pending' ? colors.bgHigher : '#1a2a3d' },
                  ]}>
                    {o.status === 'delivered'
                      ? <CheckCircle size={14} color={colors.verified} />
                      : <Package size={14} color={colors.textTertiary} />}
                  </View>
                  <View style={styles.activityBody}>
                    <Text style={styles.activityText} numberOfLines={1}>
                      {o.status === 'delivered'
                        ? `Order ${o.id?.slice(0, 8)} delivered`
                        : `Order ${o.id?.slice(0, 8)} — ${o.status}`}
                      {o.status === 'delivered' && (
                        <Text style={{ color: colors.textTertiary }}> — ₹{o.amount?.toLocaleString('en-IN')}</Text>
                      )}
                    </Text>
                  </View>
                  <Text style={styles.activityTime}>{timeAgo(o.created_at)}</Text>
                </TouchableOpacity>
              ))}
              {products.slice(0, 1).map(p => (
                <View key={p.id} style={styles.activityRow}>
                  <View style={[styles.activityIcon, { backgroundColor: colors.bgHigher }]}>
                    <Eye size={14} color={colors.textTertiary} />
                  </View>
                  <Text style={[styles.activityText, { flex: 1 }]} numberOfLines={1}>
                    "{p.title || p.name}" — {p.views || 0} views today
                  </Text>
                  <Text style={styles.activityTime}>{timeAgo(p.created_at)}</Text>
                </View>
              ))}
            </>
          )}
        </View>

        {/* Pro Tip */}
        <View style={[styles.px, { marginBottom: spacing.xxxl }]}>
          <View style={styles.tipCard}>
            <Sparkles size={16} color={colors.warning} />
            <Text style={styles.tipText}>
              <Text style={{ color: colors.textPrimary, fontFamily: fonts.bodySemi }}>PRO TIP: </Text>
              Post on Instagram when you list — drives 3x more views
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  px: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  greeting: {
    fontFamily: fonts.bodySemi, fontSize: 18,
    color: colors.textPrimary, marginBottom: 0,
  },
  payoutCard: {
    backgroundColor: colors.bgElevated, borderWidth: 1,
    borderColor: colors.border, borderRadius: radius.subtle, padding: spacing.xl,
  },
  payoutLabel: {
    fontFamily: fonts.body, fontSize: 11, letterSpacing: 1,
    textTransform: 'uppercase', color: colors.textTertiary, marginBottom: 8,
  },
  payoutAmount: { fontFamily: fonts.mono, fontSize: 42, color: colors.textPrimary, lineHeight: 50 },
  payoutSub: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, marginTop: 8 },
  progressBg: {
    height: 4, backgroundColor: colors.bgHigher,
    borderRadius: 2, marginTop: spacing.lg, overflow: 'hidden',
  },
  progressFill: { height: 4, backgroundColor: colors.red, borderRadius: 2 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, backgroundColor: colors.bgElevated, borderWidth: 1,
    borderColor: colors.border, borderRadius: radius.subtle, padding: 12,
  },
  statLabel: {
    fontFamily: fonts.body, fontSize: 10, letterSpacing: 1,
    textTransform: 'uppercase', color: colors.textTertiary,
  },
  statValue: { fontFamily: fonts.mono, fontSize: 18, color: colors.textPrimary, marginTop: 4 },
  ctaBtn: {
    height: 52, backgroundColor: colors.red,
    borderRadius: radius.subtle, alignItems: 'center', justifyContent: 'center',
  },
  ctaBtnText: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.textPrimary },
  dropCard: {
    backgroundColor: colors.redMuted, borderWidth: 1,
    borderColor: `${colors.red}50`, borderRadius: radius.subtle, padding: spacing.lg,
  },
  dropRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  dropDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.red },
  dropTitle: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.textPrimary },
  dropSub: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
  dropBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  dropTimer: { fontFamily: fonts.mono, fontSize: 13, color: colors.textPrimary },
  dropBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: colors.red, borderRadius: radius.subtle,
  },
  dropBtnText: { fontFamily: fonts.bodySemi, fontSize: 11, color: colors.textPrimary },
  sectionLabel: {
    fontFamily: fonts.body, fontSize: 11, letterSpacing: 1,
    textTransform: 'uppercase', color: colors.textTertiary, marginBottom: 12,
  },
  emptyActivity: { paddingVertical: spacing.xl },
  emptyText: {
    fontFamily: fonts.body, fontSize: 13,
    color: colors.textTertiary, textAlign: 'center',
  },
  activityRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.divider,
  },
  activityIcon: {
    width: 32, height: 32, borderRadius: radius.subtle,
    alignItems: 'center', justifyContent: 'center',
  },
  activityBody: { flex: 1 },
  activityText: { fontFamily: fonts.body, fontSize: 13, color: colors.textPrimary },
  activityTime: { fontFamily: fonts.body, fontSize: 11, color: colors.textTertiary },
  tipCard: {
    backgroundColor: colors.bgElevated, borderWidth: 1,
    borderColor: colors.border, borderRadius: radius.subtle,
    padding: spacing.lg, flexDirection: 'row', gap: 12, alignItems: 'flex-start',
  },
  tipText: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, flex: 1, lineHeight: 20 },
})
