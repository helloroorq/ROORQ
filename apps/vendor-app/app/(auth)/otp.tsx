import { useEffect, useRef, useState } from 'react'
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '../../lib/supabase'
import { RoorqLogo } from '../../src/components/common/RoorqLogo'
import { colors } from '../../src/constants/colors'
import { spacing, radius } from '../../src/constants/spacing'

const OTP_LENGTH = 6
const RESEND_SECONDS = 30

export default function OtpScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams<{
    phone: string
    fullName: string
    storeName: string
    isLogin: string
  }>()

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(RESEND_SECONDS)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null))

  const phone = params.phone ?? ''
  const fullName = params.fullName ?? ''
  const storeName = params.storeName ?? ''
  const isLogin = params.isLogin === '1'

  const maskedPhone = phone.length >= 10
    ? 'XXXXXX' + phone.slice(-4)
    : phone

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(id)
          setCanResend(true)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const code = digits.join('')
    if (code.length === OTP_LENGTH) {
      verifyOtp(code)
    }
  }, [digits])

  const handleDigit = (text: string, index: number) => {
    const char = text.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = char
    setDigits(next)
    if (char && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
      const next = [...digits]
      next[index - 1] = ''
      setDigits(next)
    }
  }

  const verifyOtp = async (code: string) => {
    setLoading(true)
    const { data, error } = await supabase.auth.verifyOtp({
      phone: '+91' + phone,
      token: code,
      type: 'sms',
    })
    if (error) {
      setLoading(false)
      Alert.alert('Invalid code', error.message)
      setDigits(Array(OTP_LENGTH).fill(''))
      inputRefs.current[0]?.focus()
      return
    }

    if (!isLogin && storeName) {
      await supabase
        .from('vendors')
        .update({ store_name: storeName })
        .eq('id', data.user!.id)
    }

    if (isLogin) {
      const { data: vendor } = await supabase
        .from('vendors')
        .select('setup_complete')
        .eq('id', data.user!.id)
        .single()
      setLoading(false)
      if (vendor?.setup_complete) {
        router.replace('/(tabs)')
      } else {
        router.replace('/(auth)/profile-setup')
      }
    } else {
      setLoading(false)
      router.replace('/(auth)/profile-setup')
    }
  }

  const handleResend = async () => {
    setCanResend(false)
    setCountdown(RESEND_SECONDS)
    setDigits(Array(OTP_LENGTH).fill(''))

    const { error } = await supabase.auth.signInWithOtp({
      phone: '+91' + phone,
    })
    if (error) {
      Alert.alert('Error', error.message)
    }

    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(id)
          setCanResend(true)
          return 0
        }
        return c - 1
      })
    }, 1000)
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar style="light" />

        <View style={styles.logoRow}>
          <RoorqLogo />
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>Verify your number</Text>
          <Text style={styles.subtitle}>
            Enter the code sent to{'\n'}+91 {maskedPhone}
          </Text>

          <View style={styles.boxesRow}>
            {digits.map((d, i) => (
              <TextInput
                key={i}
                ref={(r) => { inputRefs.current[i] = r }}
                style={[styles.box, d ? styles.boxFilled : undefined]}
                value={d}
                onChangeText={(t) => handleDigit(t, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                autoFocus={i === 0}
              />
            ))}
          </View>

          {loading && (
            <ActivityIndicator color={colors.red} style={{ marginTop: spacing.xl }} />
          )}

          <View style={styles.resendRow}>
            {canResend ? (
              <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                <Text style={styles.resendActive}>Resend code</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.resendTimer}>
                Resend in {countdown}s
              </Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.backLink}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.backLinkText}>← Change number</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  logoRow: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    paddingTop: spacing.xxl * 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xxl * 1.5,
  },
  boxesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  box: {
    width: 46,
    height: 56,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.subtle,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  boxFilled: {
    borderColor: colors.red,
  },
  resendRow: {
    marginTop: spacing.xxl,
    alignItems: 'center',
  },
  resendTimer: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  resendActive: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  backLink: {
    alignItems: 'center',
    paddingBottom: spacing.xxl * 2,
  },
  backLinkText: {
    fontSize: 14,
    color: colors.textTertiary,
  },
})
