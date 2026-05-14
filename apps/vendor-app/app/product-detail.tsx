import { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Image, ActivityIndicator, Modal, TextInput, Alert,
  Dimensions, KeyboardAvoidingView, Platform, Linking,
} from 'react-native'
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ChevronLeft, CheckCircle, Play, Eye, Heart, Clock, X } from 'lucide-react-native'
import { supabase } from '../lib/supabase'
import { colors } from '../src/constants/colors'
import { spacing, radius } from '../src/constants/spacing'

const { width: SCREEN_W } = Dimensions.get('window')

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  approved: { label: 'Active',   color: '#1D9E75' },
  pending:  { label: 'Pending',  color: '#F59E0B' },
  rejected: { label: 'Rejected', color: '#C0392B' },
  delisted: { label: 'Delisted', color: '#888780' },
}

interface Product {
  id: string
  title: string
  name: string
  price: number
  photo_urls: string[] | null
  verification_video_url: string | null
  approval_status: string
  status: string
  category: string | null
  size: string | null
  condition: string | null
  brand: string | null
  color: string | null
  description: string | null
  created_at: string
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [photoIndex, setPhotoIndex] = useState(0)

  // Edit price sheet
  const [editVisible, setEditVisible] = useState(false)
  const [priceInput, setPriceInput] = useState('')
  const [saving, setSaving] = useState(false)

