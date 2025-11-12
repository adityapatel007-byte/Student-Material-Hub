import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './context/AuthContext'
import RequireAuth from './components/RequireAuth'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import UploadPage from './pages/UploadPage'
import NotesPage from './pages/NotesPage'
import AdminPanel from './pages/AdminPanel'
import QAPage from './pages/QAPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/upload" element={<RequireAuth><UploadPage /></RequireAuth>} />
        <Route path="/notes" element={<RequireAuth><NotesPage /></RequireAuth>} />
        <Route path="/qa" element={<RequireAuth><QAPage /></RequireAuth>} />
        <Route path="/admin" element={<RequireAuth><AdminPanel /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
