import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const nav = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  function handleChange(e) { const { name, value } = e.target; setForm(p => ({ ...p, [name]: value })) }
  
  function validateForm() {
    // Name validation
    if (form.name.length < 6) {
      setError('Name must be at least 6 characters long')
      return false
    }
    if (!/^[a-zA-Z\s]+$/.test(form.name)) {
      setError('Name can only contain letters and spaces')
      return false
    }
    
    // Password validation
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9\s!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]+$/.test(form.password)) {
      setError('Password must contain at least one uppercase and one lowercase letter, and only contain standard keyboard characters')
      return false
    }
    
    return true
  }
  
  async function submit(e) {
    e.preventDefault()
    setError('')
    if (!validateForm()) return
    try { setSubmitting(true); await register(form.name, form.email, form.password, form.role); nav('/login') } catch (err) { setError(err.message || 'Registration failed') } finally { setSubmitting(false) }
  }
  return (
    <div className="center-page">
      <div className="auth">
        <div className="tabs"><Link to="/login">Login</Link><Link className="active" to="/register">Register</Link></div>
        <form onSubmit={submit} className="form">
          <input name="name" placeholder="Name (min 6 characters, letters only)" value={form.name} onChange={handleChange} />
          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
          <input type="password" name="password" placeholder="Password (min 6 chars, 1 uppercase, 1 lowercase)" value={form.password} onChange={handleChange} />
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
          {error && <div className="meta" style={{ color: '#e02424' }}>{error}</div>}
          <button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create account'}</button>
        </form>
      </div>
    </div>
  )
}


