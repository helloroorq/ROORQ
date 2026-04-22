import { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react-native'
import { supabase } from '../lib/supabase'
import { colors } from '../src/constants/colors'
import { fonts } from '../src/constants/typography'
import { spacing, radius } from '../src/constants/spacing'

const TIMELINE = [
  { key: 'placed',    label: 'Order placed' },
  { key: 'payment',   label: 'Payment confirmed' },
  { key: 'packed',    label: 'Pack your item' },
  { key: 'pickup',    label: 'Awaiting pickup' },
  { key: 'transit',   label: 'In transit' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'payout',    label: 'Payout included (Friday)' },
]
const STATUS_STEP: Record<string, number> = {
  pending: 2, processing: 3, shipped: 4, delivered: 6,
}

export default function OrderDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [order, setOrder] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!id) return

    // ─── FIXED: query vendor_orders + vendor_order_items ───
    // RLS ensures vendor can only see their own orders
    const loadOrder = async () => {
      const { data: vOrder } = await supabase
        .from('vendor_orders')
        .select(`
          *,
          vendor_order_items (
            id,
            quantity,
            price_at_purchase,
            product:products ( id, name, images )
          ),
          parent_order:parent_orders (
            order_number,
            shipping_address,
            payment_method,
            payment_status
          )
        `)
        .eq('id', id)
        .single()

      setOrder(vOrder)
      setItems(vOrder?.vendor_order_items || [])
      setLoading(false)
    }

    loadOrder()
  }, [id])

  // ─── FIXED: update vendor_orders (not orders) ───
  const updateStatus = async (newStatus: string) => {
    setUpdating(true)
    const updates: any = { status: newStatus, updated_at: new Date().toISOString() }
    if (newStatus === 'shipped') updates.shipped_at = new Date().toISOString()
    if (newStatus === 'delivered') updates.delivered_at = new Date().toISOString()

    const { data } = await supabase
      .from('vendor_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    setOrder(data)
    setUpdating(false)
  }

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator color={colors.textTertiary} /></View>
  }
  if (!order) {
    return <View style={styles.centered}><Text style={styles.notFound}>Order not found</Text></View>
  }

  const currentStep = STATUS_STEP[order.status] ?? 0

  const statusColor = order.status === 'delivered' ? colors.verified
    : order.status === 'pending' ? colors.warning
    : order.status === 'shipped' ? colors.info
    : order.status === 'cancelled' ? colors.red
    : colors.textSecondary

  // Use real vendor_orders columns
  const subtotal = Number(order.subtotal || 0)
  const commission = Number(order.platform_commission || 0)
  const payout = Number(order.vendor_payout || 0)

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={18} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerLabel}>ORDER DETAILS</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Order ID + status */}
        <View style={styles.px}>
          <View style={styles.orderMeta}>
            <View>
              <Text style={styles.orderId}>#{order.id?.slice(0, 12)}</Text>
              <Text style={styles.orderDate}>
                {new Date(order.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </Text>
            </View>
            <View style={[styles.statusBadge, { borderColor: `${statusColor}40` }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {order.status === 'pending' ? 'NEW' : (order.status || '').toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Product cards — from vendor_order_items */}
        <View style={styles.px}>
          {items.map(item => (
            <View key={item.id} style={styles.productCard}>
              <View style={styles.productThumb}>
                <Text style={styles.productEmoji}>📦</Text>
              </View>
              <View style={styles.productBody}>
                <Text style={styles.productName} numberOfLines={2}>
                  {item.product?.name || 'Vintage item'}
                </Text>
                <Text style={styles.productQty}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.productPrice}>
                ₹{Number(item.price_at_purchase || 0).toLocaleString('en-IN')}
              </Text>
            </View>
          ))}
        </View>

        {/* Shipping address (from parent_order) */}
        {order.parent_order?.shipping_address && (
          <View style={styles.px}>
            <Text style={styles.sectionLabel}>DELIVERY</Text>
            <View style={styles.addressCard}>
              <Text style={styles.addressText}>
                {typeof order.parent_order.shipping_address === 'object'
                  ? [
                      order.parent_order.shipping_address.hostel,
                      order.parent_order.shipping_address.room,
                      order.parent_order.shipping_address.name,
                    ].filter(Boolean).join(' · ')
                  : String(order.parent_order.shipping_address)
                }
              </Text>
            </View>
          </View>
        )}

        {/* Timeline */}
        <View style={styles.px}>
          <Text style={styles.sectionLabel}>TIMELINE</Text>
          {TIMELINE.map((step, idx) => {
            const isDone = idx < currentStep
            const isCurrent = idx === currentStep
            return (
              <View key={step.key} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <View style={[
                    styles.timelineCircle,
                    isDone && styles.timelineCircleDone,
                    isCurrent && styles.timelineCircleCurrent,
                  ]}>
                    {isDone
                      ? <CheckCircle size={12} color="#fff" />
                      : isCurrent
                        ? <Clock size={12} color={colors.bg} />
                        : <View style={styles.timelineDot} />}
                  </View>
                  {idx < TIMELINE.length - 1 && (
                    <View style={[styles.timelineLine, isDone && styles.timelineLineDone]} />
                  )}
                </View>
                <View style={styles.timelineBody}>
                  <Text style={[
                    styles.timelineLabel,
                    isDone && { color: colors.textPrimary },
                    isCurrent && { color: colors.warning, fontFamily: fonts.bodySemi },
                  ]}>
                    {step.label}
                    {isCurrent && order.status === 'pending' && (
                      <Text style={styles.actionNeeded}> — ACTION NEEDED</Text>
                    )}
                  </Text>
                </View>
              </View>
            )
          })}
        </View>

        {/* Payout breakdown — using real vendor_orders columns */}
        <View style={styles.px}>
          <View style={styles.payoutBreakdown}>
            <View style={styles.payoutRow}>
              <Text style={styles.payoutKey}>Subtotal</Text>
              <Text style={styles.payoutVal}>₹{subtotal.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.payoutRow}>
              <Text style={styles.payoutKey}>ROORQ commission</Text>
              <Text style={[styles.payoutVal, { color: colors.red }]}>
                -₹{commission.toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={[styles.payoutRow, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }]}>
              <Text style={[styles.payoutKey, { fontFamily: fonts.bodySemi, color: colors.textPrimary }]}>You receive</Text>
              <Text style={[styles.payoutVal, { color: colors.verified, fontFamily: fonts.bodySemi }]}>
                ₹{payout.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        {order.status === 'pending' && (
          <TouchableOpacity
            style={[styles.primaryAction, updating && { opacity: 0.6 }]}
            onPress={() => updateStatus('processing')} disabled={updating}
            activeOpacity={0.85}
          >
            {updating && <ActivityIndicator size="small" color={colors.textPrimary} style={{ marginRight: 8 }} />}
            <Text style={styles.primaryActionText}>Mark as Packed & Ready</Text>
          </TouchableOpacity>
        )}
        {order.status === 'processing' && (
          <TouchableOpacity
            style={[styles.secondaryAction, updating && { opacity: 0.6 }]}
            onPress={() => updateStatus('shipped')} disabled={updating}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryActionText}>Mark as Shipped</Text>
          </TouchableOpacity>
        )}
        {order.status === 'shipped' && (
          <TouchableOpacity style={styles.secondaryAction} activeOpacity={0.85}>
            <Text style={styles.secondaryActionText}>Track Package</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.whatsappBtn}>
          <Text style={styles.whatsappBtnText}>Need help? Chat on WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  notFound: { fontFamily: fonts.body, fontSize: 14, color: colors.textTertiary },
  px: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingTop: 12, paddingBottom: spacing.md,
  },
  backBtn: {
    width: 36, height: 36, backgroundColor: colors.bgElevated,
    borderRadius: radius.subtle, alignItems: 'center', justifyContent: 'center',
  },
  headerLabel: { fontFamily: fonts.body, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: colors.textTertiary },
  orderMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orderId: { fontFamily: fonts.mono, fontSize: 18, color: colors.textPrimary },
  orderDate: { fontFamily: fonts.body, fontSize: 12, color: colors.textTertiary, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: colors.bgElevated, borderWidth: 1, borderRadius: radius.subtle,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontFamily: fonts.bodySemi, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase' },
  productCard: {
    backgroundColor: colors.bgElevated, borderWidth: 1,
    borderColor: colors.border, borderRadius: radius.subtle,
    padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12,
    marginBottom: 8,
  },
  productThumb: {
    width: 56, height: 56, backgroundColor: colors.bgHigher,
    borderRadius: radius.subtle, alignItems: 'center', justifyContent: 'center',
  },
  productEmoji: { fontSize: 28 },
  productBody: { flex: 1 },
  productName: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.textPrimary },
  productQty: { fontFamily: fonts.body, fontSize: 12, color: colors.textTertiary, marginTop: 2 },
  productPrice: { fontFamily: fonts.mono, fontSize: 15, color: colors.textPrimary },
  sectionLabel: { fontFamily: fonts.body, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: colors.textTertiary, marginBottom: 12 },
  addressCard: {
    backgroundColor: colors.bgElevated, borderWidth: 1,
    borderColor: colors.border, borderRadius: radius.subtle, padding: 12,
  },
  addressText: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  timelineRow: { flexDirection: 'row', gap: 12 },
  timelineLeft: { alignItems: 'center', width: 24 },
  timelineCircle: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.bgHigher, alignItems: 'center', justifyContent: 'center',
  },
  timelineCircleDone: { backgroundColor: colors.verified },
  timelineCircleCurrent: { backgroundColor: colors.warning },
  timelineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.textTertiary },
  timelineLine: { width: 1, height: 24, backgroundColor: colors.border, marginTop: 2 },
  timelineLineDone: { backgroundColor: colors.verified },
  timelineBody: { flex: 1, paddingBottom: 8 },
  timelineLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.textTertiary },
  actionNeeded: { fontFamily: fonts.bodySemi, fontSize: 11, color: colors.warning },
  payoutBreakdown: {
    backgroundColor: colors.bgElevated, borderWidth: 1,
    borderColor: colors.border, borderRadius: radius.subtle, padding: spacing.lg,
  },
  payoutRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  payoutKey: { fontFamily: fonts.body, fontSize: 13, color: colors.textTertiary },
  payoutVal: { fontFamily: fonts.mono, fontSize: 13, color: colors.textSecondary },
  actions: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.bg, borderTopWidth: 1,
    borderTopColor: colors.divider, padding: spacing.xl, gap: 10,
    paddingBottom: 32,
  },
  primaryAction: {
    height: 52, backgroundColor: colors.red, borderRadius: radius.subtle,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  primaryActionText: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.textPrimary },
  secondaryAction: {
    height: 52, backgroundColor: colors.bgElevated,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.subtle, alignItems: 'center', justifyContent: 'center',
  },
  secondaryActionText: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.textPrimary },
  whatsappBtn: {
    height: 44, borderWidth: 1, borderColor: `${colors.verified}40`,
    borderRadius: radius.subtle, alignItems: 'center', justifyContent: 'center',
  },
  whatsappBtnText: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.verified },
})