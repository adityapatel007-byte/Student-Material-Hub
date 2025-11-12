import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const nav = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  function handleChange(e) { const { name, value } = e.target; setForm(p => ({ ...p, [name]: value })) }
  
  function validateForm() {
    // Basic password validation for login (just to ensure it meets minimum requirements)
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }
    return true
  }
  
  async function submit(e) {
    e.preventDefault()
    setError('')
    if (!validateForm()) return
    try { setSubmitting(true); await login(form.email, form.password); nav('/') } catch (err) { setError(err.message || 'Login failed') } finally { setSubmitting(false) }
  }
  return (
    <div className="center-page">
      <h1 style={{ textAlign: 'center', marginBottom: 24, color: 'var(--color-text-dark)', textShadow: '0 2px 4px var(--color-shadow)', fontSize: '2.5em' }}>Student Material Hub</h1>
      <div className="auth">
        <div className="tabs"><Link className="active" to="/login">Login</Link><Link to="/register">Register</Link></div>
        <form onSubmit={submit} className="form">
          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
          <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} />
          {error && <div className="meta" style={{ color: '#e02424' }}>{error}</div>}
          <button type="submit" disabled={submitting}>{submitting ? 'Logging in...' : 'Login'}</button>
        </form>
      </div>
    </div>
  )
}


