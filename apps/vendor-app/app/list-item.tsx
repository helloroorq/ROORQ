import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert, Image,
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { X, Camera, Plus, Sparkles, Trash2, Video, CheckCircle } from 'lucide-react-native'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../lib/supabase'
import { RoorqLogo } from '../src/components/common/RoorqLogo'
import { colors } from '../src/constants/colors'
import { fonts } from '../src/constants/typography'
import { spacing, radius } from '../src/constants/spacing'

const BRANDS = ['Nike','Adidas','Levi\'s','Tommy Hilfiger','Calvin Klein','Lacoste','Champion','Carhartt','Polo Ralph Lauren','Fila','Puma','Reebok','Diesel','Wrangler','H&M','Zara','Uniqlo','Gap','No brand','Other']
const CATEGORIES = ['Tee','Shirt','Jacket','Jeans','Trouser','Sweater','Hoodie','Dress','Skirt','Shoes','Bag','Accessory']
const GENDERS = ['Men\'s','Women\'s','Unisex']
const SIZES = ['XS','S','M','L','XL','XXL','Free Size']
const CONDITIONS = [
  { val: 'excellent',  label: 'Excellent',  desc: 'Like new, no visible wear' },
  { val: 'very_good',  label: 'Very Good',  desc: 'Light signs of wear' },
  { val: 'good',       label: 'Good',       desc: 'Clear wear but fully wearable' },
  { val: 'fair',       label: 'Fair',       desc: 'Well-loved, priced accordingly' },
]

