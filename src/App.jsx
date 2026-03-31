import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Auth from './Auth'
import ResetPassword from './ResetPassword'
import './App.css'

const STATUS_FILTERS = ['すべて', '未完了', '完了']

export const CATEGORIES = [
  { label: 'すべて',  color: '#6b7280' },
  { label: '仕事',    color: '#3b82f6' },
  { label: '個人',    color: '#8b5cf6' },
  { label: '買い物',  color: '#10b981' },
  { label: 'その他',  color: '#f59e0b' },
]

const today = () => new Date().toISOString().slice(0, 10)

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function isOverdue(dateStr) {
  if (!dateStr) return false
  return dateStr < today()
}

export default function App() {
  const [session, setSession] = useState(null)
  const [isRecovery, setIsRecovery] = useState(false)
  const [tasks, setTasks] = useState([])
  const [input, setInput] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [category, setCategory] = useState('仕事')
  const [statusFilter, setStatusFilter] = useState('すべて')
  const [categoryFilter, setCategoryFilter] = useState('すべて')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [taskError, setTaskError] = useState('')

  useEffect(() => {
    // URLハッシュからrecoveryタイプを即時検出
    const hash = window.location.hash
    const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : '')
    if (hashParams.get('type') === 'recovery') {
      setIsRecovery(true)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true)
      } else if (event === 'SIGNED_OUT') {
        setIsRecovery(false)
      }
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    fetchTasks()
  }, [session])

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) {
      setTaskError('タスクの読み込みに失敗しました: ' + error.message)
    } else {
      setTasks(data)
    }
  }

  const addTask = async () => {
    const text = input.trim()
    if (!text || adding) return
    setAdding(true)
    setTaskError('')
    const { error } = await supabase
      .from('tasks')
      .insert({
        text,
        done: false,
        user_id: session.user.id,
        due_date: dueDate || null,
        category,
      })
    if (error) {
      setTaskError('タスクの追加に失敗しました: ' + error.message)
    } else {
      setInput('')
      setDueDate('')
      await fetchTasks()
    }
    setAdding(false)
  }

  const toggleTask = async (id, done) => {
    setTaskError('')
    const { error } = await supabase.from('tasks').update({ done: !done }).eq('id', id)
    if (error) {
      setTaskError('更新に失敗しました: ' + error.message)
    } else {
      setTasks(tasks.map(t => t.id === id ? { ...t, done: !done } : t))
    }
  }

  const deleteTask = async (id) => {
    setTaskError('')
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) {
      setTaskError('削除に失敗しました: ' + error.message)
    } else {
      setTasks(tasks.filter(t => t.id !== id))
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setTasks([])
  }

  const filteredTasks = tasks.filter(t => {
    if (statusFilter === '未完了' && t.done) return false
    if (statusFilter === '完了' && !t.done) return false
    if (categoryFilter !== 'すべて' && t.category !== categoryFilter) return false
    return true
  })

  const getCategoryColor = (label) =>
    CATEGORIES.find(c => c.label === label)?.color ?? '#6b7280'

  if (loading) return null
  if (!session) return <Auth />
  if (isRecovery) return <ResetPassword />

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-logo">
            <span className="app-logo-icon">✓</span>
            <span className="app-logo-text">TaskFlow</span>
          </div>
          <div className="user-info">
            <span className="user-email">{session.user.email}</span>
            <button className="signout-button" onClick={handleSignOut}>ログアウト</button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* Add task form */}
        <div className="add-card">
          <div className="add-row">
            <input
              className="add-input"
              type="text"
              value={input}
              onChange={e => { setInput(e.target.value); setTaskError('') }}
              onKeyDown={e => e.key === 'Enter' && addTask()}
              placeholder="新しいタスクを入力..."
              disabled={adding}
            />
            <button className="add-button" onClick={addTask} disabled={adding}>
              {adding ? '追加中...' : '追加'}
            </button>
          </div>
          {taskError && <p className="task-error">{taskError}</p>}
          <div className="add-meta">
            <div className="add-meta-group">
              <label>カテゴリ</label>
              <div className="category-select-row">
                {CATEGORIES.slice(1).map(c => (
                  <button
                    key={c.label}
                    className={`cat-chip ${category === c.label ? 'selected' : ''}`}
                    style={{ '--cat-color': c.color }}
                    onClick={() => setCategory(c.label)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="add-meta-group">
              <label>期限日</label>
              <input
                className="date-input"
                type="date"
                value={dueDate}
                min={today()}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <div className="filter-group">
            {STATUS_FILTERS.map(f => (
              <button
                key={f}
                className={`filter-btn ${statusFilter === f ? 'active' : ''}`}
                onClick={() => setStatusFilter(f)}
              >{f}</button>
            ))}
          </div>
          <div className="filter-group">
            {CATEGORIES.map(c => (
              <button
                key={c.label}
                className={`filter-btn ${categoryFilter === c.label ? 'active' : ''}`}
                style={categoryFilter === c.label ? { '--active-color': c.color } : {}}
                onClick={() => setCategoryFilter(c.label)}
              >{c.label}</button>
            ))}
          </div>
        </div>

        {/* Task list */}
        <ul className="task-list">
          {filteredTasks.length === 0 && (
            <li className="task-empty">タスクがありません</li>
          )}
          {filteredTasks.map(task => {
            const overdue = !task.done && isOverdue(task.due_date)
            const color = getCategoryColor(task.category)
            return (
              <li
                key={task.id}
                className={`task-item ${task.done ? 'done' : ''} ${overdue ? 'overdue' : ''}`}
                style={{ '--cat-color': color }}
              >
                <div className="task-accent" />
                <input
                  type="checkbox"
                  className="task-check"
                  checked={task.done}
                  onChange={() => toggleTask(task.id, task.done)}
                />
                <div className="task-body">
                  <span className="task-text">{task.text}</span>
                  <div className="task-chips">
                    <span className="task-cat-chip" style={{ '--cat-color': color }}>
                      {task.category}
                    </span>
                    {task.due_date && (
                      <span className={`task-date-chip ${overdue ? 'overdue' : ''}`}>
                        {overdue ? '⚠ ' : '📅 '}{formatDate(task.due_date)}
                      </span>
                    )}
                  </div>
                </div>
                <button className="task-delete" onClick={() => deleteTask(task.id)}>✕</button>
              </li>
            )
          })}
        </ul>

        <div className="summary">
          <div className="xp-label">
            <span>QUEST PROGRESS</span>
            <span>{tasks.filter(t => t.done).length} / {tasks.length} CLEARED</span>
          </div>
          <div className="xp-bar-bg">
            <div
              className="xp-bar-fill"
              style={{ width: tasks.length === 0 ? '0%' : `${(tasks.filter(t => t.done).length / tasks.length) * 100}%` }}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
