import { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ArrowLeft, Eye, EyeOff, CheckCircle2, Circle } from 'lucide-react-native'
import { supabase } from '../../lib/supabase'
import { RoorqLogo } from '../../src/components/common/RoorqLogo'
import { colors } from '../../src/constants/colors'
import { fonts } from '../../src/constants/typography'
import { spacing, radius } from '../../src/constants/spacing'

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (pw.length === 0) return { score: 0, label: '', color: colors.border }
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const map = [
    { score: 1, label: 'Weak', color: colors.red },
    { score: 2, label: 'Fair', color: '#E67E22' },
    { score: 3, label: 'Good', color: '#F1C40F' },
    { score: 4, label: 'Strong', color: colors.verified },
  ]
  return map[score - 1] ?? { score: 0, label: '', color: colors.border }
}

export default function SignupScreen() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const strength = getPasswordStrength(password)

  const handleSignup = async () => {
    setError('')
    if (!fullName.trim()) { setError('Please enter your full name'); return }
    if (!email.trim()) { setError('Please enter your email'); return }
    if (!phone.trim() || phone.length < 10) { setError('Please enter a valid phone number'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (!agreed) { setError('Please agree to the Terms & Privacy Policy'); return }

    setLoading(true)

    // 1. Create the auth account
    const { data, error: signUpErr } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim(), phone: phone.trim() } },
    })

    // Handle "User already registered" separately — guide them to login
    if (signUpErr) {
      setLoading(false)
      if (signUpErr.message.toLowerCase().includes('already registered') ||
          signUpErr.message.toLowerCase().includes('already exists')) {
        setError('An account with this email already exists. Please go to Login.')
      } else {
        setError(signUpErr.message)
      }
      return
    }

    const userId = data.user?.id
    if (!userId) { setLoading(false); setError('Signup failed — please try again.'); return }

    // 2. DB trigger auto-creates the vendors row (on_auth_user_created_vendor).

    // 3. If email confirmation is ON, signUp returns session:null.
    //    Attempt immediate sign-in so we have a session for onboarding.
    if (!data.session) {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (signInErr) {
        setLoading(false)
        // Supabase email confirmation is enabled — user must confirm first
        if (
          signInErr.message.toLowerCase().includes('email not confirmed') ||
          signInErr.message.toLowerCase().includes('email_not_confirmed')
        ) {
          setError(
            'Account created! Check your email inbox for a confirmation link, click it, then come back and Log In.'
          )
        } else {
          setError(`Sign-in failed: ${signInErr.message}`)
        }
        return
      }
    }

    setLoading(false)
    router.push(`/(auth)/onboarding?userId=${userId}` as any)
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
    >
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={18} color={colors.textPrimary} />
        </TouchableOpacity>

        <RoorqLogo width={88} style={{ marginBottom: spacing.xxl }} />

        <Text style={styles.title}>Create your shop</Text>
        <Text style={styles.subtitle}>Join India's verified vintage marketplace</Text>

        {/* Step pill */}
        <View style={styles.stepPill}>
          <Text style={styles.stepText}>STEP 1 OF 2 — ACCOUNT</Text>
        </View>

        <View style={styles.fields}>
          {/* Full name */}
          <Field label="FULL NAME">
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="As on your Aadhaar"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="words"
            />
          </Field>

          {/* Email */}
          <Field label="EMAIL">
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </Field>

          {/* Phone */}
          <Field label="PHONE">
            <View style={styles.phonePrefix}>
              <Text style={styles.phonePrefixText}>+91</Text>
              <View style={styles.phoneDivider} />
            </View>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={phone}
              onChangeText={t => setPhone(t.replace(/[^0-9]/g, '').slice(0, 10))}
              placeholder="10-digit mobile number"
              placeholderTextColor={colors.textTertiary}
              keyboardType="number-pad"
            />
          </Field>

          {/* Password */}
          <View>
            <Field label="PASSWORD">
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Min. 8 characters"
                placeholderTextColor={colors.textTertiary}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity onPress={() => setShowPass(p => !p)} style={styles.eyeBtn}>
                {showPass
                  ? <EyeOff size={16} color={colors.textTertiary} />
                  : <Eye size={16} color={colors.textTertiary} />}
              </TouchableOpacity>
            </Field>

            {/* Password strength */}
            {password.length > 0 && (
              <View style={styles.strengthRow}>
                {[1, 2, 3, 4].map(i => (
                  <View
                    key={i}
                    style={[
                      styles.strengthBar,
                      { backgroundColor: i <= strength.score ? strength.color : colors.bgElevated },
                    ]}
                  />
                ))}
                {strength.label ? (
                  <Text style={[styles.strengthLabel, { color: strength.color }]}>
                    {strength.label}
                  </Text>
                ) : null}
              </View>
            )}
          </View>
        </View>

        {/* Error */}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Terms */}
        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => setAgreed(a => !a)}
          activeOpacity={0.7}
        >
          {agreed
            ? <CheckCircle2 size={18} color={colors.red} />
            : <Circle size={18} color={colors.textTertiary} />}
          <Text style={styles.termsText}>
            I agree to ROORQ's{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' & '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </TouchableOpacity>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, (loading || !agreed) && { opacity: 0.55 }]}
          onPress={handleSignup}
          disabled={loading || !agreed}
          activeOpacity={0.85}
        >
          {loading && (
            <ActivityIndicator size="small" color={colors.textPrimary} style={{ marginRight: 8 }} />
          )}
          <Text style={styles.submitText}>
            {loading ? 'Creating account...' : 'Create Account →'}
          </Text>
        </TouchableOpacity>

        {/* Login link */}
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login' as any)}>
            <Text style={styles.loginLink}>Log in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: 48,
  },
  backBtn: {
    width: 36, height: 36,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.subtle,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.xxxl,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  stepPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.subtle,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: spacing.xxl,
  },
  stepText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textTertiary,
    letterSpacing: 1,
  },
  fields: { gap: spacing.xl },
  label: {
    fontFamily: fonts.body,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.subtle,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  input: {
    flex: 1,
    height: 48,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  phonePrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  phonePrefixText: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.textSecondary,
  },
  phoneDivider: {
    width: 1,
    height: 18,
    backgroundColor: colors.border,
    marginLeft: 8,
  },
  eyeBtn: { padding: 4 },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  strengthBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  strengthLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    marginLeft: 4,
    width: 46,
  },
  errorBox: {
    backgroundColor: colors.redMuted,
    borderRadius: radius.subtle,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: spacing.lg,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.red,
    textAlign: 'center',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.xxl,
  },
  termsText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  termsLink: {
    fontFamily: fonts.bodySemi,
    color: colors.textPrimary,
    textDecorationLine: 'underline',
  },
  submitBtn: {
    height: 52,
    backgroundColor: colors.red,
    borderRadius: radius.subtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  submitText: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.textPrimary,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  loginText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  loginLink: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.textPrimary,
    textDecorationLine: 'underline',
  },
})