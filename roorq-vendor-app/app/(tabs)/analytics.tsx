import { useEffect, useState, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { TrendingUp, ChevronRight } from 'lucide-react-native'
import { supabase } from '../../lib/supabase'
import { AppHeader } from '../../src/components/common/AppHeader'
import { colors } from '../../src/constants/colors'
import { fonts } from '../../src/constants/typography'
import { spacing, radius } from '../../src/constants/spacing'

const PERIODS = ['week', 'month', 'all'] as const
type Period = typeof PERIODS[number]

function getNextFriday(): string {
  const d = new Date()
  const day = d.getDay()
  const daysUntilFriday = (5 - day + 7) % 7 || 7
  d.setDate(d.getDate() + daysUntilFriday)
  return d.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase()
}

function groupByWeek(orders: any[]) {
  const weeks: Record<string, { orders: any[]; weekStart: Date }> = {}
  orders.forEach(o => {
    const d = new Date(o.created_at)
    const monday = new Date(d)
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    monday.setHours(0, 0, 0, 0)
    const key = monday.toISOString()
    if (!weeks[key]) weeks[key] = { orders: [], weekStart: monday }
    weeks[key].orders.push(o)
  })
  return Object.values(weeks).sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime())
}

export default function EarningsScreen() {
  const router = useRouter()
  const [period, setPeriod] = useState<Period>('month')
  const [orders, setOrders] = useState<any[]>([])
  const [firstName, setFirstName] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); setRefreshing(false); return }

    const [{ data: ord }, { data: vendor }] = await Promise.all([
      supabase.from('orders').select('*').eq('vendor_id', user.id).order('created_at', { ascending: false }),
      supabase.from('vendors').select('full_name, shop_name').eq('id', user.id).single(),
    ])

    setOrders(ord || [])
    setFirstName((vendor?.full_name || vendor?.shop_name || '').split(' ')[0] || '')
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { load() }, [load])

  const now = Date.now()
  const filteredOrders = orders.filter(o => {
    if (period === 'all') return true
    const t = new Date(o.created_at).getTime()
    if (period === 'week') return t >= now - 7 * 86400000
    return t >= now - 30 * 86400000
  })

  const deliveredAll = orders.filter(o => o.status === 'delivered')
  const totalEarned = filteredOrders.filter(o => o.status === 'delivered').reduce((s, o) => s + Math.round((o.amount || 0) * 0.8), 0)
  const pendingPayout = deliveredAll.reduce((s, o) => s + Math.round((o.amount || 0) * 0.8), 0)
  const deliveredCount = deliveredAll.length

  // 8-week bar data
  const weeklyData = (() => {
    const weeks: number[] = []
    for (let i = 7; i >= 0; i--) {
      const weekStart = now - (i + 1) * 7 * 86400000
      const weekEnd = now - i * 7 * 86400000
      const total = orders.filter(o => {
        const t = new Date(o.created_at).getTime()
        return t >= weekStart && t < weekEnd
      }).reduce((s, o) => s + Math.round((o.amount || 0) * 0.8), 0)
      weeks.push(total)
    }
    return weeks
  })()
  const maxBar = Math.max(...weeklyData, 1)

  // Payout history: group by week
  const payoutHistory = groupByWeek(orders).slice(0, 8)

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <AppHeader firstName={firstName} pendingOrders={0} />
        <View style={styles.centered}><ActivityIndicator color={colors.textTertiary} /></View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <AppHeader firstName={firstName} pendingOrders={0} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} tintColor={colors.red} />}
      >
        {/* Page caption */}
        <View style={styles.px}>
          <Text style={styles.pageCaption}>EARNINGS</Text>
        </View>

        {/* Hero */}
        <View style={styles.px}>
          <Text style={styles.heroLabel}>
            {period === 'week' ? 'THIS WEEK' : period === 'month' ? 'THIS MONTH' : 'ALL TIME'}
          </Text>
          <Text style={styles.heroAmount}>₹{totalEarned.toLocaleString('en-IN')}</Text>
          <View style={styles.deltaRow}>
            <TrendingUp size={14} color={colors.verified} />
            <Text style={styles.deltaText}>
              ₹{Math.round(totalEarned * 0.15).toLocaleString('en-IN')} vs last month
            </Text>
          </View>
          <View style={styles.periodToggle}>
            {PERIODS.map(p => (
              <TouchableOpacity
                key={p}
                style={[styles.periodBtn, period === p && styles.periodBtnActive]}
                onPress={() => setPeriod(p)}
              >
                <Text style={[styles.periodBtnText, period === p && styles.periodBtnTextActive]}>
                  {p === 'week' ? 'Week' : p === 'month' ? 'Month' : 'All time'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Next payout card */}
        <View style={styles.px}>
          <View style={styles.payoutCard}>
            <Text style={styles.payoutCardLabel}>NEXT PAYOUT — {getNextFriday()}</Text>
            <Text style={styles.payoutCardAmount}>₹{pendingPayout.toLocaleString('en-IN')}</Text>
            <Text style={styles.payoutCardSub}>From {deliveredCount} delivered order{deliveredCount !== 1 ? 's' : ''}</Text>
            <TouchableOpacity style={styles.viewBreakdown}>
              <Text style={styles.viewBreakdownText}>View breakdown</Text>
              <ChevronRight size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bar chart */}
        <View style={styles.px}>
          <Text style={styles.sectionLabel}>LAST 8 WEEKS</Text>
          <View style={styles.chart}>
            {weeklyData.map((val, i) => (
              <View key={i} style={styles.barCol}>
                <View style={styles.barTrack}>
                  <View style={[
                    styles.bar,
                    { height: `${Math.max((val / maxBar) * 100, val > 0 ? 8 : 4)}%` as any },
                    i === weeklyData.length - 1 ? styles.barActive : styles.barInactive,
                  ]} />
                </View>
                <Text style={styles.barLabel}>W{i + 1}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Payout history */}
        <View style={styles.px}>
          <Text style={styles.sectionLabel}>PAYOUT HISTORY</Text>
          {payoutHistory.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyHistoryText}>No payout history yet. Orders will appear here.</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/list-item' as any)}>
                <Text style={styles.emptyBtnText}>LIST YOUR FIRST ITEM</Text>
              </TouchableOpacity>
            </View>
          ) : (
            payoutHistory.map((week, i) => {
              const weekTotal = week.orders.reduce((s: number, o: any) => s + Math.round((o.amount || 0) * 0.8), 0)
              const isPaid = week.orders.every((o: any) => o.status === 'delivered')
              const weekDate = week.weekStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
              return (
                <TouchableOpacity key={i} style={styles.historyRow} activeOpacity={0.7}>
                  <View style={styles.historyLeft}>
                    <Text style={styles.historyDate}>{weekDate}</Text>
                    <Text style={styles.historyOrders}>{week.orders.length} order{week.orders.length !== 1 ? 's' : ''}</Text>
                  </View>
                  <View style={styles.historyRight}>
                    <Text style={styles.historyAmount}>₹{weekTotal.toLocaleString('en-IN')}</Text>
                    <Text style={[styles.historyStatus, { color: isPaid ? colors.verified : colors.warning }]}>
                      {isPaid ? 'Paid' : 'Pending'}
                    </Text>
                  </View>
                  <ChevronRight size={14} color={colors.textTertiary} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              )
            })
          )}
        </View>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  px: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },

  pageCaption: { fontFamily: fonts.body, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: colors.textTertiary, marginTop: spacing.md },

  heroLabel: { fontFamily: fonts.body, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: colors.textTertiary, marginBottom: 4 },
  heroAmount: { fontFamily: fonts.mono, fontSize: 52, color: colors.textPrimary, lineHeight: 60 },
  deltaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, marginBottom: spacing.md },
  deltaText: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.verified },
  periodToggle: {
    flexDirection: 'row', backgroundColor: colors.bgElevated,
    borderRadius: radius.subtle, padding: 3,
  },
  periodBtn: { flex: 1, paddingVertical: 7, borderRadius: radius.subtle, alignItems: 'center' },
  periodBtnActive: { backgroundColor: colors.bgHigher },
  periodBtnText: { fontFamily: fonts.body, fontSize: 13, color: colors.textTertiary },
  periodBtnTextActive: { fontFamily: fonts.bodySemi, color: colors.textPrimary },

  payoutCard: {
    backgroundColor: colors.bgElevated,
    borderWidth: 1, borderColor: `${colors.red}60`,
    borderRadius: radius.subtle, padding: spacing.lg,
  },
  payoutCardLabel: { fontFamily: fonts.bodySemi, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: colors.red, marginBottom: 6 },
  payoutCardAmount: { fontFamily: fonts.mono, fontSize: 32, color: colors.textPrimary },
  payoutCardSub: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, marginTop: 4, marginBottom: spacing.md },
  viewBreakdown: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  viewBreakdownText: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.textSecondary },

  sectionLabel: { fontFamily: fonts.body, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: colors.textTertiary, marginBottom: 16 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 5 },
  barCol: { flex: 1, alignItems: 'center', gap: 6 },
  barTrack: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 3, minHeight: 4 },
  barActive: { backgroundColor: colors.red },
  barInactive: { backgroundColor: `${colors.textPrimary}25` },
  barLabel: { fontFamily: fonts.body, fontSize: 10, color: colors.textTertiary },

  historyRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.divider,
  },
  historyLeft: { flex: 1 },
  historyDate: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.textPrimary },
  historyOrders: { fontFamily: fonts.body, fontSize: 12, color: colors.textTertiary, marginTop: 2 },
  historyRight: { alignItems: 'flex-end' },
  historyAmount: { fontFamily: fonts.mono, fontSize: 15, color: colors.textPrimary },
  historyStatus: { fontFamily: fonts.bodySemi, fontSize: 12, marginTop: 2 },

  emptyHistory: { paddingVertical: spacing.xl, alignItems: 'center' },
  emptyHistoryText: { fontFamily: fonts.body, fontSize: 13, color: colors.textTertiary, textAlign: 'center', marginBottom: spacing.xl },
  emptyBtn: { height: 44, paddingHorizontal: spacing.xxl, backgroundColor: colors.red, borderRadius: radius.subtle, alignItems: 'center', justifyContent: 'center' },
  emptyBtnText: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.textPrimary },
})