export default function ListItemScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [photos, setPhotos] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [brand, setBrand] = useState('')
  const [showBrands, setShowBrands] = useState(false)
  const [brandSearch, setBrandSearch] = useState('')
  const [category, setCategory] = useState('')
  const [gender, setGender] = useState('')
  const [size, setSize] = useState('')
  const [condition, setCondition] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [hasVideo, setHasVideo] = useState(false)

  const pickPhoto = async (index: number) => {
    Alert.alert('Add Photo', 'Choose source', [
      {
        text: 'Camera', onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync()
          if (status !== 'granted') { Alert.alert('Camera permission is required'); return }
          const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.85 })
          if (!result.canceled && result.assets[0]) {
            const updated = [...photos]
            updated[index] = result.assets[0].uri
            setPhotos(updated)
          }
        },
      },
      {
        text: 'Gallery', onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
          if (status !== 'granted') { Alert.alert('Gallery permission is required'); return }
          const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.85 })
          if (!result.canceled && result.assets[0]) {
            const updated = [...photos]
            updated[index] = result.assets[0].uri
            setPhotos(updated)
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ])
  }

  const removePhoto = (index: number) => {
    const updated = [...photos]
    updated.splice(index, 1)
    setPhotos(updated)
  }

  const fee = price ? Math.round(parseFloat(price) * 0.2) : 0
  const payout = price ? Math.round(parseFloat(price) * 0.8) : 0
  const filteredBrands = BRANDS.filter(b => b.toLowerCase().includes(brandSearch.toLowerCase()))

  const handleSubmit = async () => {
    if (!title.trim()) { Alert.alert('Title is required'); return }
    if (!brand) { Alert.alert('Brand is required'); return }
    if (!category) { Alert.alert('Category is required'); return }
    if (!price || parseFloat(price) <= 0) { Alert.alert('Price is required'); return }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const { error } = await supabase.from('products').insert({
      vendor_id: user.id,
      title: title.trim(),
      name: title.trim(),
      brand,
      category,
      gender,
      size,
      condition,
      price: parseFloat(price),
      description,
      status: 'pending',
    })
    setSaving(false)
    if (error) { Alert.alert('Failed to save', error.message); return }
    Alert.alert('Submitted!', 'Your item is under review. We\'ll notify you within 24h.', [
      { text: 'View Listings', onPress: () => router.replace('/(tabs)/listings' as any) },
      { text: 'List Another', onPress: () => router.replace('/list-item' as any) },
    ])
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" />

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <X size={18} color={colors.textPrimary} />
        </TouchableOpacity>
        <RoorqLogo width={80} />
        <TouchableOpacity><Text style={styles.draftText}>Save draft</Text></TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Photos */}
        <View style={styles.section}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosRow}>
            {/* Cover slot */}
            <TouchableOpacity style={styles.coverSlot} onPress={() => pickPhoto(0)}>
              {photos[0] ? (
                <>
                  <Image source={{ uri: photos[0] }} style={styles.slotImage} />
                  <TouchableOpacity style={styles.removeBtn} onPress={() => removePhoto(0)}>
                    <Trash2 size={12} color={colors.textPrimary} />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Camera size={22} color={colors.textTertiary} />
                  <Text style={styles.coverSlotText}>COVER PHOTO</Text>
                </>
              )}
            </TouchableOpacity>
            {[1,2,3,4,5].map(i => (
              <TouchableOpacity key={i} style={styles.photoSlot} onPress={() => pickPhoto(i)}>
                {photos[i] ? (
                  <>
                    <Image source={{ uri: photos[i] }} style={styles.slotImage} />
                    <TouchableOpacity style={styles.removeBtn} onPress={() => removePhoto(i)}>
                      <Trash2 size={12} color={colors.textPrimary} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <Plus size={16} color={colors.textTertiary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.photoHint}>4–6 photos · Front, back, brand tag, details</Text>
        </View>

        {/* Video Upload */}
        <View style={styles.field}>
          <TouchableOpacity
            style={[styles.videoSlot, hasVideo && styles.videoSlotActive]}
            onPress={() => setHasVideo(v => !v)}
            activeOpacity={0.85}
          >
            <View style={[styles.videoIcon, hasVideo && styles.videoIconActive]}>
              {hasVideo
                ? <CheckCircle size={22} color={colors.verified} />
                : <Video size={22} color={colors.textTertiary} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.videoTitle, hasVideo && { color: colors.verified }]}>
                {hasVideo ? 'Video added' : 'Add a short video'}
              </Text>
              <Text style={styles.videoSub}>15–30 sec · Show fit, fabric & details</Text>
            </View>
            {!hasVideo && <Plus size={18} color={colors.textTertiary} />}
          </TouchableOpacity>
          <View style={styles.videoNotice}>
            <Sparkles size={13} color={colors.red} />
            <Text style={styles.videoNoticeText}>
              Listings with video are{' '}
              <Text style={{ color: colors.textPrimary, fontFamily: fonts.bodySemi }}>3x more likely to get approved</Text>
              {' '}by ROORQ and sell faster!
            </Text>
          </View>
        </View>

        {/* Title */}
        <View style={styles.field}>
          <Text style={styles.label}>TITLE *</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input} value={title} onChangeText={setTitle}
              placeholder="e.g., 90s Nike Swoosh Tee"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        </View>

        {/* Brand */}
        <View style={styles.field}>
          <Text style={styles.label}>BRAND *</Text>
          <TouchableOpacity style={styles.inputWrap} onPress={() => setShowBrands(v => !v)}>
            <Text style={[styles.input, { lineHeight: 48, color: brand ? colors.textPrimary : colors.textTertiary }]}>
              {brand || 'Select brand'}
            </Text>
          </TouchableOpacity>
          {showBrands && (
            <View style={styles.dropdown}>
              <View style={styles.dropSearch}>
                <TextInput
                  style={styles.dropSearchInput} value={brandSearch} onChangeText={setBrandSearch}
                  placeholder="Search..." placeholderTextColor={colors.textTertiary}
                />
              </View>
              <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled>
                {filteredBrands.map(b => (
                  <TouchableOpacity key={b} style={styles.dropItem}
                    onPress={() => { setBrand(b); setShowBrands(false); setBrandSearch('') }}>
                    <Text style={[styles.dropText, brand === b && { color: colors.textPrimary }]}>{b}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Category */}
        <View style={styles.field}>
          <Text style={styles.label}>CATEGORY *</Text>
          <View style={styles.chipGrid}>
            {CATEGORIES.map(c => (
              <TouchableOpacity key={c}
                style={[styles.chip, category === c && styles.chipSelected]}
                onPress={() => setCategory(c)}>
                <Text style={[styles.chipText, category === c && styles.chipTextSelected]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Gender */}
        <View style={styles.field}>
          <Text style={styles.label}>GENDER *</Text>
          <View style={styles.chipRow}>
            {GENDERS.map(g => (
              <TouchableOpacity key={g}
                style={[styles.chip, styles.chipWide, gender === g && styles.chipSelected]}
                onPress={() => setGender(g)}>
                <Text style={[styles.chipText, gender === g && styles.chipTextSelected]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Size */}
        <View style={styles.field}>
          <Text style={styles.label}>SIZE *</Text>
          <View style={styles.chipGrid}>
            {SIZES.map(s => (
              <TouchableOpacity key={s}
                style={[styles.sizeChip, size === s && styles.chipSelected]}
                onPress={() => setSize(s)}>
                <Text style={[styles.chipText, size === s && styles.chipTextSelected]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Condition */}
        <View style={styles.field}>
          <Text style={styles.label}>CONDITION *</Text>
          <View style={styles.conditionList}>
            {CONDITIONS.map(c => (
              <TouchableOpacity key={c.val}
                style={[styles.conditionCard, condition === c.val && styles.conditionCardSelected]}
                onPress={() => setCondition(c.val)}>
                <Text style={[styles.conditionLabel, condition === c.val && { color: colors.textPrimary }]}>{c.label}</Text>
                <Text style={styles.conditionDesc}>{c.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Price */}
        <View style={styles.field}>
          <Text style={styles.label}>PRICE *</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.rupeePrefix}>₹</Text>
            <TextInput
              style={[styles.input, styles.priceInput]}
              value={price} onChangeText={setPrice}
              placeholder="0" placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
            />
          </View>
          {price && parseFloat(price) > 0 && (
            <View style={styles.payoutCard}>
              <View style={styles.payoutRow}>
                <Text style={styles.payoutKey}>You'll receive:</Text>
                <Text style={[styles.payoutVal, { color: colors.verified }]}>₹{payout.toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.payoutRow}>
                <Text style={styles.payoutKey}>ROORQ fee (20%):</Text>
                <Text style={styles.payoutVal}>₹{fee.toLocaleString('en-IN')}</Text>
              </View>
              <View style={[styles.payoutRow, styles.payoutDivider]}>
                <Text style={styles.payoutKey}>Buyer pays:</Text>
                <Text style={[styles.payoutVal, { color: colors.textPrimary }]}>₹{parseFloat(price).toLocaleString('en-IN')}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>DESCRIPTION</Text>
          <View style={[styles.inputWrap, { alignItems: 'flex-start', paddingVertical: 12 }]}>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              value={description} onChangeText={t => setDescription(t.slice(0, 300))}
              placeholder="Tell the story. Era, fit, any quirks or unique details."
              placeholderTextColor={colors.textTertiary}
              multiline numberOfLines={3}
            />
          </View>
          <View style={styles.descFooter}>
            <TouchableOpacity style={styles.aiBtn}>
              <Sparkles size={12} color={colors.warning} />
              <Text style={styles.aiBtnText}>Auto-generate description</Text>
            </TouchableOpacity>
            <Text style={styles.charCount}>{description.length}/300</Text>
          </View>
        </View>

        {/* Verified notice */}
        <View style={[styles.field, { marginBottom: 100 }]}>
          <View style={styles.verifiedNotice}>
            <Text style={styles.verifiedText}>
              Our team creates a <Text style={{ color: colors.textPrimary, fontFamily: fonts.bodySemi }}>ROORQ Verified</Text> video from your photos within 24h. Your item goes live after verification.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky bottom */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.saveDraftBtn}>
          <Text style={styles.saveDraftText}>Save Draft</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitBtn, saving && { opacity: 0.6 }]}
          onPress={handleSubmit} disabled={saving} activeOpacity={0.85}
        >
          {saving && <ActivityIndicator size="small" color={colors.textPrimary} style={{ marginRight: 8 }} />}
          <Text style={styles.submitText}>{saving ? 'Submitting...' : 'Submit for Review'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: colors.divider,
  },
  closeBtn: {
    width: 36, height: 36, backgroundColor: colors.bgElevated,
    borderRadius: radius.subtle, alignItems: 'center', justifyContent: 'center',
  },
  topLabel: { fontFamily: fonts.body, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: colors.textTertiary },
  draftText: { fontFamily: fonts.body, fontSize: 13, color: colors.textTertiary },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  section: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  field: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  label: { fontFamily: fonts.body, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: colors.textTertiary, marginBottom: spacing.sm },
  photosRow: { gap: 10, paddingBottom: 4 },
  coverSlot: {
    width: 112, height: 112, backgroundColor: colors.bgElevated,
    borderWidth: 2, borderStyle: 'dashed', borderColor: colors.border,
    borderRadius: radius.subtle, alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  coverSlotText: { fontFamily: fonts.body, fontSize: 10, letterSpacing: 1, color: colors.textTertiary, textTransform: 'uppercase' },
  photoSlot: {
    width: 80, height: 112, backgroundColor: colors.bgElevated,
    borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border,
    borderRadius: radius.subtle, alignItems: 'center', justifyContent: 'center',
  },
  photoHint: { fontFamily: fonts.body, fontSize: 11, color: colors.textTertiary, marginTop: spacing.sm },
  videoSlot: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.bgElevated, borderWidth: 2, borderStyle: 'dashed',
    borderColor: colors.border, borderRadius: radius.subtle, padding: 14,
  },
  videoSlotActive: { borderColor: `${colors.verified}50`, backgroundColor: `${colors.verified}08` },
  videoIcon: {
    width: 48, height: 48, borderRadius: radius.subtle,
    backgroundColor: colors.bgHigher, alignItems: 'center', justifyContent: 'center',
  },
  videoIconActive: { backgroundColor: `${colors.verified}20` },
  videoTitle: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.textPrimary },
  videoSub: { fontFamily: fonts.body, fontSize: 11, color: colors.textTertiary, marginTop: 2 },
  videoNotice: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: `${colors.red}10`, borderWidth: 1, borderColor: `${colors.red}30`,
    borderRadius: radius.subtle, paddingHorizontal: 12, paddingVertical: 10, marginTop: 8,
  },
  videoNoticeText: { fontFamily: fonts.body, fontSize: 11, color: colors.textSecondary, flex: 1, lineHeight: 16 },
  slotImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: radius.subtle },
  removeBtn: {
    position: 'absolute', top: 4, right: 4,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center',
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgElevated, borderWidth: 1,
    borderColor: colors.border, borderRadius: radius.subtle, paddingHorizontal: 14,
  },
  input: { flex: 1, height: 48, fontFamily: fonts.body, fontSize: 15, color: colors.textPrimary, paddingVertical: 0 },
  rupeePrefix: { fontFamily: fonts.mono, fontSize: 24, color: colors.textSecondary, marginRight: 4 },
  priceInput: { fontFamily: fonts.mono, fontSize: 28, height: 56 },
  dropdown: {
    backgroundColor: colors.bgElevated, borderWidth: 1,
    borderColor: colors.border, borderRadius: radius.subtle, marginTop: 4, zIndex: 50,
  },
  dropSearch: { padding: 8 },
  dropSearchInput: {
    backgroundColor: colors.bgHigher, borderWidth: 1,
    borderColor: colors.border, borderRadius: radius.subtle,
    paddingHorizontal: 12, paddingVertical: 8,
    fontFamily: fonts.body, fontSize: 14, color: colors.textPrimary,
  },
  dropItem: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.divider },
  dropText: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipRow: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: radius.subtle, borderWidth: 1, borderColor: colors.border,
  },
  chipWide: { flex: 1, alignItems: 'center' },
  chipSelected: { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
  chipText: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.textSecondary },
  chipTextSelected: { color: colors.bg },
  sizeChip: {
    width: 48, height: 40, borderRadius: radius.subtle,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  conditionList: { gap: 8 },
  conditionCard: {
    padding: 14, borderRadius: radius.subtle,
    borderWidth: 1, borderColor: colors.border,
  },
  conditionCardSelected: { borderColor: colors.textPrimary, backgroundColor: colors.bgElevated },
  conditionLabel: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.textSecondary },
  conditionDesc: { fontFamily: fonts.body, fontSize: 12, color: colors.textTertiary, marginTop: 2 },
  payoutCard: {
    backgroundColor: colors.bgElevated, borderWidth: 1,
    borderColor: colors.border, borderRadius: radius.subtle, padding: 12, marginTop: 10,
  },
  payoutRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  payoutDivider: { borderTopWidth: 1, borderTopColor: colors.divider, paddingTop: 6, marginTop: 2 },
  payoutKey: { fontFamily: fonts.body, fontSize: 13, color: colors.textTertiary },
  payoutVal: { fontFamily: fonts.mono, fontSize: 13, color: colors.textSecondary },
  descFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  aiBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  aiBtnText: { fontFamily: fonts.body, fontSize: 12, color: colors.warning },
  charCount: { fontFamily: fonts.body, fontSize: 11, color: colors.textTertiary },
  verifiedNotice: {
    backgroundColor: colors.bgElevated, borderWidth: 1,
    borderColor: colors.border, borderRadius: radius.subtle, padding: spacing.lg,
  },
  verifiedText: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 12, padding: spacing.xl, paddingBottom: 32,
    backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.divider,
  },
  saveDraftBtn: {
    width: '35%', height: 52, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.subtle, alignItems: 'center', justifyContent: 'center',
  },
  saveDraftText: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.textSecondary },
  submitBtn: {
    flex: 1, height: 52, backgroundColor: colors.red,
    borderRadius: radius.subtle, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
  },
  submitText: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.textPrimary },
})
