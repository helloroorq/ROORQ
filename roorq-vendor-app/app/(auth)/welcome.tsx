import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { RoorqLogo } from '../../src/components/common/RoorqLogo'
import { colors } from '../../src/constants/colors'
import { fonts } from '../../src/constants/typography'
import { spacing, radius } from '../../src/constants/spacing'


export default function WelcomeScreen() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1763457990221-1622966f4ef0?w=800&q=80' }}
        style={styles.hero}
        resizeMode="cover"
      >
        <View style={styles.gradient} />
        <View style={styles.logoRow}>
          <RoorqLogo width={100} />
        </View>
        <View style={styles.heroText}>
          <Text style={styles.headline}>Sell thrifted.{'\n'}Get paid weekly.</Text>
          <Text style={styles.sub}>Join India's verified vintage marketplace.</Text>
        </View>
      </ImageBackground>

      <View style={styles.ctas}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/(auth)/signup')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Start selling on ROORQ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')}
          style={styles.ghostBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.ghostBtnText}>
            Already have an account?{' '}
            <Text style={styles.ghostBtnUnderline}>Log in</Text>
          </Text>
        </TouchableOpacity>
        <Text style={styles.terms}>By continuing you agree to our Terms & Privacy</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  hero: {
    flex: 1,
    justifyContent: 'space-between',
  },
  logoRow: {
    paddingHorizontal: spacing.xl,
    paddingTop: 56,
  },
  heroText: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  headline: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 34,
    color: colors.textPrimary,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  ctas: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 40,
    paddingTop: spacing.xxl,
    backgroundColor: colors.bg,
    gap: spacing.md,
  },
  primaryBtn: {
    height: 52,
    backgroundColor: colors.red,
    borderRadius: radius.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.textPrimary,
  },
  ghostBtn: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostBtnText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textPrimary,
  },
  ghostBtnUnderline: {
    fontFamily: fonts.bodySemi,
    textDecorationLine: 'underline',
  },
  terms: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: colors.bg,
    opacity: 0.85,
  },
})
