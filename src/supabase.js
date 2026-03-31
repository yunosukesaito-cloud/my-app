import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Supabaseクライアント生成前にリカバリーフローを検出
// PKCE: クエリパラメータ ?mode=reset（Auth.jsxのredirectToで付与）
// Implicit: ハッシュ #type=recovery
const _hash = window.location.hash
const _hashParams = new URLSearchParams(_hash.startsWith('#') ? _hash.slice(1) : '')
const _searchParams = new URLSearchParams(window.location.search)
export const isRecoveryFlow =
  _hashParams.get('type') === 'recovery' ||
  _searchParams.get('mode') === 'reset'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
