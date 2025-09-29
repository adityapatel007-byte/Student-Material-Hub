import { useEffect, useState } from 'react'
import Header from '../components/Header'
import { NotesAPI, SubjectsAPI } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [notes, setNotes] = useState([])
  const [subjects, setSubjects] = useState([])
  const [upload, setUpload] = useState({ title: '', description: '', subject: 'General', file: null })
  const [previewNote, setPreviewNote] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  
  useEffect(() => { 
    NotesAPI.list().then(d => setNotes(d.notes || []))
    loadSubjects()
  }, [])
  
  async function loadSubjects() {
    try {
      const data = await SubjectsAPI.list()
      setSubjects(data.subjects || [])
    } catch (e) {
      console.error('Failed to load subjects:', e)
    }
  }
  
  function onUploadChange(e) { const { name, value, files } = e.target; if (name==='file') setUpload(p=>({...p, file: files?.[0]||null})); else setUpload(p=>({...p, [name]: value})) }
  async function submitUpload(e) { e.preventDefault(); if(!upload.file) return alert('Select a file'); const d = await NotesAPI.upload(upload); setNotes(n=>[d.note,...n]); setUpload({ title:'', description:'', subject: 'General', file:null }) }
  async function removeNote(id) { if(!confirm('Delete this note?')) return; await NotesAPI.remove(id); setNotes(n=>n.filter(x=>x._id!==id)) }
  async function removeStudentNote(id) { if(!confirm('Delete this note?')) return; await NotesAPI.removeStudent(id); setNotes(n=>n.filter(x=>x._id!==id)) }
  async function downloadNote(id) { try { const { blob, filename } = await NotesAPI.downloadBlob(id); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); } catch (e) { alert(e.message || 'Download failed') } }
  
  async function previewFile(note) {
    try {
      const { blob } = await NotesAPI.downloadBlob(note._id)
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
      setPreviewNote(note)
    } catch (e) {
      alert(e.message || 'Preview failed')
    }
  }
  
  function closePreview() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl('')
    }
    setPreviewNote(null)
  }
  
  function getFileIcon(mimeType) {
    if (mimeType.startsWith('image/')) return '🖼️'
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊'
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📋'
    if (mimeType.startsWith('text/')) return '📃'
    if (mimeType.includes('video/')) return '🎥'
    if (mimeType.includes('audio/')) return '🎵'
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return '📦'
    if (mimeType.includes('json') || mimeType.includes('xml')) return '�'
    return '📁'
  }
  
  function canPreview(mimeType) {
    return mimeType.startsWith('image/') || 
           mimeType.includes('pdf') || 
           mimeType.startsWith('text/') ||
           mimeType.startsWith('video/') ||
           mimeType.startsWith('audio/') ||
           mimeType.includes('json') ||
           mimeType.includes('xml')
  }
  return (
    <div className="container">
      <Header />
      <section className="upload">
        <h2>Upload Note</h2>
        <form onSubmit={submitUpload} className="form">
          <input name="title" placeholder="Title" value={upload.title} onChange={onUploadChange} />
          <input name="description" placeholder="Description" value={upload.description} onChange={onUploadChange} />
          <select name="subject" value={upload.subject} onChange={onUploadChange}>
            <option value="General">General</option>
            {subjects.map(subject => (
              <option key={subject._id} value={subject.name}>{subject.name}</option>
            ))}
          </select>
          <input type="file" name="file" onChange={onUploadChange} />
          <button type="submit">Upload</button>
        </form>
      </section>
      <section className="notes">
        <h2>Notes</h2>
        <ul>
          {notes.map(n => (
            <li key={n._id} className="note">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{getFileIcon(n.mimeType)}</span>
                  <strong>{n.title}</strong>
                </div>
                <div className="meta">{n.description}</div>
                <div className="meta">📚 Subject: {n.subject || 'General'}</div>
                <div className="meta">Uploaded by {n.uploader?.name || 'Unknown'}</div>
              </div>
              <div className="actions">
                {canPreview(n.mimeType) && (
                  <button onClick={() => previewFile(n)} style={{ background: 'var(--color-steel)', color: 'white' }}>
                    Preview
                  </button>
                )}
                <button onClick={() => downloadNote(n._id)}>Download</button>
                {isAdmin && (<button onClick={() => removeNote(n._id)} className="danger">Delete</button>)}
                {!isAdmin && n.uploader?._id === user?._id && (<button onClick={() => removeStudentNote(n._id)} className="danger">Delete</button>)}
              </div>
            </li>
          ))}
        </ul>
      </section>
      
      {/* Preview Modal */}
      {previewNote && (
        <div className="modal-overlay" onClick={closePreview}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{previewNote.title}</h3>
              <button onClick={closePreview} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              {previewNote.mimeType.startsWith('image/') && (
                <img src={previewUrl} alt={previewNote.title} style={{ maxWidth: '100%', maxHeight: '70vh' }} />
              )}
              {previewNote.mimeType.includes('pdf') && (
                <iframe src={previewUrl} style={{ width: '100%', height: '70vh', border: 'none' }} />
              )}
              {previewNote.mimeType.startsWith('text/') && (
                <iframe src={previewUrl} style={{ width: '100%', height: '70vh', border: '1px solid #ccc' }} />
              )}
              {previewNote.mimeType.startsWith('video/') && (
                <video controls style={{ maxWidth: '100%', maxHeight: '70vh' }}>
                  <source src={previewUrl} type={previewNote.mimeType} />
                  Your browser does not support the video tag.
                </video>
              )}
              {previewNote.mimeType.startsWith('audio/') && (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <audio controls style={{ width: '100%' }}>
                    <source src={previewUrl} type={previewNote.mimeType} />
                    Your browser does not support the audio tag.
                  </audio>
                </div>
              )}
              {(previewNote.mimeType.includes('json') || previewNote.mimeType.includes('xml')) && (
                <iframe src={previewUrl} style={{ width: '100%', height: '70vh', border: '1px solid #ccc' }} />
              )}
              {!canPreview(previewNote.mimeType) && (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p>Preview not available for this file type.</p>
                  <button onClick={() => downloadNote(previewNote._id)}>Download to view</button>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => downloadNote(previewNote._id)}>Download</button>
              <button onClick={closePreview}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


