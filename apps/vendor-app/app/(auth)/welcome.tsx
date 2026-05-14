import { useEffect, useRef, useState } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Dimensions, Animated,
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { RoorqLogo } from '../../src/components/common/RoorqLogo'
import { colors } from '../../src/constants/colors'
import { spacing, radius } from '../../src/constants/spacing'

const { width } = Dimensions.get('window')

const SLIDES = [
  {
    id: '1',
    emoji: '🏷️',
    headline: 'Sell your vintage.',
    sub: 'Reach IIT Roorkee.',
    body: 'List your thrifted and vintage pieces in minutes. Students are shopping.',
  },
  {
    id: '2',
    emoji: '✓',
    headline: 'Get verified.',
    sub: 'Build trust.',
    body: 'ROORQ Verified sellers move inventory faster. Your credibility, our guarantee.',
  },
  {
    id: '3',
    emoji: '₹',
    headline: 'Get paid',
    sub: 'every Friday.',
    body: 'Weekly payouts straight to your UPI. No delays, no confusion.',
  },
]

export default function WelcomeScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [activeIndex, setActiveIndex] = useState(0)
  const [showCarousel, setShowCarousel] = useState(false)
  const flatListRef = useRef<FlatList>(null)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const carouselFade = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start()

    const t = setTimeout(() => {
      setShowCarousel(true)
      Animated.timing(carouselFade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start()
    }, 1500)

    return () => clearTimeout(t)
  }, [])

  const handleScroll = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width)
    setActiveIndex(idx)
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <RoorqLogo />
        <Text style={styles.tagline}>Indian vintage. Curated.</Text>
      </Animated.View>

      {showCarousel && (
        <Animated.View style={[styles.carouselWrapper, { opacity: carouselFade }]}>
          <FlatList
            ref={flatListRef}
            data={SLIDES}
            keyExtractor={(s) => s.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
            renderItem={({ item }) => (
              <View style={styles.slide}>
                <Text style={styles.slideEmoji}>{item.emoji}</Text>
                <Text style={styles.slideHeadline}>{item.headline}</Text>
                <Text style={styles.slideSub}>{item.sub}</Text>
                <Text style={styles.slideBody}>{item.body}</Text>
              </View>
            )}
          />

          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === activeIndex && styles.dotActive]}
              />
            ))}
          </View>
        </Animated.View>
      )}

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/(auth)/sign-up')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>GET STARTED</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push({ pathname: '/(auth)/sign-up', params: { tab: 'login' } })}
          activeOpacity={0.7}
          style={styles.loginLink}
        >
          <Text style={styles.loginLinkText}>Already a vendor? <Text style={styles.loginLinkAccent}>Log In</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xxl * 2,
    paddingBottom: spacing.xl,
  },
  tagline: {
    marginTop: spacing.sm,
    fontSize: 13,
    letterSpacing: 2,
    color: colors.textTertiary,
    textTransform: 'uppercase',
  },
  carouselWrapper: {
    flex: 1,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl * 2,
  },
  slideEmoji: {
    fontSize: 52,
    marginBottom: spacing.xl,
  },
  slideHeadline: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 34,
  },
  slideSub: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.red,
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: spacing.lg,
  },
  slideBody: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.bgHigher,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.red,
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
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
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.textPrimary,
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  loginLinkText: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  loginLinkAccent: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
})
