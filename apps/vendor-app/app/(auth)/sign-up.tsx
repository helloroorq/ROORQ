import { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '../../lib/supabase'
import { RoorqLogo } from '../../src/components/common/RoorqLogo'
import { colors } from '../../src/constants/colors'
import { spacing, radius } from '../../src/constants/spacing'

type Tab = 'signup' | 'login'

export default function SignUpScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams<{ tab?: string }>()

  const [activeTab, setActiveTab] = useState<Tab>(params.tab === 'login' ? 'login' : 'signup')
  const [phone, setPhone] = useState('')
  const [fullName, setFullName] = useState('')
  const [storeName, setStoreName] = useState('')
  const [referral, setReferral] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (params.tab === 'login') setActiveTab('login')
  }, [params.tab])

  const handleSendOtp = async () => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length !== 10) {
      Alert.alert('Invalid number', 'Enter a valid 10-digit mobile number.')
      return
    }
    if (activeTab === 'signup' && !fullName.trim()) {
      Alert.alert('Required', 'Please enter your full name.')
      return
    }
    if (activeTab === 'signup' && !storeName.trim()) {
      Alert.alert('Required', 'Please enter your shop or brand name.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      phone: '+91' + cleaned,
      options: {
        data: {
          full_name: fullName.trim(),
          phone: cleaned,
        },
      },
    })
    setLoading(false)

    if (error) {
      Alert.alert('Error', error.message)
      return
    }

    router.push({
      pathname: '/(auth)/otp',
      params: {
        phone: cleaned,
        fullName: fullName.trim(),
        storeName: storeName.trim(),
        isLogin: activeTab === 'login' ? '1' : '0',
      },
    })
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

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'signup' && styles.tabActive]}
            onPress={() => setActiveTab('signup')}
          >
            <Text style={[styles.tabText, activeTab === 'signup' && styles.tabTextActive]}>
              Sign Up
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'login' && styles.tabActive]}
            onPress={() => setActiveTab('login')}
          >
            <Text style={[styles.tabText, activeTab === 'login' && styles.tabTextActive]}>
              Log In
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.field}>
            <Text style={styles.label}>MOBILE NUMBER</Text>
            <View style={styles.phoneRow}>
              <View style={styles.prefix}>
                <Text style={styles.prefixText}>+91</Text>
              </View>
              <TextInput
                style={[styles.input, styles.phoneInput]}
                placeholder="9876543210"
                placeholderTextColor={colors.textTertiary}
                keyboardType="number-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          </View>

          {activeTab === 'signup' && (
            <>
              <View style={styles.field}>
                <Text style={styles.label}>FULL NAME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Harish Nenavath"
                  placeholderTextColor={colors.textTertiary}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>SHOP / BRAND NAME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Vintage Vault"
                  placeholderTextColor={colors.textTertiary}
                  value={storeName}
                  onChangeText={setStoreName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>REFERRAL CODE <Text style={styles.optional}>(optional)</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="ROORQ2024"
                  placeholderTextColor={colors.textTertiary}
                  value={referral}
                  onChangeText={setReferral}
                  autoCapitalize="characters"
                />
              </View>
            </>
          )}

          {activeTab === 'login' && (
            <Text style={styles.loginNote}>
              We'll send you a one-time code to verify your number.
            </Text>
          )}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSendOtp}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={colors.textPrimary} />
              : <Text style={styles.btnText}>SEND OTP</Text>
            }
          </TouchableOpacity>
        </View>
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
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.xxl,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.subtle,
    padding: 3,
    marginBottom: spacing.xxl,
  },
  tab: {
    flex: 1,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.subtle - 2,
  },
  tabActive: {
    backgroundColor: colors.bgHigher,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textTertiary,
  },
  tabTextActive: {
    color: colors.textPrimary,
  },
  form: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  optional: {
    color: colors.textTertiary,
    fontWeight: '400',
    textTransform: 'none',
    letterSpacing: 0,
  },
  input: {
    height: 48,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.subtle,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    fontSize: 15,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  prefix: {
    height: 48,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.subtle,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefixText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  phoneInput: {
    flex: 1,
  },
  loginNote: {
    color: colors.textTertiary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
  },
  btn: {
    height: 52,
    backgroundColor: colors.red,
    borderRadius: radius.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.textPrimary,
  },
})
