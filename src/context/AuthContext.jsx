import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { AuthAPI } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(token))

  useEffect(() => {
    if (!token) return
    AuthAPI.me().then(d => setUser(d.user || null)).catch(() => setUser(null)).finally(() => setLoading(false))
  }, [token])

  async function login(email, password) {
    const { token: t, user: u } = await AuthAPI.login({ email, password })
    localStorage.setItem('token', t)
    setToken(t)
    setUser(u)
  }

  async function register(name, email, password, role) {
    await AuthAPI.register({ name, email, password, role })
  }

  function logout() {
    localStorage.removeItem('token')
    setToken('')
    setUser(null)
  }

  const value = useMemo(() => ({ token, user, loading, login, logout, register }), [token, user, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}


