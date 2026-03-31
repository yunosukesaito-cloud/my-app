import { useState } from 'react'
import { supabase } from './supabase'
import './Auth.css'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (password !== confirm) {
      setError('パスワードが一致しません')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
    } else {
      setMessage('パスワードを変更しました！')
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
        <p className="auth-subtitle">新しいパスワードを設定</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>新しいパスワード</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="6文字以上"
              required
              minLength={6}
            />
          </div>
          <div className="auth-field">
            <label>パスワード（確認）</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="もう一度入力"
              required
              minLength={6}
            />
          </div>

          {error && <p className="auth-error">{error}</p>}
          {message && <p className="auth-message">{message}</p>}

          <button type="submit" className="auth-button" disabled={loading || !!message}>
            {loading ? '処理中...' : 'パスワードを変更する'}
          </button>
        </form>
      </div>
    </div>
  )
}
