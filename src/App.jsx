import { useState } from 'react'
import './App.css'

const FILTERS = ['ALL', 'ACTIVE', 'DONE']

export default function App() {
  const [tasks, setTasks] = useState([])
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState('ALL')

  const addTask = () => {
    const text = input.trim()
    if (!text) return
    setTasks([...tasks, { id: Date.now(), text, done: false }])
    setInput('')
  }

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id))
  }

  const filteredTasks = tasks.filter(t => {
    if (filter === 'ACTIVE') return !t.done
    if (filter === 'DONE') return t.done
    return true
  })

  return (
    <div className="container">
      <h1>QUEST LOG</h1>

      <div className="input-row">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
          placeholder="新しいクエストを入力..."
        />
        <button onClick={addTask}>ADD</button>
      </div>

      <div className="filters">
        {FILTERS.map(f => (
          <button
            key={f}
            className={filter === f ? 'active' : ''}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <ul className="task-list">
        {filteredTasks.length === 0 && (
          <li className="empty">-- NO QUESTS ACTIVE --</li>
        )}
        {filteredTasks.map(task => (
          <li key={task.id} className={task.done ? 'done' : ''}>
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => toggleTask(task.id)}
            />
            <span>{task.text}</span>
            <button className="delete" onClick={() => deleteTask(task.id)}>DEL</button>
          </li>
        ))}
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
    </div>
  )
}
