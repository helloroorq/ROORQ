// This screen is never rendered — the tab button is intercepted by AddButton in _layout.tsx
import { Redirect } from 'expo-router'
export default function AddTab() {
  return <Redirect href="/list-item" />
}
