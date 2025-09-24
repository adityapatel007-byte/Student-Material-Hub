const BASE = '' // proxied via Vite to backend

function getToken() {
  return localStorage.getItem('token') || ''
}

export async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {})
  const token = getToken()
  if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`)
  if (!(options.body instanceof FormData)) {
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(BASE + path, { ...options, headers })
  const text = await res.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  if (!res.ok) {
    const message = (data && (data.error || data.message)) || `HTTP ${res.status}`
    throw new Error(message)
  }
  return data
}

export const AuthAPI = {
  register: (payload) => apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => apiFetch('/api/auth/me'),
}

export const NotesAPI = {
  list: () => apiFetch('/api/notes'),
  upload: ({ title, description, file }) => {
    const fd = new FormData()
    if (title) fd.append('title', title)
    if (description) fd.append('description', description)
    fd.append('file', file)
    return apiFetch('/api/notes', { method: 'POST', body: fd })
  },
  downloadUrl: (id) => `/api/notes/${id}/download`,
  remove: (id) => apiFetch(`/api/notes/${id}`, { method: 'DELETE' }),
  async downloadBlob(id) {
    const token = getToken()
    const res = await fetch(`/api/notes/${id}/download`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || `HTTP ${res.status}`)
    }
    const disp = res.headers.get('content-disposition') || ''
    const match = disp.match(/filename="?([^";]+)"?/i)
    const filename = match ? decodeURIComponent(match[1]) : 'download'
    const blob = await res.blob()
    return { blob, filename }
  },
}


