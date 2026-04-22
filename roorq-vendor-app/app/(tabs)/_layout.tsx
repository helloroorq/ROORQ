import { Tabs } from 'expo-router'
import { Home, List, ShoppingBag, BarChart2, Plus } from 'lucide-react-native'
import { TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { colors } from '../../src/constants/colors'
import { fonts } from '../../src/constants/typography'

function AddButton() {
  const router = useRouter()
  return (
    <TouchableOpacity
      style={styles.addBtn}
      onPress={() => router.push('/list-item')}
      activeOpacity={0.85}
    >
      <Plus size={24} color={colors.textPrimary} strokeWidth={2.5} />
    </TouchableOpacity>
  )
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 68,
          paddingBottom: 12,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.body,
          fontSize: 10,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'HOME',
          tabBarIcon: ({ color, focused }) => <Home size={22} color={color} fill={focused ? color : 'none'} />,
        }}
      />
      <Tabs.Screen
        name="listings"
        options={{
          title: 'LISTINGS',
          tabBarIcon: ({ color, focused }) => <List size={22} color={color} fill={focused ? color : 'none'} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarButton: () => <AddButton />,
        }}
        listeners={{ tabPress: e => e.preventDefault() }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'ORDERS',
          tabBarIcon: ({ color, focused }) => <ShoppingBag size={22} color={color} fill={focused ? color : 'none'} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'EARNINGS',
          tabBarIcon: ({ color }) => <BarChart2 size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ href: null }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  addBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
    shadowColor: colors.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
})
