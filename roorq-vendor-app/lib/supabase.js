import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'

const SUPABASE_URL  = 'https://hczkomkogsbtvvzivavf.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjemtvbWtvZ3NidHZ2eml2YXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMzU4OTUsImV4cCI6MjA3OTgxMTg5NX0.wjQWsW0mz9sIzq8BCyrQV3y9ncxIxrBnOS_BJeoqUbQ'

// expo-secure-store: survives hot reloads and app restarts
const SecureStoreAdapter = {
  getItem:    (key) => SecureStore.getItemAsync(key),
  setItem:    (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    storage:            SecureStoreAdapter,
    autoRefreshToken:   true,
    persistSession:     true,
    detectSessionInUrl: false,
  },
})
