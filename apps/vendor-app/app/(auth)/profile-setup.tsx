import { useEffect, useRef, useState } from 'react'
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
  Alert, Image,
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../../lib/supabase'
import { RoorqLogo } from '../../src/components/common/RoorqLogo'
import { colors } from '../../src/constants/colors'
import { spacing, radius } from '../../src/constants/spacing'

export default function ProfileSetupScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [userId, setUserId] = useState<string | null>(null)
  const [avatarUri, setAvatarUri] = useState<string | null>(null)
  const [fullName, setFullName] = useState('')
  const [storeName, setStoreName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [upiId, setUpiId] = useState('')
  const [instagram, setInstagram] = useState('')
  const [city, setCity] = useState('Roorkee')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/(auth)/welcome')
        return
      }
      setUserId(user.id)
      const { data: vendor } = await supabase
        .from('vendors')
        .select('full_name, store_name, phone, whatsapp_number, upi_id, instagram, city, bio, avatar_url')
        .eq('id', user.id)
        .single()
      if (vendor) {
        setFullName(vendor.full_name ?? '')
        setStoreName(vendor.store_name ?? '')
        setWhatsapp(vendor.whatsapp_number ?? vendor.phone ?? '')
        setUpiId(vendor.upi_id ?? '')
        setInstagram(vendor.instagram ?? '')
        setCity(vendor.city ?? 'Roorkee')
        setBio(vendor.bio ?? '')
        if (vendor.avatar_url) setAvatarUri(vendor.avatar_url)
      }
      setLoading(false)
    }
    load()
  }, [])

  const pickAvatar = () => {
    Alert.alert('Profile Photo', 'Choose source', [
      {
        text: 'Camera',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync()
          if (status !== 'granted') return
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
          if (!result.canceled) setAvatarUri(result.assets[0].uri)
        },
      },
      {
        text: 'Gallery',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
          if (status !== 'granted') return
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
          if (!result.canceled) setAvatarUri(result.assets[0].uri)
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ])
  }

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Required', 'Please enter your full name.')
      return
    }
    if (!storeName.trim()) {
      Alert.alert('Required', 'Please enter your shop or brand name.')
      return
    }
    if (!upiId.trim() || !upiId.includes('@')) {
      Alert.alert('Invalid UPI ID', 'Enter a valid UPI ID (e.g. yourname@upi).')
      return
    }
    if (!userId) return

    setSaving(true)
    let avatarUrl: string | null = null

    if (avatarUri && !avatarUri.startsWith('http')) {
      try {
        const ext = 'jpg'
        const path = `${userId}/avatar.${ext}`
        const response = await fetch(avatarUri)
        const blob = await response.blob()
        const arrayBuffer = await new Response(blob).arrayBuffer()
        const { error: uploadError } = await supabase.storage
          .from('vendor-avatars')
          .upload(path, arrayBuffer, {
            contentType: 'image/jpeg',
            upsert: true,
          })
        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('vendor-avatars')
            .getPublicUrl(path)
          avatarUrl = urlData.publicUrl
        }
      } catch {
        // proceed without avatar
      }
    } else if (avatarUri?.startsWith('http')) {
      avatarUrl = avatarUri
    }

    const { error } = await supabase
      .from('vendors')
      .update({
        full_name: fullName.trim(),
        store_name: storeName.trim(),
        whatsapp_number: whatsapp.trim(),
        upi_id: upiId.trim(),
        instagram: instagram.trim() || null,
        city: city.trim() || 'Roorkee',
        bio: bio.trim() || null,
        avatar_url: avatarUrl,
        setup_complete: true,
      })
      .eq('id', userId)

    setSaving(false)

    if (error) {
      Alert.alert('Error', error.message)
      return
    }

    router.replace('/(tabs)')
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.red} />
      </View>
    )
  }

  const initials = storeName.trim().charAt(0).toUpperCase() || fullName.trim().charAt(0).toUpperCase() || '?'

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar style="light" />

        <View style={styles.logoRow}>
          <RoorqLogo />
          <Text style={styles.step}>Complete your profile</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.avatarWrap} onPress={pickAvatar} activeOpacity={0.8}>
            {avatarUri && !avatarUri.startsWith('http') ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarBadgeText}>📷</Text>
            </View>
          </TouchableOpacity>

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
            <Text style={styles.label}>WHATSAPP NUMBER</Text>
            <TextInput
              style={styles.input}
              placeholder="9876543210"
              placeholderTextColor={colors.textTertiary}
              value={whatsapp}
              onChangeText={setWhatsapp}
              keyboardType="number-pad"
              maxLength={10}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>UPI ID</Text>
            <TextInput
              style={styles.input}
              placeholder="yourname@upi"
              placeholderTextColor={colors.textTertiary}
              value={upiId}
              onChangeText={setUpiId}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>INSTAGRAM HANDLE <Text style={styles.optional}>(optional)</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="@yourbrand"
              placeholderTextColor={colors.textTertiary}
              value={instagram}
              onChangeText={setInstagram}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>CITY</Text>
            <TextInput
              style={styles.input}
              placeholder="Roorkee"
              placeholderTextColor={colors.textTertiary}
              value={city}
              onChangeText={setCity}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>BIO <Text style={styles.optional}>(optional)</Text></Text>
              <Text style={styles.charCount}>{bio.length}/150</Text>
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell buyers about your style and what you sell…"
              placeholderTextColor={colors.textTertiary}
              value={bio}
              onChangeText={(t) => setBio(t.slice(0, 150))}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.btn, saving && styles.btnDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving
              ? <ActivityIndicator color={colors.textPrimary} />
              : <Text style={styles.btnText}>SAVE & CONTINUE</Text>
            }
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  step: {
    marginTop: spacing.sm,
    fontSize: 13,
    letterSpacing: 1,
    color: colors.textTertiary,
    textTransform: 'uppercase',
  },
  form: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl * 2,
    alignItems: 'center',
  },
  avatarWrap: {
    marginBottom: spacing.xxl,
    position: 'relative',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.bgHigher,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.bgHigher,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bg,
  },
  avatarBadgeText: {
    fontSize: 14,
  },
  field: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  charCount: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  optional: {
    color: colors.textTertiary,
    fontWeight: '400',
    textTransform: 'none',
    letterSpacing: 0,
    fontSize: 11,
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
  textArea: {
    height: 96,
    paddingTop: spacing.md,
  },
  btn: {
    width: '100%',
    height: 52,
    backgroundColor: colors.red,
    borderRadius: radius.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
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
