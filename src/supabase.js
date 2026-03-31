import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Supabaseクライアント生成前にハッシュを読む（生成後は消去される）
const _hash = window.location.hash
const _params = new URLSearchParams(_hash.startsWith('#') ? _hash.slice(1) : '')
export const isRecoveryFlow = _params.get('type') === 'recovery'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
