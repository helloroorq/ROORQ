import { useState, useRef } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert, Image, Linking,
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { X, Camera, Plus, ChevronLeft, CheckCircle, Shield, RefreshCw, Play } from 'lucide-react-native'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../lib/supabase'
import { generateVerificationVideo } from '../lib/higgsfield'
import { RoorqLogo } from '../src/components/common/RoorqLogo'
import { colors } from '../src/constants/colors'
import { spacing, radius } from '../src/constants/spacing'

const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Footwear', 'Accessories', 'Other']
const SIZES_DEFAULT = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size']
const SIZES_FOOTWEAR = ['UK 5', 'UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11']
const CONDITIONS = [
  { val: 'mint',      label: 'Mint',      desc: 'Brand new, never worn' },
  { val: 'excellent', label: 'Excellent', desc: 'Like new, no visible wear' },
  { val: 'good',      label: 'Good',      desc: 'Clear wear but fully wearable' },
  { val: 'fair',      label: 'Fair',      desc: 'Well-loved, priced accordingly' },
]
const MAX_PHOTOS = 6

type Step = 1 | 2 | 3

export default function ListItemScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [step, setStep] = useState<Step>(1)

  // Step 1 — photos
  const [photoUris, setPhotoUris] = useState<(string | null)[]>(Array(MAX_PHOTOS).fill(null))
  const [photoUploading, setPhotoUploading] = useState<boolean[]>(Array(MAX_PHOTOS).fill(false))
  const [photoStorageUrls, setPhotoStorageUrls] = useState<(string | null)[]>(Array(MAX_PHOTOS).fill(null))

  // Step 2 — details
  const [productName, setProductName] = useState('')
  const [category, setCategory] = useState('')
  const [size, setSize] = useState('')
  const [condition, setCondition] = useState('')
  const [brand, setBrand] = useState('')
  const [color, setColor] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')

  // Step 3 — verification
  const [generatingVideo, setGeneratingVideo] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [manualVerification, setManualVerification] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const retryCountRef = useRef(0)

  // Derived
  const hasPhotos = photoUris.some(p => p !== null)
  const uploadedPhotoUrls = photoStorageUrls.filter((u): u is string => u !== null)
  const priceNum = parseFloat(price) || 0
  const priceValid = priceNum >= 99 && priceNum <= 9999
  const priceError =
    price && parseFloat(price) > 0 && !priceValid
      ? priceNum < 99 ? 'Minimum price is ₹99' : 'Maximum price is ₹9999'
      : null
  const payoutStr = price && priceValid ? (priceNum * 0.8).toFixed(2) : '0.00'
  const feeStr   = price && priceValid ? (priceNum * 0.2).toFixed(2) : '0.00'
  const step2Valid =
    productName.trim().length > 0 && category && size && condition && price && priceValid

  const sizes = category === 'Footwear' ? SIZES_FOOTWEAR : SIZES_DEFAULT

  // ─── Photo helpers ──────────────────────────────────────────────────────────

  const pickPhoto = (index: number) => {
    const filled = photoUris.filter(p => p !== null).length
    if (filled >= MAX_PHOTOS) {
      Alert.alert('Maximum 6 photos reached')
      return
    }
    Alert.alert('Add Photo', 'Choose source', [
      {
        text: 'Camera',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync()
          if (status !== 'granted') { Alert.alert('Camera permission required'); return }
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
          })
          if (!result.canceled && result.assets[0]) uploadPhoto(index, result.assets[0].uri)
        },
      },
      {
        text: 'Gallery',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
          if (status !== 'granted') { Alert.alert('Gallery permission required'); return }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
          })
          if (!result.canceled && result.assets[0]) uploadPhoto(index, result.assets[0].uri)
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ])
  }

  const uploadPhoto = async (index: number, uri: string) => {
    // Show preview immediately
    setPhotoUris(prev => { const u = [...prev]; u[index] = uri; return u })
    setPhotoUploading(prev => { const u = [...prev]; u[index] = true; return u })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpg'
      const filename = `${user.id}/${Date.now()}_${index}.${ext}`

      const response = await fetch(uri)
      const blob = await response.blob()
      const arrayBuffer = await new Response(blob).arrayBuffer()

      const { error } = await supabase.storage
        .from('product-photos')
        .upload(filename, arrayBuffer, {
          contentType: blob.type || 'image/jpeg',
          upsert: false,
        })
      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('product-photos')
        .getPublicUrl(filename)

      setPhotoStorageUrls(prev => { const u = [...prev]; u[index] = publicUrl; return u })
    } catch (err: any) {
      Alert.alert('Upload failed', err.message ?? 'Could not upload photo')
      setPhotoUris(prev => { const u = [...prev]; u[index] = null; return u })
    } finally {
      setPhotoUploading(prev => { const u = [...prev]; u[index] = false; return u })
    }
  }

  const removePhoto = (index: number) => {
    setPhotoUris(prev => { const u = [...prev]; u[index] = null; return u })
    setPhotoStorageUrls(prev => { const u = [...prev]; u[index] = null; return u })
  }

  const onPhotoPress = (index: number) => {
    if (!photoUris[index]) { pickPhoto(index); return }
    Alert.alert('Photo', undefined, [
      { text: 'Replace', onPress: () => { removePhoto(index); pickPhoto(index) } },
      { text: 'Remove', style: 'destructive', onPress: () => removePhoto(index) },
      { text: 'Cancel', style: 'cancel' },
    ])
  }

  // ─── Video generation ───────────────────────────────────────────────────────

  const handleGenerateVideo = async () => {
    setVideoUrl(null)
    setVideoError(null)
    setManualVerification(false)
    setGeneratingVideo(true)

    try {
      const urls = uploadedPhotoUrls.length > 0
        ? uploadedPhotoUrls
        : photoUris.filter((u): u is string => u !== null)

      const url = await generateVerificationVideo(urls)
      setVideoUrl(url)
      retryCountRef.current = 0
    } catch (err: any) {
      retryCountRef.current += 1
      if (retryCountRef.current >= 3) {
        setManualVerification(true)
      } else {
        setVideoError(err.message ?? 'Video generation failed. Try again.')
      }
    } finally {
      setGeneratingVideo(false)
    }
  }

  // ─── Final submit ───────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('products').insert({
        vendor_id: user.id,
        title: productName.trim(),
        name: productName.trim(),
        brand: brand.trim(),
        category,
        size,
        condition,
        color: color.trim(),
        description: description.trim(),
        price: priceNum,
        photo_urls: uploadedPhotoUrls,
        verification_video_url: videoUrl,
        status: 'pending',
        approval_status: 'pending',
      })
      if (error) throw error

      router.replace('/(tabs)/listings' as any)
      setTimeout(() =>
        Alert.alert('Listed!', 'Product listed! ROORQ Verified badge active.'),
        300
      )
    } catch (err: any) {
      Alert.alert('Submission failed', err.message ?? 'Something went wrong. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Back handler ───────────────────────────────────────────────────────────

  const goBack = () => {
    if (step === 1) router.back()
    else setStep(s => (s - 1) as Step)
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  const STEP_LABELS: Record<Step, string> = {
    1: '1 OF 3  ·  PHOTOS',
    2: '2 OF 3  ·  DETAILS',
    3: '3 OF 3  ·  VERIFY',
  }

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />

      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={s.backBtn} onPress={goBack} hitSlop={8}>
          {step === 1
            ? <X size={18} color={colors.textPrimary} />
            : <ChevronLeft size={20} color={colors.textPrimary} />}
        </TouchableOpacity>
        <RoorqLogo width={80} />
        <View style={s.stepDots}>
          {([1, 2, 3] as Step[]).map(n => (
            <View key={n} style={[s.dot, step === n && s.dotActive]} />
          ))}
        </View>
      </View>

      {/* Step label */}
      <View style={s.stepLabelRow}>
        <Text style={s.stepLabel}>{STEP_LABELS[step]}</Text>
      </View>

      {/* ── STEP 1: PHOTOS ── */}
      {step === 1 && (
        <>
          <ScrollView style={s.scroll} contentContainerStyle={s.scrollPad} showsVerticalScrollIndicator={false}>
            <Text style={s.stepTitle}>Add Photos</Text>
            <Text style={s.stepSubtitle}>Start with the main photo. Up to 6 total.</Text>

            <View style={s.photoGrid}>
              {/* Primary (large) slot */}
              <View style={s.primaryWrap}>
                <TouchableOpacity
                  style={s.primarySlot}
                  onPress={() => onPhotoPress(0)}
                  activeOpacity={0.8}
                >
                  {photoUris[0] ? (
                    <>
                      <Image source={{ uri: photoUris[0] }} style={s.slotImg} />
                      {photoUploading[0] && (
                        <View style={s.uploadOverlay}>
                          <ActivityIndicator color={colors.textPrimary} />
                        </View>
                      )}
                      {photoStorageUrls[0] && !photoUploading[0] && (
                        <View style={s.uploadedBadge}>
                          <CheckCircle size={14} color={colors.verified} />
                        </View>
                      )}
                    </>
                  ) : (
                    <>
                      <Camera size={26} color={colors.textTertiary} />
                      <Text style={s.primarySlotLabel}>MAIN PHOTO</Text>
                      <Text style={s.primarySlotSub}>Shown in listings</Text>
                    </>
                  )}
                </TouchableOpacity>
                {photoUris[0] && (
                  <TouchableOpacity style={s.removeBtn} onPress={() => removePhoto(0)} hitSlop={4}>
                    <X size={10} color={colors.textPrimary} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Secondary 5 slots */}
              <View style={s.secondaryGrid}>
                {[1, 2, 3, 4, 5].map(i => (
                  <View key={i} style={s.secondaryWrap}>
                    <TouchableOpacity
                      style={s.secondarySlot}
                      onPress={() => onPhotoPress(i)}
                      activeOpacity={0.8}
                    >
                      {photoUris[i] ? (
                        <>
                          <Image source={{ uri: photoUris[i]! }} style={s.slotImg} />
                          {photoUploading[i] && (
                            <View style={s.uploadOverlay}>
                              <ActivityIndicator size="small" color={colors.textPrimary} />
                            </View>
                          )}
                          {photoStorageUrls[i] && !photoUploading[i] && (
                            <View style={s.uploadedBadge}>
                              <CheckCircle size={10} color={colors.verified} />
                            </View>
                          )}
                        </>
                      ) : (
                        <Plus size={16} color={colors.textTertiary} />
                      )}
                    </TouchableOpacity>
                    {photoUris[i] && (
                      <TouchableOpacity style={s.removeBtn} onPress={() => removePhoto(i)} hitSlop={4}>
                        <X size={10} color={colors.textPrimary} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            </View>

            <Text style={s.photoHint}>Front · Back · Brand tag · Detail shots</Text>
          </ScrollView>

          <View style={s.bottomBar}>
            <TouchableOpacity
              style={[s.nextBtn, !hasPhotos && s.btnDisabled]}
              onPress={() => setStep(2)}
              disabled={!hasPhotos}
              activeOpacity={0.85}
            >
              <Text style={s.nextBtnText}>NEXT: ADD DETAILS →</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ── STEP 2: DETAILS ── */}
      {step === 2 && (
        <>
          <ScrollView
            style={s.scroll}
            contentContainerStyle={[s.scrollPad, { paddingBottom: 110 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Product Name */}
            <View style={s.field}>
              <Text style={s.label}>PRODUCT NAME *</Text>
              <View style={s.inputWrap}>
                <TextInput
                  style={s.input}
                  value={productName}
                  onChangeText={t => setProductName(t.slice(0, 60))}
                  placeholder="e.g. Vintage Levi's 501 Straight Cut Jeans"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
              <Text style={s.charCount}>{productName.length}/60</Text>
            </View>

            {/* Category */}
            <View style={s.field}>
              <Text style={s.label}>CATEGORY *</Text>
              <View style={s.chipWrap}>
                {CATEGORIES.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[s.chip, category === c && s.chipSel]}
                    onPress={() => { setCategory(c); setSize('') }}
                  >
                    <Text style={[s.chipTxt, category === c && s.chipTxtSel]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Size */}
            <View style={s.field}>
              <Text style={s.label}>SIZE *</Text>
              <View style={s.chipWrap}>
                {sizes.map(sz => (
                  <TouchableOpacity
                    key={sz}
                    style={[s.sizeChip, size === sz && s.chipSel]}
                    onPress={() => setSize(sz)}
                  >
                    <Text style={[s.chipTxt, size === sz && s.chipTxtSel]}>{sz}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Condition */}
            <View style={s.field}>
              <Text style={s.label}>CONDITION *</Text>
              <View style={s.conditionRow}>
                {CONDITIONS.map(c => (
                  <TouchableOpacity
                    key={c.val}
                    style={[s.conditionChip, condition === c.val && s.conditionChipSel]}
                    onPress={() => setCondition(c.val)}
                  >
                    <Text style={[s.conditionChipTxt, condition === c.val && s.conditionChipTxtSel]}>
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {condition && (
                <Text style={s.conditionDesc}>
                  {CONDITIONS.find(c => c.val === condition)?.desc}
                </Text>
              )}
            </View>

            {/* Brand */}
            <View style={s.field}>
              <Text style={s.label}>BRAND</Text>
              <View style={s.inputWrap}>
                <TextInput
                  style={s.input}
                  value={brand}
                  onChangeText={setBrand}
                  placeholder="e.g. Levi's, Nike, Zara"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
            </View>

            {/* Color */}
            <View style={s.field}>
              <Text style={s.label}>COLOR</Text>
              <View style={s.inputWrap}>
                <TextInput
                  style={s.input}
                  value={color}
                  onChangeText={setColor}
                  placeholder="e.g. Dark Blue / Indigo"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
            </View>

            {/* Description */}
            <View style={s.field}>
              <Text style={s.label}>DESCRIPTION</Text>
              <View style={[s.inputWrap, { alignItems: 'flex-start', paddingVertical: 12 }]}>
                <TextInput
                  style={[s.input, { height: 80, textAlignVertical: 'top' }]}
                  value={description}
                  onChangeText={t => setDescription(t.slice(0, 300))}
                  placeholder="Era, fit, quirks, unique details..."
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={3}
                />
              </View>
              <Text style={s.charCount}>{description.length}/300</Text>
            </View>

            {/* Price */}
            <View style={s.field}>
              <Text style={s.label}>PRICE (₹) *</Text>
              <View style={[s.inputWrap, !!priceError && s.inputWrapError]}>
                <Text style={s.rupeePrefix}>₹</Text>
                <TextInput
                  style={[s.input, s.priceInput]}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="0"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                />
              </View>
              {priceError && <Text style={s.priceError}>{priceError}</Text>}
              {price && priceValid && (
                <View style={s.payoutCard}>
                  <View style={s.payoutRow}>
                    <Text style={s.payoutKey}>You'll receive:</Text>
                    <Text style={[s.payoutVal, { color: colors.verified }]}>₹{payoutStr}</Text>
                  </View>
                  <View style={s.payoutRow}>
                    <Text style={s.payoutKey}>ROORQ fee (20%):</Text>
                    <Text style={s.payoutVal}>₹{feeStr}</Text>
                  </View>
                  <View style={[s.payoutRow, s.payoutDivider]}>
                    <Text style={s.payoutKey}>Buyer pays:</Text>
                    <Text style={[s.payoutVal, { color: colors.textPrimary }]}>₹{priceNum.toLocaleString('en-IN')}</Text>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          <View style={s.bottomBar}>
            <TouchableOpacity
              style={[s.nextBtn, !step2Valid && s.btnDisabled]}
              onPress={() => setStep(3)}
              disabled={!step2Valid}
              activeOpacity={0.85}
            >
              <Text style={s.nextBtnText}>NEXT: VERIFICATION →</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ── STEP 3: VERIFY ── */}
      {step === 3 && (
        <>
          <ScrollView
            style={s.scroll}
            contentContainerStyle={[s.scrollPad, { paddingBottom: 120 }]}
            showsVerticalScrollIndicator={false}
          >
            {/* Badge info card */}
            <View style={s.verifiedCard}>
              <View style={s.verifiedIcon}>
                <Shield size={30} color={colors.red} />
              </View>
              <Text style={s.verifiedCardTitle}>ROORQ Verified Badge</Text>
              <Text style={s.verifiedCardBody}>
                We generate a short verification clip from your photos. This proves authenticity and shows buyers exactly what they're getting.
              </Text>
            </View>

            {/* Generate button (initial state) */}
            {!generatingVideo && !videoUrl && !videoError && !manualVerification && (
              <TouchableOpacity style={s.generateBtn} onPress={handleGenerateVideo} activeOpacity={0.85}>
                <Play size={16} color={colors.textPrimary} fill={colors.textPrimary} />
                <Text style={s.generateBtnText}>Generate Verification Video</Text>
              </TouchableOpacity>
            )}

            {/* Loading */}
            {generatingVideo && (
              <View style={s.generatingCard}>
                <ActivityIndicator size="large" color={colors.red} />
                <Text style={s.generatingText}>Generating your verification clip...</Text>
                <Text style={s.generatingSubtext}>This takes ~30 seconds</Text>
              </View>
            )}

            {/* Error with retry */}
            {videoError && !generatingVideo && (
              <View style={s.errorCard}>
                <Text style={s.errorText}>{videoError}</Text>
                <TouchableOpacity style={s.retryBtn} onPress={handleGenerateVideo}>
                  <RefreshCw size={13} color={colors.textPrimary} />
                  <Text style={s.retryBtnText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Manual verification fallback */}
            {manualVerification && !generatingVideo && (
              <View style={s.manualCard}>
                <Text style={s.manualText}>
                  Video generation failed. Our team will manually verify within 24 hours. You can still submit.
                </Text>
              </View>
            )}

            {/* Video preview */}
            {videoUrl && !generatingVideo && (
              <View style={s.videoCard}>
                <TouchableOpacity
                  style={s.videoPreview}
                  onPress={() => Linking.openURL(videoUrl!)}
                  activeOpacity={0.9}
                >
                  {photoUris[0] && (
                    <Image source={{ uri: photoUris[0] }} style={s.videoThumb} />
                  )}
                  <View style={s.playOverlay}>
                    <View style={s.playCircle}>
                      <Play size={18} color={colors.textPrimary} fill={colors.textPrimary} />
                    </View>
                  </View>
                  <View style={s.verifiedPill}>
                    <CheckCircle size={11} color={colors.red} />
                    <Text style={s.verifiedPillText}>ROORQ Verified</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={s.regenerateRow} onPress={handleGenerateVideo}>
                  <RefreshCw size={11} color={colors.textTertiary} />
                  <Text style={s.regenerateText}>Regenerate</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Terms checkbox */}
            {(videoUrl || manualVerification) && (
              <TouchableOpacity style={s.termsRow} onPress={() => setTermsAccepted(v => !v)} activeOpacity={0.8}>
                <View style={[s.checkbox, termsAccepted && s.checkboxChecked]}>
                  {termsAccepted && <CheckCircle size={13} color={colors.bg} />}
                </View>
                <Text style={s.termsText}>
                  By submitting, you confirm this item is accurately described.
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          <View style={s.bottomBar}>
            <TouchableOpacity
              style={[s.nextBtn, (!termsAccepted || submitting) && s.btnDisabled]}
              onPress={handleSubmit}
              disabled={!termsAccepted || submitting}
              activeOpacity={0.85}
            >
              {submitting
                ? <ActivityIndicator size="small" color={colors.textPrimary} />
                : <Text style={s.nextBtnText}>SUBMIT LISTING</Text>}
            </TouchableOpacity>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container:        { flex: 1, backgroundColor: colors.bg },
  header:           {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: colors.divider,
  },
  backBtn:          {
    width: 36, height: 36, backgroundColor: colors.bgElevated,
    borderRadius: radius.subtle, alignItems: 'center', justifyContent: 'center',
  },
  stepDots:         { flexDirection: 'row', gap: 5 },
  dot:              { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  dotActive:        { backgroundColor: colors.red, width: 18 },
  stepLabelRow:     { paddingHorizontal: spacing.xl, paddingVertical: 10 },
  stepLabel:        { fontSize: 10, letterSpacing: 1.5, color: colors.textTertiary, fontWeight: '700' },
  scroll:           { flex: 1 },
  scrollPad:        { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  stepTitle:        { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  stepSubtitle:     { fontSize: 13, color: colors.textTertiary, marginBottom: spacing.xl },

  // Photos
  photoGrid:        { flexDirection: 'row', gap: 10, marginBottom: 12 },
  primaryWrap:      { position: 'relative' },
  primarySlot:      {
    width: 160, height: 200, backgroundColor: colors.bgElevated,
    borderWidth: 2, borderStyle: 'dashed', borderColor: colors.border,
    borderRadius: radius.subtle, alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  primarySlotLabel: { fontSize: 10, letterSpacing: 1, color: colors.textTertiary, fontWeight: '700' },
  primarySlotSub:   { fontSize: 10, color: colors.textTertiary },
  secondaryGrid:    { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  secondaryWrap:    { position: 'relative' },
  secondarySlot:    {
    width: 72, height: 92, backgroundColor: colors.bgElevated,
    borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border,
    borderRadius: radius.subtle, alignItems: 'center', justifyContent: 'center',
  },
  slotImg:          { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: radius.subtle - 1 },
  uploadOverlay:    {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: radius.subtle - 1,
    alignItems: 'center', justifyContent: 'center',
  },
  uploadedBadge:    {
    position: 'absolute', top: 4, left: 4,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10, padding: 2,
  },
  removeBtn:        {
    position: 'absolute', top: -6, right: -6, zIndex: 10,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center',
  },
  photoHint:        { fontSize: 11, color: colors.textTertiary, marginBottom: spacing.xl },

  // Form
  field:            { marginBottom: spacing.xl },
  label:            { fontSize: 10, letterSpacing: 1, color: colors.textTertiary, fontWeight: '700', marginBottom: spacing.sm },
  inputWrap:        {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgElevated, borderWidth: 1,
    borderColor: colors.border, borderRadius: radius.subtle, paddingHorizontal: 14,
  },
  inputWrapError:   { borderColor: colors.red },
  input:            { flex: 1, height: 48, fontSize: 15, color: colors.textPrimary },
  charCount:        { fontSize: 11, color: colors.textTertiary, textAlign: 'right', marginTop: 4 },
  rupeePrefix:      { fontSize: 22, color: colors.textSecondary, marginRight: 4 },
  priceInput:       { fontSize: 28, height: 56 },
  priceError:       { fontSize: 12, color: colors.red, marginTop: 4 },
  payoutCard:       {
    backgroundColor: colors.bgElevated, borderWidth: 1,
    borderColor: colors.border, borderRadius: radius.subtle, padding: 12, marginTop: 10,
  },
  payoutRow:        { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  payoutDivider:    { borderTopWidth: 1, borderTopColor: colors.divider, paddingTop: 6, marginTop: 2 },
  payoutKey:        { fontSize: 13, color: colors.textTertiary },
  payoutVal:        { fontSize: 13, color: colors.textSecondary },

  chipWrap:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:             {
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: radius.subtle, borderWidth: 1, borderColor: colors.border,
  },
  chipSel:          { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
  chipTxt:          { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  chipTxtSel:       { color: colors.bg },
  sizeChip:         {
    width: 52, height: 42, borderRadius: radius.subtle,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  conditionRow:     { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  conditionChip:    {
    flex: 1, minWidth: 70, paddingVertical: 10, alignItems: 'center',
    borderRadius: radius.subtle, borderWidth: 1, borderColor: colors.border,
  },
  conditionChipSel: { backgroundColor: colors.red, borderColor: colors.red },
  conditionChipTxt: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  conditionChipTxtSel: { color: colors.textPrimary },
  conditionDesc:    { fontSize: 11, color: colors.textTertiary, marginTop: 6 },

  // Step 3
  verifiedCard:     {
    backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.subtle, padding: spacing.xl, alignItems: 'center',
    marginBottom: spacing.xl,
  },
  verifiedIcon:     {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: `${colors.red}15`, alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  verifiedCardTitle:{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  verifiedCardBody: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },

  generateBtn:      {
    height: 52, backgroundColor: colors.red, borderRadius: radius.subtle,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    marginBottom: spacing.xl,
  },
  generateBtnText:  { fontSize: 14, fontWeight: '700', color: colors.textPrimary },

  generatingCard:   {
    backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.subtle, padding: spacing.xxl, alignItems: 'center', gap: 12,
    marginBottom: spacing.xl,
  },
  generatingText:   { fontSize: 14, color: colors.textPrimary, fontWeight: '600' },
  generatingSubtext:{ fontSize: 12, color: colors.textTertiary },

  errorCard:        {
    backgroundColor: `${colors.red}10`, borderWidth: 1, borderColor: `${colors.red}40`,
    borderRadius: radius.subtle, padding: spacing.xl, marginBottom: spacing.xl, gap: 12,
  },
  errorText:        { fontSize: 13, color: colors.textSecondary },
  retryBtn:         {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start', backgroundColor: colors.red,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.subtle,
  },
  retryBtnText:     { fontSize: 13, color: colors.textPrimary, fontWeight: '600' },

  manualCard:       {
    backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.subtle, padding: spacing.xl, marginBottom: spacing.xl,
  },
  manualText:       { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },

  videoCard:        { marginBottom: spacing.xl },
  videoPreview:     {
    height: 200, borderRadius: radius.subtle, overflow: 'hidden',
    backgroundColor: colors.bgElevated, alignItems: 'center', justifyContent: 'center',
  },
  videoThumb:       { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  playOverlay:      {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center',
  },
  playCircle:       {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center',
  },
  verifiedPill:     {
    position: 'absolute', top: 10, right: 10,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  verifiedPillText: { fontSize: 11, color: colors.textPrimary, fontWeight: '600' },
  regenerateRow:    { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8, alignSelf: 'center' },
  regenerateText:   { fontSize: 12, color: colors.textTertiary },

  termsRow:         {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.subtle, padding: 14, marginBottom: spacing.xl,
  },
  checkbox:         {
    width: 22, height: 22, borderRadius: 4, borderWidth: 2,
    borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  checkboxChecked:  { backgroundColor: colors.red, borderColor: colors.red },
  termsText:        { flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 20 },

  // Bottom bar
  bottomBar:        {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: spacing.xl, paddingBottom: 32,
    backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.divider,
  },
  nextBtn:          {
    height: 52, backgroundColor: colors.red, borderRadius: radius.subtle,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  nextBtnText:      { fontSize: 13, fontWeight: '700', letterSpacing: 1.5, color: colors.textPrimary },
  btnDisabled:      { opacity: 0.4 },
})
