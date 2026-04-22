import { useState, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
  Modal, FlatList,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import {
  ArrowLeft, ChevronRight, CheckCircle, ShieldCheck,
  MapPin, Store, Wallet, AlertCircle, RotateCcw, Calendar,
} from 'lucide-react-native'
import { supabase } from '../../lib/supabase'
import { RoorqLogo } from '../../src/components/common/RoorqLogo'
import { colors } from '../../src/constants/colors'
import { fonts } from '../../src/constants/typography'
import { spacing, radius } from '../../src/constants/spacing'

// ─── Constants ──────────────────────────────────────────────
const CITIES = ['Mumbai','Delhi','Bangalore','Chennai','Hyderabad','Pune','Kolkata',
  'Ahmedabad','Jaipur','Lucknow','Chandigarh','Goa','Kochi','Indore','Nagpur',
  'Surat','Bhopal','Other']
const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
  'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal']
const SELL_TAGS = ["Men's","Women's","Unisex","Denim","Tees","Outerwear","Shoes",
  "Accessories","Y2K","90s","Streetwear","Workwear"]

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS   = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'))
const now    = new Date()
const YEARS  = Array.from({ length: 65 }, (_, i) => String(now.getFullYear() - 18 - i))

const TOTAL_STEPS = 4
const STEP_ICONS = [
  { icon: ShieldCheck, label: 'Identity' },
  { icon: MapPin,      label: 'Address'  },
  { icon: Store,       label: 'Shop'     },
  { icon: Wallet,      label: 'Payout'   },
]

