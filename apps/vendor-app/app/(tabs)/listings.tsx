import { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Image, ActivityIndicator,
} from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Plus, CheckCircle } from 'lucide-react-native'
import { supabase } from '../../lib/supabase'
import { colors } from '../../src/constants/colors'
import { spacing, radius } from '../../src/constants/spacing'

type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'delisted'
type TabFilter = 'all' | 'active' | 'sold' | 'pending'

interface Product {
  id: string
  title: string
  name: string
  price: number
  photo_urls: string[] | null
  verification_video_url: string | null
  approval_status: ApprovalStatus
  status: string
  created_at: string
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  approved: { label: 'Active',              color: '#1D9E75' },
  pending:  { label: 'Pending Verification',color: '#F59E0B' },
  rejected: { label: 'Rejected',            color: '#C0392B' },
  delisted: { label: 'Delisted',            color: '#888780' },
}

export default function ListingsScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabFilter>('all')

  const load = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data, error } = await supabase
      .from('products')
      .select('id,title,name,price,photo_urls,verification_video_url,approval_status,status,created_at')
      .eq('vendor_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) setProducts(data as Product[])
    setLoading(false)
  }, [])

  // Reload whenever the tab gains focus (so new listings appear immediately)
  useFocusEffect(useCallback(() => { load() }, [load]))

  const filtered = products.filter(p => {
    if (tab === 'all')     return true
    if (tab === 'active')  return p.approval_status === 'approved'
    if (tab === 'sold')    return p.status === 'sold'
    if (tab === 'pending') return p.approval_status === 'pending'
    return true
  })

  const count = products.length

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.headerTitle}>My Listings</Text>
          {count > 0 && (
            <View style={s.countBadge}>
              <Text style={s.countText}>{count}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={s.addBtn}
          onPress={() => router.push('/list-item' as any)}
          activeOpacity={0.85}
        >
          <Plus size={16} color={colors.textPrimary} />
          <Text style={s.addBtnText}>ADD</Text>
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      <View style={s.tabs}>
        {(['all', 'active', 'sold', 'pending'] as TabFilter[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[s.tab, tab === t && s.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>
              {t === 'all'     ? 'All'
               : t === 'active' ? 'Active'
               : t === 'sold'   ? 'Sold'
               : 'Pending'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={colors.red} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>📦</Text>
          <Text style={s.emptyTitle}>
            {tab === 'all' ? 'No listings yet' : `No ${tab} listings`}
          </Text>
          <Text style={s.emptyBody}>
            {tab === 'all'
              ? 'Add your first product and start selling.'
              : `Your ${tab} products will appear here.`}
          </Text>
          {tab === 'all' && (
            <TouchableOpacity
              style={s.emptyAddBtn}
              onPress={() => router.push('/list-item' as any)}
              activeOpacity={0.85}
            >
              <Plus size={16} color={colors.textPrimary} />
              <Text style={s.emptyAddBtnText}>ADD NEW PRODUCT</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={p => p.id}
          numColumns={2}
          contentContainerStyle={s.grid}
          columnWrapperStyle={s.gridRow}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: p }) => {
            const cover = p.photo_urls?.[0] ?? null
            const isVerified = !!p.verification_video_url
            const statusInfo = STATUS_LABELS[p.approval_status] ?? STATUS_LABELS.pending
            return (
              <TouchableOpacity
                style={s.card}
                activeOpacity={0.85}
                onPress={() => router.push(`/product-detail?id=${p.id}` as any)}
              >
                {/* Photo */}
                <View style={s.photoWrap}>
                  {cover ? (
                    <Image source={{ uri: cover }} style={s.photo} />
                  ) : (
                    <View style={[s.photo, s.photoPlaceholder]}>
                      <Text style={s.photoPlaceholderText}>📷</Text>
                    </View>
                  )}

                  {/* ROORQ Verified badge */}
                  {isVerified && (
                    <View style={s.verifiedBadge}>
                      <CheckCircle size={13} color={colors.red} fill={colors.textPrimary} />
                    </View>
                  )}
                </View>

                {/* Info */}
                <View style={s.cardBody}>
                  <Text style={s.cardName} numberOfLines={2}>
                    {p.title || p.name}
                  </Text>
                  <Text style={s.cardPrice}>₹{p.price?.toLocaleString('en-IN')}</Text>
                  <View style={[s.statusPill, { backgroundColor: `${statusInfo.color}20` }]}>
                    <Text style={[s.statusText, { color: statusInfo.color }]}>
                      {statusInfo.label}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )
          }}
        />
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container:          { flex: 1, backgroundColor: colors.bg },
  center:             { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header:             {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.divider,
  },
  headerLeft:         { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle:        { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  countBadge:         {
    backgroundColor: colors.red, borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  countText:          { fontSize: 12, color: colors.textPrimary, fontWeight: '700' },
  addBtn:             {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.red, paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: radius.subtle,
  },
  addBtnText:         { fontSize: 12, fontWeight: '700', letterSpacing: 1, color: colors.textPrimary },

  tabs:               {
    flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.divider,
  },
  tab:                {
    flex: 1, paddingVertical: 10, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive:          { borderBottomColor: colors.red },
  tabText:            { fontSize: 12, color: colors.textTertiary, fontWeight: '600' },
  tabTextActive:      { color: colors.textPrimary },

  empty:              {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: spacing.xl * 2,
  },
  emptyIcon:          { fontSize: 44, marginBottom: spacing.lg },
  emptyTitle:         { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  emptyBody:          {
    fontSize: 14, color: colors.textTertiary, textAlign: 'center',
    lineHeight: 21, marginBottom: spacing.xl,
  },
  emptyAddBtn:        {
    height: 50, backgroundColor: colors.red, borderRadius: radius.subtle,
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  emptyAddBtnText:    { fontSize: 13, fontWeight: '700', letterSpacing: 1.5, color: colors.textPrimary },

  grid:               { padding: spacing.lg, paddingBottom: 32 },
  gridRow:            { gap: spacing.lg, marginBottom: spacing.lg },
  card:               {
    flex: 1, backgroundColor: colors.bgElevated,
    borderRadius: radius.subtle, borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden',
  },
  photoWrap:          { position: 'relative' },
  photo:              { width: '100%', aspectRatio: 1 },
  photoPlaceholder:   { backgroundColor: colors.bgHigher, alignItems: 'center', justifyContent: 'center' },
  photoPlaceholderText: { fontSize: 28 },
  verifiedBadge:      {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: colors.textPrimary, borderRadius: 10,
    padding: 3,
  },
  cardBody:           { padding: 10 },
  cardName:           { fontSize: 12, color: colors.textPrimary, fontWeight: '600', lineHeight: 16, marginBottom: 4 },
  cardPrice:          { fontSize: 14, color: colors.textPrimary, fontWeight: '700', marginBottom: 6 },
  statusPill:         { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  statusText:         { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
})
