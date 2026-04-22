import { useEffect, useState, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, RefreshControl, ActivityIndicator, FlatList,
  Dimensions, Image,
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Search, Filter, Plus, Grid3X3, List, Eye, Heart } from 'lucide-react-native'
import { supabase } from '../../lib/supabase'
import { AppHeader } from '../../src/components/common/AppHeader'
import { colors } from '../../src/constants/colors'
import { fonts } from '../../src/constants/typography'
import { spacing, radius } from '../../src/constants/spacing'

const TABS = ['All', 'Live', 'Pending Review', 'Sold', 'Drafts']
const TAB_STATUS: Record<string, string> = {
  'Live': 'active', 'Pending Review': 'pending', 'Sold': 'sold', 'Drafts': 'draft',
}

const STATUS_CONFIG: Record<string, { dot: string; label: string; color: string; bg: string }> = {
  active:  { dot: colors.verified, label: 'LIVE',   color: colors.verified, bg: '#1a3d2a' },
  pending: { dot: colors.warning,  label: 'REVIEW', color: colors.warning,  bg: '#3d2e0a' },
  sold:    { dot: colors.red,      label: 'SOLD',   color: colors.red,      bg: colors.redMuted },
  draft:   { dot: colors.textTertiary, label: 'DRAFT', color: colors.textTertiary, bg: colors.bgHigher },
  rejected:{ dot: colors.red,     label: 'REJECTED',color: colors.red,      bg: colors.redMuted },
}

const { width } = Dimensions.get('window')
const CARD_SIZE = (width - spacing.xl * 2 - 12) / 2