  // Delist
  const [delisting, setDelisting] = useState(false)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('id,title,name,price,photo_urls,verification_video_url,approval_status,status,category,size,condition,brand,color,description,created_at')
      .eq('id', id)
      .single()
    if (!error && data) setProduct(data as Product)
    setLoading(false)
  }, [id])

  useFocusEffect(useCallback(() => { load() }, [load]))

  // ─── Edit price ─────────────────────────────────────────────────────────────

  const priceNum = parseFloat(priceInput) || 0
  const priceValid = priceNum >= 99 && priceNum <= 9999
  const priceError =
    priceInput && parseFloat(priceInput) > 0 && !priceValid
      ? priceNum < 99 ? 'Minimum price is ₹99' : 'Maximum price is ₹9999'
      : null
  const payoutPreview = priceValid ? (priceNum * 0.8).toFixed(2) : '0.00'

  const openEditPrice = () => {
    setPriceInput(String(product?.price ?? ''))
    setEditVisible(true)
  }

  const savePrice = async () => {
    if (!product || !priceValid) return
    setSaving(true)
    const { error } = await supabase
      .from('products')
      .update({ price: priceNum })
      .eq('id', product.id)
    setSaving(false)
    if (error) { Alert.alert('Error', error.message); return }
    setEditVisible(false)
    setProduct(prev => prev ? { ...prev, price: priceNum } : prev)
  }

  // ─── Delist ──────────────────────────────────────────────────────────────────

  const handleDelist = () => {
    if (!product) return
    const displayName = product.title || product.name
    Alert.alert(
      'Delist Item',
      `Are you sure you want to delist '${displayName}'? It will no longer be visible to buyers.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delist',
          style: 'destructive',
          onPress: async () => {
            setDelisting(true)
            const { error } = await supabase
              .from('products')
              .update({ approval_status: 'delisted', status: 'delisted' })
              .eq('id', product.id)
            setDelisting(false)
            if (error) { Alert.alert('Error', error.message); return }
            setProduct(prev =>
              prev ? { ...prev, approval_status: 'delisted', status: 'delisted' } : prev
            )
          },
        },
      ]
    )
  }

  // ─── Loading / error states ──────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={[s.container, s.center, { paddingTop: insets.top }]}>
        <StatusBar style="light" />
        <ActivityIndicator color={colors.red} size="large" />
      </View>
    )
  }

  if (!product) {
    return (
      <View style={[s.container, s.center, { paddingTop: insets.top }]}>
        <StatusBar style="light" />
        <Text style={s.notFoundText}>Product not found</Text>
      </View>
    )
  }

  const photos = product.photo_urls ?? []
  const isVerified = !!product.verification_video_url
  const statusInfo = STATUS_LABELS[product.approval_status] ?? STATUS_LABELS.pending
  const isActive = product.approval_status === 'approved'
  const daysListed = Math.floor(
    (Date.now() - new Date(product.created_at).getTime()) / (1000 * 60 * 60 * 24)
  )

  const detailRows = [
    { label: 'Category',  value: product.category },
    { label: 'Size',      value: product.size },
    { label: 'Condition', value: product.condition },
    { label: 'Brand',     value: product.brand },
    { label: 'Color',     value: product.color },
  ].filter((r): r is { label: string; value: string } => Boolean(r.value))

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} hitSlop={8}>
          <ChevronLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Product Detail</Text>
        <View style={s.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>

        {/* ── Photo carousel ── */}
        <View style={s.carouselWrap}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={e => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W)
              setPhotoIndex(idx)
            }}
          >
            {photos.length > 0 ? (
              photos.map((uri, i) => (
                <Image key={i} source={{ uri }} style={s.carouselImg} />
              ))
            ) : (
              <View style={[s.carouselImg, s.carouselPlaceholder]}>
                <Text style={s.placeholderEmoji}>📷</Text>
              </View>
            )}
          </ScrollView>

          {/* ROORQ Verified badge */}
          {isVerified && (
            <View style={s.verifiedBadge}>
              <CheckCircle size={13} color={colors.red} fill={colors.textPrimary} />
              <Text style={s.verifiedBadgeText}>ROORQ Verified</Text>
            </View>
          )}

          {/* Photo position dots */}
          {photos.length > 1 && (
            <View style={s.dotsRow}>
              {photos.map((_, i) => (
                <View key={i} style={[s.dot, i === photoIndex && s.dotActive]} />
              ))}
            </View>
          )}

          {/* "X of Y" label */}
          {photos.length > 1 && (
            <View style={s.photoCountBadge}>
              <Text style={s.photoCountText}>{photoIndex + 1} of {photos.length}</Text>
            </View>
          )}
        </View>

        {/* ── Name, Price, Status ── */}
        <View style={s.infoSection}>
          <Text style={s.productName}>{product.title || product.name}</Text>
          <View style={s.priceStatusRow}>
            <Text style={s.price}>₹{product.price?.toLocaleString('en-IN')}</Text>
            <View style={[s.statusPill, { backgroundColor: `${statusInfo.color}20` }]}>
              <Text style={[s.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
            </View>
          </View>
        </View>

        {/* ── Stats ── */}
        <View style={s.statsRow}>
          <View style={s.statItem}>
            <Eye size={14} color={colors.textTertiary} />
            <Text style={s.statLabel}>Views: 0</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Heart size={14} color={colors.textTertiary} />
            <Text style={s.statLabel}>Saves: 0</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Clock size={14} color={colors.textTertiary} />
            <Text style={s.statLabel}>Days Listed: {daysListed}</Text>
          </View>
        </View>

        {/* ── Product details ── */}
        {detailRows.length > 0 && (
          <View style={s.detailsSection}>
            <Text style={s.sectionLabel}>DETAILS</Text>
            {detailRows.map(({ label, value }) => (
              <View key={label} style={s.detailRow}>
                <Text style={s.detailKey}>{label}</Text>
                <Text style={s.detailVal}>{value}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Description */}
        {product.description ? (
          <View style={s.descSection}>
            <Text style={s.sectionLabel}>DESCRIPTION</Text>
            <Text style={s.descText}>{product.description}</Text>
          </View>
        ) : null}

        {/* ── Verification video ── */}
        {product.verification_video_url && (
          <View style={s.videoSection}>
            <Text style={s.sectionLabel}>VERIFICATION VIDEO</Text>
            <TouchableOpacity
              style={s.videoThumbWrap}
              onPress={() => Linking.openURL(product.verification_video_url!)}
              activeOpacity={0.85}
            >
              {photos[0] && <Image source={{ uri: photos[0] }} style={s.videoThumb} />}
              <View style={s.playOverlay}>
                <View style={s.playCircle}>
                  <Play size={20} color={colors.textPrimary} fill={colors.textPrimary} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Action buttons ── */}
        <View style={s.actionsSection}>
          {isActive && (
            <>
              <TouchableOpacity style={s.editBtn} onPress={openEditPrice} activeOpacity={0.85}>
                <Text style={s.editBtnText}>Edit Price</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.delistBtn, delisting && s.btnDisabled]}
                onPress={handleDelist}
                disabled={delisting}
                activeOpacity={0.85}
              >
                {delisting
                  ? <ActivityIndicator size="small" color={colors.red} />
                  : <Text style={s.delistBtnText}>Delist Item</Text>}
              </TouchableOpacity>
            </>
          )}

          {product.approval_status === 'pending' && (
            <View style={s.statusNote}>
              <Text style={s.statusNoteText}>
                Your product is pending verification. Edit options unlock once approved.
              </Text>
            </View>
          )}
          {product.approval_status === 'delisted' && (
            <View style={s.statusNote}>
              <Text style={s.statusNoteText}>This item has been delisted and is not visible to buyers.</Text>
            </View>
          )}
          {product.approval_status === 'rejected' && (
            <View style={[s.statusNote, { borderColor: `${colors.red}40`, backgroundColor: `${colors.red}10` }]}>
              <Text style={[s.statusNoteText, { color: colors.red }]}>
                This listing was rejected. Please contact support.
              </Text>
            </View>
          )}
        </View>

      </ScrollView>

      {/* ── Edit Price Bottom Sheet ── */}
      <Modal
        visible={editVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditVisible(false)}
      >
        <KeyboardAvoidingView
          style={s.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity style={s.modalBackdrop} activeOpacity={1} onPress={() => setEditVisible(false)} />
          <View style={[s.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
            <View style={s.sheetHandle} />

            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>Edit Price</Text>
              <TouchableOpacity hitSlop={8} onPress={() => setEditVisible(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={[s.priceInputRow, priceError ? s.priceInputRowError : null]}>
              <Text style={s.rupeeSymbol}>₹</Text>
              <TextInput
                style={s.priceField}
                value={priceInput}
                onChangeText={setPriceInput}
                keyboardType="numeric"
                autoFocus
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
              />
            </View>

            {priceError ? (
              <Text style={s.priceErrText}>{priceError}</Text>
            ) : null}

            {priceValid && (
              <View style={s.payoutPreviewRow}>
                <Text style={s.payoutKey}>You'll receive</Text>
                <Text style={s.payoutVal}>₹{payoutPreview}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[s.saveBtn, (!priceValid || saving) && s.btnDisabled]}
              onPress={savePrice}
              disabled={!priceValid || saving}
              activeOpacity={0.85}
            >
              {saving
                ? <ActivityIndicator size="small" color={colors.textPrimary} />
                : <Text style={s.saveBtnText}>Save Price</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: colors.bg },
  center:         { alignItems: 'center', justifyContent: 'center' },
  notFoundText:   { color: colors.textSecondary, fontSize: 15 },

  // Header
  header:         {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.divider,
  },
  backBtn:        {
    width: 36, height: 36, backgroundColor: colors.bgElevated,
    borderRadius: radius.subtle, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle:    { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  headerSpacer:   { width: 36 },

  // Carousel
  carouselWrap:   { position: 'relative' },
  carouselImg:    { width: SCREEN_W, aspectRatio: 1 },
  carouselPlaceholder: {
    backgroundColor: colors.bgElevated, alignItems: 'center', justifyContent: 'center',
  },
  placeholderEmoji: { fontSize: 48 },
  verifiedBadge:  {
    position: 'absolute', top: 12, right: 12,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  verifiedBadgeText: { fontSize: 11, color: colors.textPrimary, fontWeight: '700' },
  dotsRow:        {
    position: 'absolute', bottom: 12, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 5,
  },
  dot:            { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive:      { backgroundColor: colors.textPrimary, width: 18 },
  photoCountBadge: {
    position: 'absolute', bottom: 12, right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  photoCountText: { fontSize: 11, color: colors.textPrimary, fontWeight: '600' },

  // Info
  infoSection:    { padding: spacing.xl, paddingBottom: spacing.md },
  productName:    {
    fontSize: 20, fontWeight: '700', color: colors.textPrimary,
    marginBottom: spacing.sm, lineHeight: 28,
  },
  priceStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  price:          { fontSize: 28, fontWeight: '800', color: colors.textPrimary },
  statusPill:     { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText:     { fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },

  // Stats
  statsRow:       {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: spacing.xl, marginBottom: spacing.xl,
    backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.subtle, paddingVertical: 14,
  },
  statItem:       { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  statLabel:      { fontSize: 12, color: colors.textTertiary, fontWeight: '600' },
  statDivider:    { width: 1, height: 16, backgroundColor: colors.border },

  // Details
  detailsSection: {
    marginHorizontal: spacing.xl, marginBottom: spacing.xl,
    backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.subtle, overflow: 'hidden',
  },
  sectionLabel:   {
    fontSize: 10, letterSpacing: 1.5, color: colors.textTertiary, fontWeight: '700',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  detailRow:      {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: colors.divider,
  },
  detailKey:      { fontSize: 13, color: colors.textTertiary, fontWeight: '600' },
  detailVal:      { fontSize: 13, color: colors.textPrimary, fontWeight: '600', textAlign: 'right', flex: 1, marginLeft: 8 },

  // Description
  descSection:    { marginHorizontal: spacing.xl, marginBottom: spacing.xl },
  descText:       {
    fontSize: 14, color: colors.textSecondary, lineHeight: 22,
    marginTop: 4,
  },

  // Video
  videoSection:   { marginHorizontal: spacing.xl, marginBottom: spacing.xl },
  videoThumbWrap: {
    height: 180, borderRadius: radius.subtle, overflow: 'hidden',
    backgroundColor: colors.bgElevated, marginTop: 8,
  },
  videoThumb:     { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  playOverlay:    {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center',
  },
  playCircle:     {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center',
  },

  // Actions
  actionsSection: { marginHorizontal: spacing.xl, gap: 12, marginBottom: spacing.xl },
  editBtn:        {
    height: 52, backgroundColor: colors.red, borderRadius: radius.subtle,
    alignItems: 'center', justifyContent: 'center',
  },
  editBtnText:    { fontSize: 14, fontWeight: '700', color: colors.textPrimary, letterSpacing: 0.5 },
  delistBtn:      {
    height: 52, borderRadius: radius.subtle, borderWidth: 1, borderColor: colors.red,
    alignItems: 'center', justifyContent: 'center',
  },
  delistBtnText:  { fontSize: 14, fontWeight: '700', color: colors.red },
  btnDisabled:    { opacity: 0.4 },
  statusNote:     {
    borderRadius: radius.subtle, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.bgElevated, padding: spacing.lg,
  },
  statusNoteText: { fontSize: 13, color: colors.textTertiary, lineHeight: 20 },

  // Modal sheet
  modalOverlay:   { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop:  { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet:          {
    backgroundColor: colors.bgElevated, borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet, padding: spacing.xl, paddingTop: 12,
  },
  sheetHandle:    {
    width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border,
    alignSelf: 'center', marginBottom: spacing.xl,
  },
  sheetHeader:    {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.xl,
  },
  sheetTitle:     { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  priceInputRow:  {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgHigher, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.subtle, paddingHorizontal: spacing.lg, marginBottom: spacing.sm,
  },
  priceInputRowError: { borderColor: colors.red },
  rupeeSymbol:    { fontSize: 24, color: colors.textSecondary, marginRight: 4 },
  priceField:     {
    flex: 1, height: 60, fontSize: 30, fontWeight: '700', color: colors.textPrimary,
  },
  priceErrText:   { fontSize: 12, color: colors.red, marginBottom: spacing.sm },
  payoutPreviewRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: `${colors.verified}15`, borderRadius: radius.subtle,
    paddingHorizontal: spacing.lg, paddingVertical: 12, marginBottom: spacing.xl,
  },
  payoutKey:      { fontSize: 14, color: colors.textSecondary },
  payoutVal:      { fontSize: 16, fontWeight: '700', color: colors.verified },
  saveBtn:        {
    height: 52, backgroundColor: colors.red, borderRadius: radius.subtle,
    alignItems: 'center', justifyContent: 'center',
  },
  saveBtnText:    { fontSize: 14, fontWeight: '700', color: colors.textPrimary, letterSpacing: 0.5 },
})
