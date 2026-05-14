import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '../lib/supabase'

export default function Index() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace('/(auth)/welcome')
        return
      }
      const { data: vendor } = await supabase
        .from('vendors')
        .select('setup_complete')
        .eq('id', session.user.id)
        .single()
      if (vendor?.setup_complete) {
        router.replace('/(tabs)')
      } else {
        router.replace('/(auth)/profile-setup')
      }
    })
  }, [])

  return (
    <View style={{ flex: 1, backgroundColor: '#0D0D0D', alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color="#C0392B" />
    </View>
  )
}