export default function ListingsScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [products, setProducts] = useState<any[]>([])
  const [firstName, setFirstName] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    const [{ data }, { data: vendor }] = await Promise.all([
      supabase.from('products').select('*').eq('vendor_id', user.id).order('created_at', { ascending: false }),
      supabase.from('vendors').select('full_name, shop_name').eq('id', user.id).single(),
    ])
    setProducts(data || [])
    setFirstName((vendor?.full_name || vendor?.shop_name || '').split(' ')[0] || '')
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = products.filter(p => {
    const q = (p.title || p.name || '').toLowerCase()
    const matchSearch = q.includes(search.toLowerCase()) ||
      (p.brand || '').toLowerCase().includes(search.toLowerCase())
    if (activeTab === 'All') return matchSearch
    return matchSearch && p.status === TAB_STATUS[activeTab]
  })

  const counts: Record<string, number> = {
    All: products.length,
    Live: products.filter(p => p.status === 'active').length,
    'Pending Review': products.filter(p => p.status === 'pending').length,
    Sold: products.filter(p => p.status === 'sold').length,
    Drafts: products.filter(p => p.status === 'draft').length,
  }

  const cfg = (status: string) => STATUS_CONFIG[status] || STATUS_CONFIG.draft

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator color={colors.red} /></View>
  }

  const renderGridCard = ({ item: p }: { item: any }) => {
    const c = cfg(p.status)
    return (
      <TouchableOpacity
        style={styles.gridCard}
        onPress={() => router.push(`/list-item?id=${p.id}` as any)}
        activeOpacity={0.85}
      >
        <View style={styles.gridImageWrap}>
          {p.photo_url || (p.photos && p.photos[0]) ? (
            <Image
              source={{ uri: p.photo_url || p.photos[0] }}
              style={styles.gridImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.gridImagePlaceholder}>
              <Text style={styles.gridImageEmoji}>
                {p.category === 'Shoes' ? '👟' : p.category === 'Bag' ? '👜' : '👕'}
              </Text>
            </View>
          )}
          {/* Status badge */}
          <View style={[styles.statusBadge, { backgroundColor: 'rgba(13,13,13,0.8)' }]}>
            <View style={[styles.statusDot, { backgroundColor: c.dot }]} />
            <Text style={[styles.statusLabel, { color: c.color }]}>{c.label}</Text>
          </View>
          {/* Price overlay */}
          <View style={styles.priceOverlay}>
            <Text style={styles.priceOverlayText}>
              ₹{(p.price || 0).toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>{p.title || p.name}</Text>
        <View style={styles.cardMeta}>
          <Text style={styles.cardBrand}>{p.brand} · {p.size || '—'}</Text>
          {p.status === 'active' && (
            <View style={styles.cardStats}>
              <Eye size={10} color={colors.textTertiary} />
              <Text style={styles.cardStatText}>{p.views || 0}</Text>
              <Heart size={10} color={colors.textTertiary} />
              <Text style={styles.cardStatText}>{p.likes || 0}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  const renderListCard = (p: any) => {
    const c = cfg(p.status)
    return (
      <TouchableOpacity
        key={p.id}
        style={styles.listCard}
        onPress={() => router.push(`/list-item?id=${p.id}` as any)}
        activeOpacity={0.85}
      >
        <View style={styles.listImageWrap}>
          {p.photo_url || (p.photos && p.photos[0]) ? (
            <Image
              source={{ uri: p.photo_url || p.photos[0] }}
              style={styles.listImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.listImage, styles.listImagePlaceholder]}>
              <Text style={{ fontSize: 28 }}>
                {p.category === 'Shoes' ? '👟' : p.category === 'Bag' ? '👜' : '👕'}
              </Text>
            </View>
          )}
          {p.status === 'sold' && (
            <View style={styles.soldOverlay}>
              <Text style={styles.soldOverlayText}>SOLD</Text>
            </View>
          )}
        </View>
        <View style={styles.listBody}>
          <View style={styles.listTop}>
            <Text style={styles.listTitle} numberOfLines={1}>{p.title || p.name}</Text>
            <View style={[styles.listBadge, { backgroundColor: c.bg }]}>
              <View style={[styles.statusDot, { backgroundColor: c.dot }]} />
              <Text style={[styles.statusLabel, { color: c.color }]}>{c.label}</Text>
            </View>
          </View>
          <Text style={styles.listSub}>{p.brand} · {p.size} · {p.gender}</Text>
          <View style={styles.listBottom}>
            <Text style={styles.listPrice}>₹{(p.price || 0).toLocaleString('en-IN')}</Text>
            {p.status === 'active' && (
              <View style={styles.cardStats}>
                <Eye size={10} color={colors.textTertiary} />
                <Text style={styles.cardStatText}>{p.views || 0}</Text>
                <Heart size={10} color={colors.textTertiary} />
                <Text style={styles.cardStatText}>{p.likes || 0}</Text>
              </View>
            )}
            {p.status === 'pending' && (
              <Text style={{ fontFamily: fonts.body, fontSize: 11, color: colors.warning }}>Under review</Text>
            )}
            {p.status === 'draft' && (
              <Text style={{ fontFamily: fonts.body, fontSize: 11, color: colors.textTertiary }}>Draft</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <AppHeader firstName={firstName} pendingOrders={0} />

      <View style={styles.pageTitleRow}>
        <View>
          <Text style={styles.pageTitle}>Listings</Text>
          <Text style={styles.pageSub}>{products.length} items</Text>
        </View>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'grid' && styles.toggleBtnActive]}
            onPress={() => setViewMode('grid')}
          >
            <Grid3X3 size={14} color={viewMode === 'grid' ? colors.bg : colors.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
            onPress={() => setViewMode('list')}
          >
            <List size={14} color={viewMode === 'list' ? colors.bg : colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <Search size={15} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search items, brands..."
            placeholderTextColor={colors.textTertiary}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Filter size={16} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsContent}
      >
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            <View style={[styles.tabCount, activeTab === tab && styles.tabCountActive]}>
              <Text style={[styles.tabCountText, activeTab === tab && styles.tabCountTextActive]}>
                {counts[tab]}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Plus size={24} color={colors.textTertiary} />
          </View>
          <Text style={styles.emptyTitle}>
            {search ? 'No matching items' : 'No items yet'}
          </Text>
          <Text style={styles.emptySub}>
            {search ? 'Try different keywords.' : 'Your first listing takes 90 seconds.'}
          </Text>
          {!search && (
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/list-item')}>
              <Text style={styles.emptyBtnText}>LIST YOUR FIRST ITEM</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : viewMode === 'grid' ? (
        <FlatList
          data={filtered}
          numColumns={2}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load() }}
              tintColor={colors.red}
            />
          }
          renderItem={renderGridCard}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load() }}
              tintColor={colors.red}
            />
          }
        >
          {filtered.map(renderListCard)}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },

  pageTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.sm },
  pageTitle: { fontFamily: fonts.bodySemi, fontSize: 18, color: colors.textPrimary },
  pageSub: { fontFamily: fonts.body, fontSize: 12, color: colors.textTertiary },
  viewToggle: {
    flexDirection: 'row', backgroundColor: colors.bgElevated,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.subtle, overflow: 'hidden',
  },
  toggleBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  toggleBtnActive: { backgroundColor: colors.textPrimary },
  addBtn: {
    width: 32, height: 32, backgroundColor: colors.red,
    borderRadius: radius.subtle, alignItems: 'center', justifyContent: 'center',
  },

  searchRow: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: spacing.xl, marginBottom: spacing.md,
  },
  searchWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.bgElevated, borderWidth: 1,
    borderColor: colors.border, borderRadius: radius.subtle,
    paddingHorizontal: 12, height: 40,
  },
  searchInput: { flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.textPrimary, paddingVertical: 0 },
  filterBtn: {
    width: 40, height: 40, backgroundColor: colors.bgElevated,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.subtle, alignItems: 'center', justifyContent: 'center',
  },

  tabsScroll: { maxHeight: 44 },
  tabsContent: { paddingHorizontal: spacing.xl, gap: 8, alignItems: 'center' },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
  tabText: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.textSecondary },
  tabTextActive: { color: colors.bg },
  tabCount: {
    minWidth: 18, height: 16, borderRadius: 8,
    backgroundColor: colors.bgHigher, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabCountActive: { backgroundColor: 'rgba(13,13,13,0.2)' },
  tabCountText: { fontFamily: fonts.body, fontSize: 10, color: colors.textTertiary },
  tabCountTextActive: { color: colors.bg },

  // Grid
  grid: { padding: spacing.xl, paddingBottom: 40 },
  gridRow: { gap: 12, marginBottom: 12 },
  gridCard: { width: CARD_SIZE },
  gridImageWrap: {
    width: CARD_SIZE, height: CARD_SIZE * 1.25,
    borderRadius: radius.subtle, overflow: 'hidden',
    backgroundColor: colors.bgElevated, position: 'relative',
  },
  gridImage: { width: '100%', height: '100%' },
  gridImagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  gridImageEmoji: { fontSize: 48 },
  statusBadge: {
    position: 'absolute', top: 8, right: 8,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 6, paddingVertical: 3, borderRadius: 2,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusLabel: { fontFamily: fonts.body, fontSize: 10, letterSpacing: 0.5 },
  priceOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingTop: 20, paddingBottom: 8, paddingHorizontal: 8,
    backgroundColor: 'transparent',
  },
  priceOverlayText: {
    fontFamily: fonts.mono, fontSize: 14,
    color: colors.textPrimary,
  },
  cardTitle: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.textPrimary, marginTop: 8 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  cardBrand: { fontFamily: fonts.body, fontSize: 11, color: colors.textTertiary, flex: 1 },
  cardStats: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardStatText: { fontFamily: fonts.body, fontSize: 10, color: colors.textTertiary },

  // List
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: 40, gap: 12, paddingTop: 8 },
  listCard: {
    flexDirection: 'row', gap: 12,
    backgroundColor: colors.bgElevated, borderWidth: 1,
    borderColor: colors.border, borderRadius: radius.subtle, padding: 12,
  },
  listImageWrap: { width: 80, height: 96, borderRadius: radius.subtle, overflow: 'hidden', position: 'relative' },
  listImage: { width: 80, height: 96 },
  listImagePlaceholder: { backgroundColor: colors.bgHigher, alignItems: 'center', justifyContent: 'center' },
  soldOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13,13,13,0.6)',
    alignItems: 'center', justifyContent: 'center',
  },
  soldOverlayText: { fontFamily: fonts.bodySemi, fontSize: 10, color: colors.red, letterSpacing: 1 },
  listBody: { flex: 1, justifyContent: 'space-between' },
  listTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  listTitle: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.textPrimary, flex: 1 },
  listBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2,
  },
  listSub: { fontFamily: fonts.body, fontSize: 12, color: colors.textTertiary, marginTop: 4 },
  listBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  listPrice: { fontFamily: fonts.mono, fontSize: 16, color: colors.textPrimary },

  // Empty
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingTop: 60 },
  emptyIcon: {
    width: 64, height: 64, backgroundColor: colors.bgElevated,
    borderRadius: radius.subtle, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg,
  },
  emptyTitle: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.textPrimary, marginBottom: 4 },
  emptySub: { fontFamily: fonts.body, fontSize: 13, color: colors.textTertiary, textAlign: 'center', marginBottom: spacing.xl },
  emptyBtn: { paddingHorizontal: spacing.xxl, paddingVertical: 12, backgroundColor: colors.red, borderRadius: radius.subtle },
  emptyBtnText: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.textPrimary },
})
