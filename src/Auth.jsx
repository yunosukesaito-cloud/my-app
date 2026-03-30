import { useState } from 'react'
import { supabase } from './supabase'
import './Auth.css'

export default function Auth() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setMessage('確認メールを送信しました。メールをご確認ください。')
      }
    }

    setLoading(false)
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon">✓</span>
          <span className="auth-logo-text">TaskFlow</span>
        </div>
        <p className="auth-subtitle">
          {mode === 'login' ? 'アカウントにログイン' : '新規アカウント登録'}
        </p>

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

          {error && <p className="auth-error">{error}</p>}
          {message && <p className="auth-message">{message}</p>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? '処理中...' : mode === 'login' ? 'ログイン' : '登録する'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login' ? (
            <>アカウントをお持ちでない方は<button onClick={() => { setMode('register'); setError(''); setMessage('') }}>新規登録</button></>
          ) : (
            <>すでにアカウントをお持ちの方は<button onClick={() => { setMode('login'); setError(''); setMessage('') }}>ログイン</button></>
          )}
        </p>
      </div>
    </div>
  )
}
