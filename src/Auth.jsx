import { useState } from 'react'
import { supabase } from './supabase'
import './Auth.css'

export default function Auth() {
  const [mode, setMode] = useState('login') // 'login' | 'register' | 'reset'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const switchMode = (next) => { setMode(next); setError(''); setMessage('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else if (mode === 'register') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setMessage('確認メールを送信しました。メールをご確認ください。')
      }
    } else if (mode === 'reset') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://my-app-six-delta.vercel.app/',
      })
      if (error) {
        setError(error.message)
      } else {
        setMessage('パスワードリセットメールを送信しました。メールをご確認ください。')
      }
    }

    setLoading(false)
  }

  const subtitleMap = { login: 'アカウントにログイン', register: '新規アカウント登録', reset: 'パスワードをリセット' }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon">✓</span>
          <span className="auth-logo-text">TaskFlow</span>
        </div>
        <p className="auth-subtitle">{subtitleMap[mode]}</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@mail.com"
              required
            />
          </div>

          {mode !== 'reset' && (
            <div className="auth-field">
              <label>パスワード</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="6文字以上"
                required
                minLength={6}
              />
            </div>
          )}

          {error && <p className="auth-error">{error}</p>}
          {message && <p className="auth-message">{message}</p>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? '処理中...' : mode === 'login' ? 'ログイン' : mode === 'register' ? '登録する' : 'リセットメールを送信'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login' && (
            <>
              <button onClick={() => switchMode('reset')}>パスワードを忘れた方はこちら</button>
              <br />
              アカウントをお持ちでない方は<button onClick={() => switchMode('register')}>新規登録</button>
            </>
          )}
          {mode === 'register' && (
            <>すでにアカウントをお持ちの方は<button onClick={() => switchMode('login')}>ログイン</button></>
          )}
          {mode === 'reset' && (
            <><button onClick={() => switchMode('login')}>← ログインに戻る</button></>
          )}
        </p>
      </div>
    </div>
  )
}
