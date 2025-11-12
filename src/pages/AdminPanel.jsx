import { useEffect, useState } from 'react'
import Header from '../components/Header'
import { SubjectsAPI, NotesAPI } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

export default function AdminPanel() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState([])
  const [notes, setNotes] = useState([])
  const [newSubject, setNewSubject] = useState({ name: '', description: '' })
  const [editingSubject, setEditingSubject] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({ totalNotes: 0, totalUsers: 0 })

  // Redirect if not admin
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  useEffect(() => {
    loadSubjects()
    loadStats()
  }, [])

  async function loadSubjects() {
    try {
      const data = await SubjectsAPI.list()
      setSubjects(data.subjects || [])
    } catch (e) {
      setError('Failed to load subjects')
    }
  }

  async function loadStats() {
    try {
      const notesData = await NotesAPI.list()
      setNotes(notesData.notes || [])
      setStats({
        totalNotes: notesData.notes?.length || 0,
        totalUsers: new Set(notesData.notes?.map(n => n.uploader._id)).size || 0
      })
    } catch (e) {
      console.error('Failed to load stats:', e)
    }
  }

  async function createSubject(e) {
    e.preventDefault()
    if (!newSubject.name.trim()) {
      setError('Subject name is required')
      return
    }
    
    setLoading(true)
    setError('')
    try {
      const data = await SubjectsAPI.create(newSubject)
      setSubjects([...subjects, data.subject])
      setNewSubject({ name: '', description: '' })
    } catch (e) {
      setError(e.message || 'Failed to create subject')
    }
    setLoading(false)
  }

  async function updateSubject(e) {
    e.preventDefault()
    if (!editingSubject.name.trim()) {
      setError('Subject name is required')
      return
    }
    
    setLoading(true)
    setError('')
    try {
      const data = await SubjectsAPI.update(editingSubject._id, {
        name: editingSubject.name,
        description: editingSubject.description
      })
      setSubjects(subjects.map(s => s._id === editingSubject._id ? data.subject : s))
      setEditingSubject(null)
    } catch (e) {
      setError(e.message || 'Failed to update subject')
    }
    setLoading(false)
  }

  async function deleteSubject(id) {
    if (!confirm('Are you sure you want to delete this subject? This action cannot be undone.')) return
    
    setLoading(true)
    try {
      await SubjectsAPI.remove(id)
      setSubjects(subjects.filter(s => s._id !== id))
    } catch (e) {
      setError(e.message || 'Failed to delete subject')
    }
    setLoading(false)
  }

  function getSubjectStats(subjectName) {
    return notes.filter(n => n.subject === subjectName).length
  }

  return (
    <div className="container">
      <Header />
      
      {/* Dashboard Stats */}
      <section style={{ marginBottom: '30px' }}>
        <h2>Admin Dashboard</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div className="stat-card">
            <h3>📚 Total Notes</h3>
            <p style={{ fontSize: '2em', margin: '10px 0', color: 'var(--color-navy)' }}>{stats.totalNotes}</p>
          </div>
          <div className="stat-card">
            <h3>👥 Active Users</h3>
            <p style={{ fontSize: '2em', margin: '10px 0', color: 'var(--color-navy)' }}>{stats.totalUsers}</p>
          </div>
          <div className="stat-card">
            <h3>📋 Total Subjects</h3>
            <p style={{ fontSize: '2em', margin: '10px 0', color: 'var(--color-navy)' }}>{subjects.length}</p>
          </div>
        </div>
      </section>

      {/* Subject Management */}
      <section style={{ marginBottom: '30px' }}>
        <h3>Manage Subjects</h3>
        
        {/* Create New Subject */}
        <div className="admin-form">
          <h4>{editingSubject ? 'Edit Subject' : 'Add New Subject'}</h4>
          <form onSubmit={editingSubject ? updateSubject : createSubject} className="form">
            <input
              type="text"
              placeholder="Subject Name"
              value={editingSubject ? editingSubject.name : newSubject.name}
              onChange={(e) => editingSubject 
                ? setEditingSubject({...editingSubject, name: e.target.value})
                : setNewSubject({...newSubject, name: e.target.value})
              }
              required
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={editingSubject ? editingSubject.description : newSubject.description}
              onChange={(e) => editingSubject 
                ? setEditingSubject({...editingSubject, description: e.target.value})
                : setNewSubject({...newSubject, description: e.target.value})
              }
            />
            {error && <div className="meta" style={{ color: '#e02424' }}>{error}</div>}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" disabled={loading}>
                {loading ? 'Processing...' : (editingSubject ? 'Update Subject' : 'Add Subject')}
              </button>
              {editingSubject && (
                <button type="button" onClick={() => setEditingSubject(null)}>Cancel</button>
              )}
            </div>
          </form>
        </div>

        {/* Subjects List */}
        <div className="subjects-list">
          <h4>Existing Subjects</h4>
          {subjects.length === 0 ? (
            <p>No subjects created yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {subjects.map(subject => (
                <div key={subject._id} className="subject-item">
                  <div>
                    <strong>{subject.name}</strong>
                    {subject.description && <div className="meta">{subject.description}</div>}
                    <div className="meta">
                      📊 {getSubjectStats(subject.name)} notes • 
                      Created by {subject.createdBy?.name || 'Unknown'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setEditingSubject(subject)}
                      style={{ background: 'var(--color-buttons)', color: 'white' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteSubject(subject._id)}
                      className="danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}