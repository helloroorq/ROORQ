// AUTH BYPASSED FOR DESIGN/DEV — restore session check when auth is ready
// Original: checks supabase session → redirects to /(tabs) or /(auth)/welcome
import { Redirect } from 'expo-router'

export default function Index() {
  return <Redirect href={'/(tabs)' as any} />
}
