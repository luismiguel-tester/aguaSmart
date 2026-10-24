import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigured =
  Boolean(supabaseUrl && supabaseAnonKey &&
    !supabaseUrl.includes('TU-PROYECTO') &&
    !supabaseAnonKey.includes('TU_CLAVE'))

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
