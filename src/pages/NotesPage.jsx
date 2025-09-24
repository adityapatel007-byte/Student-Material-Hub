import { useEffect, useState } from 'react'
import Header from '../components/Header'
import { NotesAPI } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function NotesPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [notes, setNotes] = useState([])
  useEffect(() => { NotesAPI.list().then(d => setNotes(d.notes || [])) }, [])
  async function removeNote(id) { if(!confirm('Delete this note?')) return; await NotesAPI.remove(id); setNotes(n=>n.filter(x=>x._id!==id)) }
  async function downloadNote(id) { try { const { blob, filename } = await NotesAPI.downloadBlob(id); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); } catch (e) { alert(e.message || 'Download failed') } }
  return (
    <div className="container">
      <Header />
      <section className="notes">
        <h2>Notes</h2>
        <ul>
          {notes.map(n => (
            <li key={n._id} className="note">
              <div>
                <strong>{n.title}</strong>
                <div className="meta">{n.description}</div>
                <div className="meta">Uploaded by {n.uploader?.name || 'Unknown'}</div>
              </div>
              <div className="actions">
                <button onClick={() => downloadNote(n._id)}>Download</button>
                {isAdmin && (<button onClick={() => removeNote(n._id)} className="danger">Delete</button>)}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
