import { useEffect, useState } from 'react'
import Header from '../components/Header'
import { NotesAPI } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function UploadPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [upload, setUpload] = useState({ title: '', description: '', file: null })
  const [notes, setNotes] = useState([])
  
  useEffect(() => { NotesAPI.list().then(d => setNotes(d.notes || [])) }, [])
  
  function onUploadChange(e) { const { name, value, files } = e.target; if (name==='file') setUpload(p=>({...p, file: files?.[0]||null})); else setUpload(p=>({...p, [name]: value})) }
  async function submitUpload(e) { e.preventDefault(); if(!upload.file) return alert('Select a file'); const d = await NotesAPI.upload(upload); setNotes(n=>[d.note,...n]); setUpload({ title:'', description:'', file:null }); alert('Uploaded!') }
  async function removeNote(id) { if(!confirm('Delete this note?')) return; await NotesAPI.remove(id); setNotes(n=>n.filter(x=>x._id!==id)) }
  async function removeStudentNote(id) { if(!confirm('Delete this note?')) return; await NotesAPI.removeStudent(id); setNotes(n=>n.filter(x=>x._id!==id)) }
  async function downloadNote(id) { try { const { blob, filename } = await NotesAPI.downloadBlob(id); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); } catch (e) { alert(e.message || 'Download failed') } }
  
  return (
    <div className="container">
      <Header />
      <section className="upload">
        <h2>Upload Note</h2>
        <form onSubmit={submitUpload} className="form">
          <input name="title" placeholder="Title" value={upload.title} onChange={onUploadChange} />
          <input name="description" placeholder="Description" value={upload.description} onChange={onUploadChange} />
          <input type="file" name="file" onChange={onUploadChange} />
          <button type="submit">Upload</button>
        </form>
      </section>
      <section className="notes">
        <h2>My Uploaded Notes</h2>
        <ul>
          {notes.filter(n => n.uploader?._id === user?._id).map(n => (
            <li key={n._id} className="note">
              <div>
                <strong>{n.title}</strong>
                <div className="meta">{n.description}</div>
                <div className="meta">Uploaded by {n.uploader?.name || 'Unknown'}</div>
              </div>
              <div className="actions">
                <button onClick={() => downloadNote(n._id)}>Download</button>
                {isAdmin && (<button onClick={() => removeNote(n._id)} className="danger">Delete</button>)}
                {!isAdmin && (<button onClick={() => removeStudentNote(n._id)} className="danger">Delete</button>)}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
