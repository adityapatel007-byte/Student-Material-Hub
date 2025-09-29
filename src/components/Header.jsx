import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { user, logout } = useAuth()
  return (
    <header className="header">
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none' }}><h1>Student Material Hub</h1></Link>
        <nav style={{ display: 'flex', gap: 8 }}>
          <Link to="/notes">Browse</Link>
          <Link to="/upload">Upload</Link>
          {user?.role === 'admin' && <Link to="/admin">Admin Panel</Link>}
        </nav>
      </div>
      <div>
        <span>{user?.name} ({user?.role})</span>
        <button onClick={logout} style={{ marginLeft: 8 }}>Logout</button>
      </div>
    </header>
  )
}


