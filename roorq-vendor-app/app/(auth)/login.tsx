import { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ArrowLeft, Eye, EyeOff, Mail, Phone } from 'lucide-react-native'
import { supabase } from '../../lib/supabase'
import { RoorqLogo } from '../../src/components/common/RoorqLogo'
import { colors } from '../../src/constants/colors'
import { fonts } from '../../src/constants/typography'
import { spacing, radius } from '../../src/constants/spacing'

type Mode = 'email' | 'mobile'

export default function LoginScreen() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('email')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setError('')
    if (mode === 'email') {
      if (!email || !password) { setError('Please fill all fields'); return }
      setLoading(true)
      const { data: signInData, error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      setLoading(false)
      if (err) {
        if (err.message.toLowerCase().includes('email not confirmed') ||
            err.message.toLowerCase().includes('email_not_confirmed')) {
          setError('Please confirm your email first — check your inbox for the confirmation link.')
        } else if (err.message.toLowerCase().includes('invalid login credentials')) {
          setError('Incorrect email or password.')
        } else {
          setError(err.message)
        }
        return
      }
      // If vendor hasn't completed onboarding, send them there
      const uid = signInData.user?.id
      if (uid) {
        const { data: vendor } = await supabase
          .from('vendors')
          .select('setup_complete')
          .eq('id', uid)
          .single()
        if (vendor && !vendor.setup_complete) {
          router.replace(`/(auth)/onboarding?userId=${uid}` as any)
          return
        }
      }
      router.replace('/' as any)
    } else {
      if (!mobile) { setError('Please enter your mobile number'); return }
      if (!otpSent) {
        setLoading(true)
        const { error: err } = await supabase.auth.signInWithOtp({ phone: `+91${mobile.trim()}` })
        setLoading(false)
        if (err) { setError(err.message); return }
        setOtpSent(true)
        return
      }
      if (otp.length < 6) { setError('Enter the 6-digit OTP'); return }
      setLoading(true)
      const { error: err } = await supabase.auth.verifyOtp({
        phone: `+91${mobile.trim()}`, token: otp, type: 'sms',
      })
      setLoading(false)
      if (err) { setError(err.message); return }
      router.replace('/' as any)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={18} color={colors.textPrimary} />
        </TouchableOpacity>

        <RoorqLogo width={100} style={{ marginBottom: spacing.xxl }} />
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to manage your shop</Text>

        {/* Mode toggle */}
        <View style={styles.modeRow}>
          {(['email', 'mobile'] as Mode[]).map(m => (
            <TouchableOpacity
              key={m}
              style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
              onPress={() => { setMode(m); setError(''); setOtpSent(false); setOtp('') }}
            >
              {m === 'email'
                ? <Mail size={14} color={mode === m ? colors.textPrimary : colors.textTertiary} />
                : <Phone size={14} color={mode === m ? colors.textPrimary : colors.textTertiary} />}
              <Text style={[styles.modeBtnText, mode === m && styles.modeBtnTextActive]}>
                {m === 'email' ? 'Email' : 'Mobile'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {mode === 'email' ? (
          <View style={styles.fields}>
            <View>
              <Text style={styles.label}>EMAIL</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  value={email} onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textTertiary}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>
            <View>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={password} onChangeText={setPassword}
                  placeholder="Enter password"
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry={!showPass}
                />
                <TouchableOpacity onPress={() => setShowPass(p => !p)} style={{ padding: 4 }}>
                  {showPass
                    ? <EyeOff size={16} color={colors.textTertiary} />
                    : <Eye size={16} color={colors.textTertiary} />}
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.forgotRow}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.fields}>
            <View>
              <Text style={styles.label}>MOBILE NUMBER</Text>
              <View style={styles.inputWrap}>
                <View style={styles.prefix}>
                  <Text style={styles.prefixText}>+91</Text>
                </View>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={mobile} onChangeText={setMobile}
                  placeholder="98765 43210"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="phone-pad"
                  editable={!otpSent}
                />
              </View>
            </View>
            {otpSent && (
              <View>
                <Text style={styles.label}>ENTER OTP</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={[styles.input, { letterSpacing: 8, fontSize: 20, fontFamily: fonts.mono }]}
                    value={otp} onChangeText={setOtp}
                    placeholder="------"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
                <TouchableOpacity onPress={() => { setOtpSent(false); setOtp('') }}>
                  <Text style={[styles.link, { marginTop: 6 }]}>Change number</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.6 }]}
          onPress={handleLogin} disabled={loading} activeOpacity={0.85}
        >
          {loading && <ActivityIndicator size="small" color={colors.textPrimary} style={{ marginRight: 8 }} />}
          <Text style={styles.submitText}>
            {loading
              ? (mode === 'mobile' && !otpSent ? 'Sending OTP...' : 'Signing in...')
              : (mode === 'mobile' && !otpSent ? 'Send OTP' : 'Log In')}
          </Text>
        </TouchableOpacity>

        <Text style={styles.whatsapp}>
          Having trouble? <Text style={{ color: colors.verified }}>Chat on WhatsApp</Text>
        </Text>

        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.xxl, paddingTop: spacing.xxl, paddingBottom: 40 },
  backBtn: {
    width: 36, height: 36,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.subtle,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.xxxl,
  },
  title: { fontFamily: fonts.display, fontSize: 24, color: colors.textPrimary, marginBottom: 4 },
  subtitle: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, marginBottom: spacing.xxl },
  modeRow: {
    flexDirection: 'row',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.subtle,
    padding: 3,
    marginBottom: spacing.xl,
  },
  modeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 8, borderRadius: radius.subtle,
  },
  modeBtnActive: { backgroundColor: colors.bgHigher },
  modeBtnText: { fontFamily: fonts.body, fontSize: 13, color: colors.textTertiary },
  modeBtnTextActive: { color: colors.textPrimary },
  fields: { gap: spacing.xl },
  label: {
    fontFamily: fonts.body, fontSize: 11, letterSpacing: 1,
    textTransform: 'uppercase', color: colors.textTertiary, marginBottom: spacing.sm,
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.subtle, paddingHorizontal: 14,
  },
  input: { height: 48, fontFamily: fonts.body, fontSize: 15, color: colors.textPrimary, paddingVertical: 0 },
  prefix: {
    paddingRight: spacing.sm, borderRightWidth: 1,
    borderRightColor: colors.border, marginRight: spacing.sm,
    height: 48, justifyContent: 'center',
  },
  prefixText: { fontFamily: fonts.body, fontSize: 15, color: colors.textSecondary },
  link: { fontFamily: fonts.body, fontSize: 12, color: colors.verified },
  forgotRow: { alignItems: 'flex-end', marginTop: 6 },
  forgotText: { fontFamily: fonts.body, fontSize: 12, color: colors.verified },
  errorBox: {
    backgroundColor: colors.redMuted, borderRadius: radius.subtle,
    paddingVertical: 10, paddingHorizontal: 14, marginTop: spacing.lg,
  },
  errorText: { fontFamily: fonts.body, fontSize: 13, color: colors.red, textAlign: 'center' },
  submitBtn: {
    height: 52, backgroundColor: colors.red, borderRadius: radius.subtle,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: spacing.xxl,
  },
  submitText: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.textPrimary },
  whatsapp: {
    fontFamily: fonts.body, fontSize: 12, color: colors.textTertiary,
    textAlign: 'center', marginTop: spacing.lg,
  },
  signupRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  signupText: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  signupLink: {
    fontFamily: fonts.bodySemi, fontSize: 13,
    color: colors.textPrimary, textDecorationLine: 'underline',
  },
})
