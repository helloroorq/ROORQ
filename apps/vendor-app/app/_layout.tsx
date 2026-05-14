import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="list-item"       options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="story-score"    options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="product-detail" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="settings" />
      </Stack>
    </SafeAreaProvider>
  )
}