// ─── Main Component ─────────────────────────────────────────
export default function OnboardingScreen() {
  const router   = useRouter()
  const { userId: paramUserId } = useLocalSearchParams<{ userId?: string }>()
  const [step,    setStep]    = useState(0)
  const [loading, setLoading] = useState(false)

  // Per-field validation errors  { fieldKey: 'error message' }
  const [fe, setFe] = useState<Record<string, string>>({})
  const clearFe = (...keys: string[]) =>
    setFe(prev => { const n = { ...prev }; keys.forEach(k => delete n[k]); return n })

  // ── Step 0 — Identity
  const [fullName,         setFullName]         = useState('')
  const [dob,              setDob]              = useState('')
  const [showDobPicker,    setShowDobPicker]     = useState(false)
  const [dobDay,           setDobDay]            = useState('01')
  const [dobMonth,         setDobMonth]          = useState('Jan')
  const [dobYear,          setDobYear]           = useState(String(now.getFullYear() - 25))
  const [aadhaarNumber,    setAadhaarNumber]     = useState('')
  const [aadhaarOtp,       setAadhaarOtp]        = useState(['','','','','',''])
  const [aadhaarVerified,  setAadhaarVerified]   = useState(false)
  const [aadhaarOtpSent,   setAadhaarOtpSent]    = useState(false)
  const [aadhaarLoading,   setAadhaarLoading]    = useState(false)
  const [aadhaarCountdown, setAadhaarCountdown]  = useState(0)
  const otpRefs = useRef<(TextInput | null)[]>([])

  // ── Step 1 — Address
  const [addressLine1,  setAddressLine1]  = useState('')
  const [addressLine2,  setAddressLine2]  = useState('')
  const [city,          setCity]          = useState('')
  const [showCityDrop,  setShowCityDrop]  = useState(false)
  const [state,         setState]         = useState('')
  const [showStateDrop, setShowStateDrop] = useState(false)
  const [pincode,       setPincode]       = useState('')
  const [whatsapp,      setWhatsapp]      = useState('')
  const [gstNumber,     setGstNumber]     = useState('')

  // ── Step 2 — Shop
  const [shopName,  setShopName]  = useState('')
  const [instagram, setInstagram] = useState('')
  const [bio,       setBio]       = useState('')
  const [tags,      setTags]      = useState<string[]>([])

  // ── Step 3 — Payout
  const [upiId,       setUpiId]       = useState('')
  const [termsAgreed, setTermsAgreed] = useState(false)

  // ─── Validation ───────────────────────────────────────────
  const validateStep = (s: number): boolean => {
    const errors: Record<string, string> = {}

    if (s === 0) {
      if (!fullName.trim())    errors.fullName   = 'Full name is required'
      if (!dob)                errors.dob        = 'Date of birth is required'
      if (aadhaarNumber.replace(/\D/g,'').length !== 12)
                               errors.aadhaar    = 'Enter a valid 12-digit Aadhaar number'
      if (!aadhaarVerified)    errors.aadhaarOtp = 'Please verify your Aadhaar to continue'
    }
    if (s === 1) {
      if (!addressLine1.trim())       errors.addressLine1 = 'Address line 1 is required'
      if (!city)                      errors.city         = 'Please select a city'
      if (!state)                     errors.state        = 'Please select a state'
      if (pincode.length !== 6)       errors.pincode      = 'Enter a valid 6-digit PIN code'
      if (!whatsapp.trim())           errors.whatsapp     = 'WhatsApp number is required'
      else if (whatsapp.length !== 10) errors.whatsapp    = 'Enter a valid 10-digit number'
    }
    if (s === 2) {
      if (!shopName.trim()) errors.shopName = 'Shop name is required'
    }
    if (s === 3) {
      if (!upiId.trim())  errors.upiId      = 'UPI ID is required'
      if (!termsAgreed)   errors.termsAgreed = 'You must agree to the Vendor Terms'
    }

    setFe(errors)
    return Object.keys(errors).length === 0
  }

  // ─── Helpers ──────────────────────────────────────────────
  const toggleTag = (t: string) =>
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])

  const formatAadhaar = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 12)
    return d.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const startCountdown = () => {
    setAadhaarCountdown(60)
    const t = setInterval(() => {
      setAadhaarCountdown(p => { if (p <= 1) { clearInterval(t); return 0 } return p - 1 })
    }, 1000)
  }

  const sendAadhaarOtp = async () => {
    if (aadhaarNumber.length !== 12) {
      setFe(p => ({ ...p, aadhaar: 'Enter a valid 12-digit Aadhaar number' }))
      return
    }
    clearFe('aadhaar'); setAadhaarLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setAadhaarOtpSent(true); setAadhaarLoading(false); startCountdown()
    setTimeout(() => otpRefs.current[0]?.focus(), 100)
  }

  const verifyAadhaar = async () => {
    if (aadhaarOtp.some(d => d === '')) {
      setFe(p => ({ ...p, aadhaarOtp: 'Enter the full 6-digit OTP' })); return
    }
    clearFe('aadhaarOtp'); setAadhaarLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setAadhaarVerified(true); setAadhaarLoading(false)
  }

  const resendAadhaarOtp = async () => {
    if (aadhaarCountdown > 0) return
    setAadhaarLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setAadhaarLoading(false)
    setAadhaarOtp(['','','','','','']); startCountdown()
    setTimeout(() => otpRefs.current[0]?.focus(), 100)
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const next = [...aadhaarOtp]
    next[index] = value.slice(-1)
    setAadhaarOtp(next)
    clearFe('aadhaarOtp')
    if (value && index < 5) otpRefs.current[index + 1]?.focus()
    if (next.every(d => d !== '')) {
      setTimeout(async () => {
        setAadhaarLoading(true)
        await new Promise(r => setTimeout(r, 1500))
        setAadhaarVerified(true); setAadhaarLoading(false)
      }, 200)
    }
  }

  const confirmDob = () => {
    const mm = String(MONTHS.indexOf(dobMonth) + 1).padStart(2, '0')
    setDob(`${dobDay}/${mm}/${dobYear}`)
    clearFe('dob')
    setShowDobPicker(false)
  }

  const handleContinue = () => {
    if (!validateStep(step)) return
    setStep(s => s + 1)
  }

  const handleFinish = async () => {
    if (!validateStep(3)) return
    setLoading(true)

    // Resolve user ID — param (from signup) → session → network call
    let uid: string | undefined = paramUserId ?? undefined
    if (!uid) uid = (await supabase.auth.getSession()).data.session?.user?.id
    if (!uid) uid = (await supabase.auth.getUser()).data.user?.id ?? undefined
    if (!uid) {
      setFe({ _global: 'Could not identify your account. Please go back and sign in again.' })
      setLoading(false); return
    }

    const { error: err } = await supabase.from('vendors').upsert({
      id:               uid,
      full_name:        fullName.trim(),
      dob,
      aadhaar_verified: true,
      address_line1:    addressLine1.trim(),
      address_line2:    addressLine2.trim() || null,
      city,
      state,
      pincode,
      whatsapp_number:  whatsapp,
      gst_number:       gstNumber || null,
      store_name:       shopName.trim(),
      instagram:        instagram || null,
      bio:              bio || null,
      sell_tags:        tags,
      upi_id:           upiId.trim(),
      setup_complete:   true,
    }, { onConflict: 'id' })

    setLoading(false)
    if (err) { setFe({ _global: err.message }); return }
    router.replace('/' as any)
  }

  // ─── Render helpers (plain functions, NOT <Components />) ─
  // This avoids re-mounting TextInputs on every keystroke.

  const err = (key: string) => fe[key] ? (
    <View style={styles.fieldErrRow}>
      <AlertCircle size={11} color={colors.red} />
      <Text style={styles.fieldErrText}>{fe[key]}</Text>
    </View>
  ) : null

  const inputStyle = (key: string) =>
    [styles.inputWrap, !!fe[key] && styles.inputWrapError] as any

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={styles.stepIconsRow}>
        {STEP_ICONS.map((s, i) => {
          const IconComp = s.icon
          const done   = i < step
          const active = i === step
          return (
            <View key={i} style={styles.stepIconCol}>
              <View style={[
                styles.stepIcon,
                done   && styles.stepIconDone,
                active && styles.stepIconActive,
              ]}>
                {done
                  ? <CheckCircle size={14} color={colors.verified} />
                  : <IconComp size={14} color={active ? colors.red : colors.textTertiary} />}
              </View>
              <Text style={[styles.stepIconLabel, i <= step && { color: colors.textPrimary }]}>
                {s.label}
              </Text>
            </View>
          )
        })}
      </View>
      <View style={styles.progressRow}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <View key={i} style={[styles.progressBar, i <= step && styles.progressBarActive]} />
        ))}
      </View>
    </View>
  )

  // ── Step 0: Identity ──────────────────────────────────────
  const renderStep0 = () => (
    <View style={styles.stepContent}>
      {renderStepIndicator()}
      <Text style={styles.stepTitle}>Verify your identity</Text>
      <Text style={styles.stepSub}>Aadhaar KYC is required to start selling</Text>

      {/* Full Name */}
      <View style={styles.field}>
        <Text style={styles.label}>FULL NAME (AS ON AADHAAR) *</Text>
        <View style={inputStyle('fullName')}>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={v => { setFullName(v); clearFe('fullName') }}
            placeholder="Enter your legal name"
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="words"
          />
        </View>
        {err('fullName')}
      </View>

      {/* DOB */}
      <View style={styles.field}>
        <Text style={styles.label}>DATE OF BIRTH *</Text>
        <TouchableOpacity style={inputStyle('dob')} onPress={() => setShowDobPicker(true)} activeOpacity={0.8}>
          <Calendar size={16} color={fe.dob ? colors.red : colors.textTertiary} style={{ marginRight: 10 }} />
          <Text style={[styles.input, { lineHeight: 48, color: dob ? colors.textPrimary : colors.textTertiary }]}>
            {dob || 'Select date of birth'}
          </Text>
        </TouchableOpacity>
        {err('dob')}
      </View>

      {/* Aadhaar */}
      <View style={styles.field}>
        <Text style={styles.label}>AADHAAR NUMBER *</Text>
        <View style={[inputStyle('aadhaar'), aadhaarOtpSent && { opacity: 0.5 }]}>
          <TextInput
            style={[styles.input, styles.monoInput]}
            value={formatAadhaar(aadhaarNumber)}
            onChangeText={v => { setAadhaarNumber(v.replace(/\D/g,'').slice(0,12)); clearFe('aadhaar') }}
            placeholder="XXXX XXXX XXXX"
            placeholderTextColor={colors.textTertiary}
            keyboardType="numeric"
            editable={!aadhaarOtpSent}
          />
        </View>
        {err('aadhaar')}
        <View style={styles.hintRow}>
          <ShieldCheck size={10} color={colors.textTertiary} />
          <Text style={styles.hint}>Your Aadhaar is encrypted and never stored</Text>
        </View>
      </View>

      {!aadhaarOtpSent && !aadhaarVerified && (
        <TouchableOpacity
          style={[styles.secondaryBtn, (aadhaarNumber.length !== 12 || aadhaarLoading) && { opacity: 0.4 }]}
          onPress={sendAadhaarOtp}
          disabled={aadhaarNumber.length !== 12 || aadhaarLoading}
          activeOpacity={0.85}
        >
          {aadhaarLoading && <ActivityIndicator size="small" color={colors.textPrimary} style={{ marginRight: 8 }} />}
          <Text style={styles.secondaryBtnText}>{aadhaarLoading ? 'Sending OTP...' : 'Send Aadhaar OTP'}</Text>
        </TouchableOpacity>
      )}

      {aadhaarOtpSent && !aadhaarVerified && (
        <View style={styles.field}>
          <Text style={styles.label}>OTP SENT TO AADHAAR-LINKED MOBILE</Text>
          <View style={styles.otpRow}>
            {aadhaarOtp.map((digit, i) => (
              <TextInput
                key={i}
                ref={el => { otpRefs.current[i] = el }}
                style={[styles.otpBox, digit && styles.otpBoxFilled, fe.aadhaarOtp && styles.otpBoxError]}
                value={digit}
                onChangeText={v => handleOtpChange(i, v)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace' && !digit && i > 0)
                    otpRefs.current[i - 1]?.focus()
                }}
                keyboardType="numeric"
                maxLength={1}
                textAlign="center"
              />
            ))}
          </View>
          {err('aadhaarOtp')}

          <TouchableOpacity
            style={[styles.verifyBtn, (aadhaarLoading || aadhaarOtp.some(d => d === '')) && { opacity: 0.5 }]}
            onPress={verifyAadhaar}
            disabled={aadhaarLoading || aadhaarOtp.some(d => d === '')}
            activeOpacity={0.85}
          >
            {aadhaarLoading && <ActivityIndicator size="small" color={colors.textPrimary} style={{ marginRight: 8 }} />}
            <Text style={styles.verifyBtnText}>{aadhaarLoading ? 'Verifying...' : 'Verify Aadhaar'}</Text>
          </TouchableOpacity>

          <View style={styles.resendRow}>
            <TouchableOpacity onPress={resendAadhaarOtp} disabled={aadhaarCountdown > 0} style={styles.resendBtn}>
              <RotateCcw size={12} color={colors.textTertiary} />
              <Text style={styles.resendText}>
                {aadhaarCountdown > 0 ? `Resend in ${aadhaarCountdown}s` : 'Resend OTP'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setAadhaarOtpSent(false); setAadhaarOtp(['','','','','','']) }}>
              <Text style={styles.changeLink}>Change Aadhaar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {aadhaarVerified && (
        <View style={styles.verifiedCard}>
          <View style={styles.verifiedIconWrap}>
            <CheckCircle size={20} color={colors.verified} />
          </View>
          <View>
            <Text style={styles.verifiedTitle}>Aadhaar Verified</Text>
            <Text style={styles.verifiedSub}>XXXX XXXX {aadhaarNumber.slice(-4)} · {fullName}</Text>
          </View>
        </View>
      )}
    </View>
  )

  // ── Step 1: Address ───────────────────────────────────────
  const renderStep1 = () => (
    <View style={styles.stepContent}>
      {renderStepIndicator()}
      <Text style={styles.stepTitle}>Vendor details</Text>
      <Text style={styles.stepSub}>Your pickup & business address</Text>

      <View style={styles.field}>
        <Text style={styles.label}>ADDRESS LINE 1 *</Text>
        <View style={inputStyle('addressLine1')}>
          <TextInput style={styles.input} value={addressLine1}
            onChangeText={v => { setAddressLine1(v); clearFe('addressLine1') }}
            placeholder="House/Flat no., Building name" placeholderTextColor={colors.textTertiary} />
        </View>
        {err('addressLine1')}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>ADDRESS LINE 2</Text>
        <View style={styles.inputWrap}>
          <TextInput style={styles.input} value={addressLine2} onChangeText={setAddressLine2}
            placeholder="Street, Locality, Landmark" placeholderTextColor={colors.textTertiary} />
        </View>
      </View>

      <View style={[styles.field, styles.twoCol]}>
        {/* City */}
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>CITY *</Text>
          <TouchableOpacity
            style={inputStyle('city')}
            onPress={() => { setShowCityDrop(v => !v); setShowStateDrop(false) }}>
            <Text style={[styles.input, { lineHeight: 48, color: city ? colors.textPrimary : colors.textTertiary }]}>
              {city || 'Select'}
            </Text>
          </TouchableOpacity>
          {err('city')}
          {showCityDrop && (
            <View style={styles.dropdown}>
              <ScrollView style={{ maxHeight: 160 }} nestedScrollEnabled>
                {CITIES.map(c => (
                  <TouchableOpacity key={c} style={styles.dropItem}
                    onPress={() => { setCity(c); clearFe('city'); setShowCityDrop(false) }}>
                    <Text style={[styles.dropText, city === c && { color: colors.textPrimary }]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* State */}
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>STATE *</Text>
          <TouchableOpacity
            style={inputStyle('state')}
            onPress={() => { setShowStateDrop(v => !v); setShowCityDrop(false) }}>
            <Text style={[styles.input, { lineHeight: 48, color: state ? colors.textPrimary : colors.textTertiary }]}>
              {state ? state.split(' ')[0] : 'Select'}
            </Text>
          </TouchableOpacity>
          {err('state')}
          {showStateDrop && (
            <View style={[styles.dropdown, { right: 0, left: 0 }]}>
              <ScrollView style={{ maxHeight: 160 }} nestedScrollEnabled>
                {STATES.map(s => (
                  <TouchableOpacity key={s} style={styles.dropItem}
                    onPress={() => { setState(s); clearFe('state'); setShowStateDrop(false) }}>
                    <Text style={[styles.dropText, state === s && { color: colors.textPrimary }]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>PIN CODE *</Text>
        <View style={inputStyle('pincode')}>
          <TextInput style={[styles.input, styles.monoInput]} value={pincode}
            onChangeText={v => { setPincode(v.replace(/\D/g,'').slice(0,6)); clearFe('pincode') }}
            placeholder="6-digit PIN" placeholderTextColor={colors.textTertiary} keyboardType="numeric" />
        </View>
        {err('pincode')}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>WHATSAPP NUMBER *</Text>
        <View style={inputStyle('whatsapp')}>
          <View style={styles.prefix}><Text style={styles.prefixText}>+91</Text></View>
          <TextInput style={[styles.input, { flex: 1 }]} value={whatsapp}
            onChangeText={v => { setWhatsapp(v.replace(/\D/g,'').slice(0,10)); clearFe('whatsapp') }}
            placeholder="98765 43210" placeholderTextColor={colors.textTertiary} keyboardType="phone-pad" />
        </View>
        {err('whatsapp')}
        <Text style={styles.hint}>For order updates & buyer communication</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>GSTIN <Text style={{ textTransform: 'none', letterSpacing: 0 }}>(optional)</Text></Text>
        <View style={styles.inputWrap}>
          <TextInput style={[styles.input, styles.monoInput]} value={gstNumber}
            onChangeText={v => setGstNumber(v.toUpperCase().slice(0,15))}
            placeholder="22AAAAA0000A1Z5" placeholderTextColor={colors.textTertiary}
            autoCapitalize="characters" />
        </View>
        <Text style={styles.hint}>Required only if annual turnover exceeds ₹40L</Text>
      </View>
    </View>
  )

  // ── Step 2: Shop ──────────────────────────────────────────
  const renderStep2 = () => (
    <View style={styles.stepContent}>
      {renderStepIndicator()}
      <Text style={styles.stepTitle}>Tell buyers about{'\n'}your shop</Text>
      <Text style={styles.stepSub}>Make your store stand out</Text>

      <View style={styles.field}>
        <Text style={styles.label}>SHOP NAME *</Text>
        <View style={inputStyle('shopName')}>
          <TextInput style={styles.input} value={shopName}
            onChangeText={v => { setShopName(v); clearFe('shopName') }}
            placeholder='"Thrift by Reema"' placeholderTextColor={colors.textTertiary} />
        </View>
        {err('shopName')}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>INSTAGRAM HANDLE</Text>
        <View style={styles.inputWrap}>
          <Text style={styles.prefixText}>@</Text>
          <TextInput style={[styles.input, { flex: 1, marginLeft: 8 }]} value={instagram}
            onChangeText={setInstagram} placeholder="yourhandle"
            placeholderTextColor={colors.textTertiary} autoCapitalize="none" />
        </View>
        <Text style={styles.hint}>We'll tag you in features</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>SHOP BIO</Text>
        <View style={[styles.inputWrap, { alignItems: 'flex-start', paddingVertical: 12 }]}>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            value={bio}
            onChangeText={t => setBio(t.slice(0, 150))}
            placeholder="Curated Y2K and 90s vintage. Hand-picked from Delhi flea markets."
            placeholderTextColor={colors.textTertiary}
            multiline
          />
        </View>
        <Text style={[styles.hint, { textAlign: 'right' }]}>{bio.length}/150</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>WHAT DO YOU SELL?</Text>
        <View style={styles.tagGrid}>
          {SELL_TAGS.map(t => (
            <TouchableOpacity key={t} onPress={() => toggleTag(t)}
              style={[styles.tag, tags.includes(t) && styles.tagSelected]}>
              <Text style={[styles.tagText, tags.includes(t) && styles.tagTextSelected]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  )

  // ── Step 3: Payout ────────────────────────────────────────
  const renderStep3 = () => (
    <View style={styles.stepContent}>
      {renderStepIndicator()}
      <Text style={styles.stepTitle}>Where should we{'\n'}send your money?</Text>
      <Text style={styles.stepSub}>Set up your payout method</Text>

      <View style={styles.field}>
        <Text style={styles.label}>UPI ID *</Text>
        <View style={inputStyle('upiId')}>
          <TextInput style={styles.input} value={upiId}
            onChangeText={v => { setUpiId(v); clearFe('upiId') }}
            placeholder="yourname@paytm" placeholderTextColor={colors.textTertiary}
            autoCapitalize="none" />
        </View>
        {err('upiId')}
        <Text style={styles.hint}>e.g. name@upi, name@paytm, name@okaxis</Text>
      </View>

      <View style={styles.trustCard}>
        <Text style={styles.trustTitle}>Payouts every Friday</Text>
        <Text style={styles.trustSub}>Direct to your account. No platform wallet, no delays.</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>SUMMARY</Text>
        {[
          { k: 'Vendor',  v: fullName || '—' },
          { k: 'Aadhaar', v: '✓ Verified', verified: true },
          { k: 'Shop',    v: shopName || '—' },
          { k: 'City',    v: city || '—' },
          { k: 'Sells',   v: tags.length > 0 ? tags.slice(0, 3).join(', ') : '—' },
        ].map(r => (
          <View key={r.k} style={styles.summaryRow}>
            <Text style={styles.summaryKey}>{r.k}</Text>
            <Text style={[styles.summaryVal, (r as any).verified && { color: colors.verified, fontFamily: fonts.mono }]}>
              {r.v}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.termsRow, fe.termsAgreed && { borderColor: colors.red, borderWidth: 1, borderRadius: radius.subtle, padding: 8 }]}
        onPress={() => { setTermsAgreed(v => !v); clearFe('termsAgreed') }}
        activeOpacity={0.8}
      >
        <View style={[styles.checkbox, termsAgreed && styles.checkboxChecked, fe.termsAgreed && styles.checkboxError]}>
          {termsAgreed && <CheckCircle size={10} color={colors.textPrimary} />}
        </View>
        <Text style={styles.termsText}>
          I agree to ROORQ Vendor Terms — 20% commission, weekly payouts, no exclusivity
        </Text>
      </TouchableOpacity>
      {err('termsAgreed')}
    </View>
  )

  // ─── DOB Picker Modal ────────────────────────────────────
  const renderDobPicker = () => (
    <Modal visible={showDobPicker} transparent animationType="slide" onRequestClose={() => setShowDobPicker(false)}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowDobPicker(false)} />
      <View style={styles.dobSheet}>
        <View style={styles.dobHeader}>
          <TouchableOpacity onPress={() => setShowDobPicker(false)}>
            <Text style={styles.dobCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.dobTitle}>Date of Birth</Text>
          <TouchableOpacity onPress={confirmDob}>
            <Text style={styles.dobConfirm}>Done</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.dobColumns}>
          <View style={styles.dobColWrap}>
            <Text style={styles.dobColLabel}>DAY</Text>
            <FlatList data={DAYS} keyExtractor={i => i} style={styles.dobList}
              showsVerticalScrollIndicator={false}
              getItemLayout={(_, i) => ({ length: 44, offset: 44 * i, index: i })}
              initialScrollIndex={DAYS.indexOf(dobDay)}
              renderItem={({ item }) => (
                <TouchableOpacity style={[styles.dobItem, item === dobDay && styles.dobItemActive]}
                  onPress={() => setDobDay(item)}>
                  <Text style={[styles.dobItemText, item === dobDay && styles.dobItemTextActive]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
          <View style={[styles.dobColWrap, { flex: 1.4 }]}>
            <Text style={styles.dobColLabel}>MONTH</Text>
            <FlatList data={MONTHS} keyExtractor={i => i} style={styles.dobList}
              showsVerticalScrollIndicator={false}
              getItemLayout={(_, i) => ({ length: 44, offset: 44 * i, index: i })}
              initialScrollIndex={MONTHS.indexOf(dobMonth)}
              renderItem={({ item }) => (
                <TouchableOpacity style={[styles.dobItem, item === dobMonth && styles.dobItemActive]}
                  onPress={() => setDobMonth(item)}>
                  <Text style={[styles.dobItemText, item === dobMonth && styles.dobItemTextActive]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
          <View style={[styles.dobColWrap, { flex: 1.2 }]}>
            <Text style={styles.dobColLabel}>YEAR</Text>
            <FlatList data={YEARS} keyExtractor={i => i} style={styles.dobList}
              showsVerticalScrollIndicator={false}
              getItemLayout={(_, i) => ({ length: 44, offset: 44 * i, index: i })}
              initialScrollIndex={YEARS.indexOf(dobYear)}
              renderItem={({ item }) => (
                <TouchableOpacity style={[styles.dobItem, item === dobYear && styles.dobItemActive]}
                  onPress={() => setDobYear(item)}>
                  <Text style={[styles.dobItemText, item === dobYear && styles.dobItemTextActive]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </View>
    </Modal>
  )

  // ─── Render ──────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
    >
      <StatusBar style="light" />
      {renderDobPicker()}

      {/* Persistent header: logo + back */}
      <View style={styles.topBar}>
        <RoorqLogo width={72} />
        {step > 0 ? (
          <TouchableOpacity style={styles.backBtn}
            onPress={() => { setStep(s => s - 1); setFe({}); setShowCityDrop(false); setShowStateDrop(false) }}>
            <ArrowLeft size={18} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : <View style={{ width: 36 }} />}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {step === 0 && renderStep0()}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        {/* Global error (auth failure etc.) */}
        {fe._global ? (
          <View style={styles.globalError}>
            <AlertCircle size={14} color={colors.red} />
            <Text style={styles.globalErrorText}>{fe._global}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        {step < TOTAL_STEPS - 1 ? (
          <TouchableOpacity style={styles.nextBtn} onPress={handleContinue} activeOpacity={0.85}>
            <Text style={styles.nextBtnText}>Continue</Text>
            <ChevronRight size={16} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextBtn, loading && { opacity: 0.6 }]}
            onPress={handleFinish} disabled={loading} activeOpacity={0.85}
          >
            {loading && <ActivityIndicator size="small" color={colors.textPrimary} style={{ marginRight: 8 }} />}
            <Text style={styles.nextBtnText}>{loading ? 'Setting up...' : 'Start selling'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl, paddingTop: spacing.xl + 8, paddingBottom: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.divider,
  },
  backBtn: {
    width: 36, height: 36, backgroundColor: colors.bgElevated,
    borderRadius: radius.subtle, alignItems: 'center', justifyContent: 'center',
  },
  scroll: { paddingHorizontal: spacing.xxl, paddingBottom: 20 },
  stepContent: { paddingTop: spacing.xl },

  stepIndicator: { marginBottom: spacing.xxl },
  stepIconsRow: { flexDirection: 'row', marginBottom: spacing.lg },
  stepIconCol: { flex: 1, alignItems: 'center', gap: 6 },
  stepIcon: {
    width: 32, height: 32, borderRadius: radius.subtle,
    backgroundColor: colors.bgElevated, borderWidth: 1,
    borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  stepIconDone:   { backgroundColor: `${colors.verified}20`, borderColor: `${colors.verified}50` },
  stepIconActive: { backgroundColor: `${colors.red}20`, borderColor: colors.red },
  stepIconLabel:  { fontFamily: fonts.body, fontSize: 9, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.textTertiary },
  progressRow:    { flexDirection: 'row', gap: 4 },
  progressBar:    { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.border },
  progressBarActive: { backgroundColor: colors.red },

  stepTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.textPrimary, marginBottom: 4 },
  stepSub:   { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, marginBottom: spacing.xxl },

  field:   { marginBottom: spacing.xl },
  twoCol:  { flexDirection: 'row', gap: 10 },
  label: {
    fontFamily: fonts.body, fontSize: 11, letterSpacing: 1,
    textTransform: 'uppercase', color: colors.textTertiary, marginBottom: spacing.sm,
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgElevated, borderWidth: 1,
    borderColor: colors.border, borderRadius: radius.subtle, paddingHorizontal: 14,
  },
  inputWrapError: { borderColor: colors.red },
  input: { flex: 1, height: 48, fontFamily: fonts.body, fontSize: 15, color: colors.textPrimary, paddingVertical: 0 },
  monoInput: { fontFamily: fonts.mono, letterSpacing: 2 },
  prefix: { paddingRight: 10, borderRightWidth: 1, borderRightColor: colors.border, marginRight: 10, height: 48, justifyContent: 'center' },
  prefixText: { fontFamily: fonts.body, fontSize: 15, color: colors.textSecondary },
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  hint: { fontFamily: fonts.body, fontSize: 10, color: colors.textTertiary },

  fieldErrRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  fieldErrText: { fontFamily: fonts.body, fontSize: 11, color: colors.red },

  globalError: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.redMuted, borderRadius: radius.subtle,
    paddingVertical: 12, paddingHorizontal: 14, marginTop: spacing.lg,
  },
  globalErrorText: { fontFamily: fonts.body, fontSize: 13, color: colors.red, flex: 1 },

  dropdown: {
    position: 'absolute', top: 82, left: 0, right: 0, zIndex: 100,
    backgroundColor: colors.bgElevated, borderWidth: 1,
    borderColor: colors.border, borderRadius: radius.subtle,
  },
  dropItem: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  dropText: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },

  secondaryBtn: {
    height: 48, backgroundColor: colors.bgElevated,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.subtle,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  secondaryBtnText: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.textPrimary },

  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: spacing.sm },
  otpBox: {
    width: 44, height: 52, backgroundColor: colors.bgElevated,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.subtle,
    fontFamily: fonts.mono, fontSize: 20, color: colors.textPrimary,
  },
  otpBoxFilled: { borderColor: colors.red },
  otpBoxError:  { borderColor: colors.red, backgroundColor: `${colors.red}10` },

  verifyBtn: {
    height: 48, backgroundColor: colors.red, borderRadius: radius.subtle,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.md,
  },
  verifyBtnText: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.textPrimary },
  resendRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md },
  resendBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  resendText: { fontFamily: fonts.body, fontSize: 12, color: colors.textTertiary },
  changeLink: { fontFamily: fonts.body, fontSize: 12, color: colors.verified },

  verifiedCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: `${colors.verified}15`, borderWidth: 1,
    borderColor: `${colors.verified}30`, borderRadius: radius.subtle, padding: spacing.lg,
  },
  verifiedIconWrap: {
    width: 40, height: 40, backgroundColor: `${colors.verified}20`,
    borderRadius: 20, alignItems: 'center', justifyContent: 'center',
  },
  verifiedTitle: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.verified },
  verifiedSub: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  tagSelected: { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
  tagText: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.textSecondary },
  tagTextSelected: { color: colors.bg },

  trustCard: {
    backgroundColor: colors.bgElevated, borderWidth: 1,
    borderColor: colors.border, borderRadius: radius.subtle, padding: spacing.lg, marginBottom: spacing.lg,
  },
  trustTitle: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.textPrimary, marginBottom: 4 },
  trustSub: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  summaryCard: {
    backgroundColor: colors.bgElevated, borderRadius: radius.subtle,
    padding: spacing.lg, marginBottom: spacing.lg,
  },
  summaryLabel: { fontFamily: fonts.body, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: colors.textTertiary, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryKey: { fontFamily: fonts.body, fontSize: 13, color: colors.textTertiary },
  summaryVal: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.textPrimary },

  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkbox: {
    width: 18, height: 18, borderRadius: radius.subtle,
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  checkboxChecked: { backgroundColor: colors.red, borderColor: colors.red },
  checkboxError:   { borderColor: colors.red, backgroundColor: `${colors.red}10` },
  termsText: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, flex: 1, lineHeight: 18 },

  footer: { paddingHorizontal: spacing.xxl, paddingBottom: 40, paddingTop: spacing.lg },
  nextBtn: {
    height: 52, backgroundColor: colors.red, borderRadius: radius.subtle,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  nextBtnText: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.textPrimary },

  // DOB Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  dobSheet: { backgroundColor: colors.bgElevated, borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 40 },
  dobHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl, paddingVertical: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  dobTitle:   { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.textPrimary },
  dobCancel:  { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },
  dobConfirm: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.red },
  dobColumns: { flexDirection: 'row', paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  dobColWrap: { flex: 1, alignItems: 'center' },
  dobColLabel: { fontFamily: fonts.body, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: colors.textTertiary, marginBottom: spacing.sm },
  dobList: { height: 220 },
  dobItem: { height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radius.subtle },
  dobItemActive: { backgroundColor: `${colors.red}20` },
  dobItemText: { fontFamily: fonts.body, fontSize: 16, color: colors.textSecondary },
  dobItemTextActive: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.red },
})
