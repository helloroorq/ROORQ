import { useEffect, useState, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Package } from 'lucide-react-native'
import { supabase } from '../../lib/supabase'
import { AppHeader } from '../../src/components/common/AppHeader'
import { colors } from '../../src/constants/colors'
import { fonts } from '../../src/constants/typography'
import { spacing, radius } from '../../src/constants/spacing'

const TABS = ['New', 'Processing', 'Shipped', 'Delivered', 'Returned']
const TAB_STATUS: Record<string, string> = {
  New: 'pending', Processing: 'processing',
  Shipped: 'shipped', Delivered: 'delivered', Returned: 'cancelled',
}
const STATUS_CONFIG: Record<string, { color: string; dotColor: string; label: string }> = {
  pending:    { color: colors.warning,  dotColor: colors.warning,  label: 'NEW' },
  processing: { color: colors.info,     dotColor: colors.info,     label: 'PROCESSING' },
  shipped:    { color: colors.textSecondary, dotColor: colors.textSecondary, label: 'SHIPPED' },
  delivered:  { color: colors.verified, dotColor: colors.verified, label: 'DELIVERED' },
  cancelled:  { color: colors.red,      dotColor: colors.red,      label: 'RETURNED' },
}

export default function OrdersScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('New')
  const [orders, setOrders] = useState<any[]>([])
  const [firstName, setFirstName] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); setRefreshing(false); return }
    const [{ data }, { data: vendor }] = await Promise.all([
      supabase.from('orders').select('*').eq('vendor_id', user.id).order('created_at', { ascending: false }),
      supabase.from('vendors').select('full_name, shop_name').eq('id', user.id).single(),
    ])
    setOrders(data || [])
    setFirstName((vendor?.full_name || vendor?.shop_name || '').split(' ')[0] || '')
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = orders.filter(o => o.status === TAB_STATUS[activeTab])
  const pendingCount = orders.filter(o => o.status === 'pending').length

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
      <AppHeader firstName={firstName} pendingOrders={pendingCount} />
      <View style={styles.pageTitleRow}>
        <Text style={styles.pageTitle}>Orders</Text>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabsContent}>
        {TABS.map(tab => {
          const count = orders.filter(o => o.status === TAB_STATUS[tab]).length
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
              {tab === 'New' && pendingCount > 0 && <View style={styles.tabDot} />}
              {count > 0 && (
                <Text style={[styles.tabCount, activeTab === tab && styles.tabCountActive]}>{count}</Text>
              )}
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {/* Order list */}
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} tintColor={colors.red} />}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Package size={32} color={colors.textTertiary} />
            </View>
            <Text style={styles.emptyTitle}>
              {orders.length === 0 ? 'No orders yet' : `No ${activeTab.toLowerCase()} orders`}
            </Text>
            <Text style={styles.emptySub}>
              {orders.length === 0
                ? 'List your vintage items and your orders will appear here once customers buy.'
                : 'Orders with this status will show up here.'}
            </Text>
            {orders.length === 0 && (
              <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/list-item' as any)}>
                <Text style={styles.emptyBtnText}>LIST YOUR FIRST ITEM</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filtered.map(order => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
            return (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => router.push(`/order-detail?id=${order.id}` as any)}
                activeOpacity={0.85}
              >
                <View style={styles.orderTop}>
                  <View style={styles.orderStatus}>
                    <View style={[styles.statusDot, { backgroundColor: cfg.dotColor }]} />
                    <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                    <Text style={styles.orderId}>#{order.id?.slice(0, 8)}</Text>
                  </View>
                  <Text style={styles.orderAmount}>₹{(order.amount || 0).toLocaleString('en-IN')}</Text>
                </View>
                <Text style={styles.orderItem} numberOfLines={1}>
                  {order.item_name || 'Vintage item'}
                </Text>
                <View style={styles.orderBottom}>
                  <Text style={styles.orderBuyer}>
                    Buyer: {(order.buyer_name || 'Customer').split(' ')[0]}. · {order.city || 'India'}
                  </Text>
                  {order.status === 'pending' && (
                    <Text style={styles.packWarning}>Pack within 18h</Text>
                  )}
                </View>
              </TouchableOpacity>
            )
          })
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },

  pageTitleRow: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.md },
  pageTitle: { fontFamily: fonts.bodySemi, fontSize: 18, color: colors.textPrimary },
  tabsScroll: { maxHeight: 42 },
  tabsContent: { paddingHorizontal: spacing.xl, gap: 8, alignItems: 'center' },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
  tabText: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.textSecondary },
  tabTextActive: { color: colors.bg },
  tabDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.red },
  tabCount: {
    fontFamily: fonts.body, fontSize: 10,
    color: colors.textTertiary,
    backgroundColor: colors.bgElevated,
    paddingHorizontal: 5, paddingVertical: 1, borderRadius: 8,
  },
  tabCountActive: { backgroundColor: 'rgba(0,0,0,0.15)', color: colors.bg },
  list: { padding: spacing.xl, gap: spacing.md },
  orderCard: {
    backgroundColor: colors.bgElevated, borderWidth: 1,
    borderColor: colors.border, borderRadius: radius.subtle, padding: spacing.lg,
  },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderStatus: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontFamily: fonts.bodySemi, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase' },
  orderId: { fontFamily: fonts.body, fontSize: 11, color: colors.textTertiary },
  orderAmount: { fontFamily: fonts.mono, fontSize: 15, color: colors.textPrimary },
  orderItem: { fontFamily: fonts.body, fontSize: 14, color: colors.textPrimary, marginBottom: 6 },
  orderBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderBuyer: { fontFamily: fonts.body, fontSize: 12, color: colors.textTertiary },
  packWarning: { fontFamily: fonts.body, fontSize: 11, color: colors.warning },
  empty: { paddingTop: 48, paddingHorizontal: spacing.xxl, alignItems: 'center' },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl,
  },
  emptyTitle: { fontFamily: fonts.bodySemi, fontSize: 18, color: colors.textPrimary, marginBottom: 8 },
  emptySub: { fontFamily: fonts.body, fontSize: 13, color: colors.textTertiary, textAlign: 'center', lineHeight: 20, marginBottom: spacing.xxl },
  emptyBtn: {
    height: 46, paddingHorizontal: spacing.xxl,
    backgroundColor: colors.red, borderRadius: radius.subtle,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyBtnText: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.textPrimary },
})
