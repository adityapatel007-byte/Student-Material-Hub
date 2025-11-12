import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { QuestionsAPI, SubjectsAPI } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function QAPage() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [questions, setQuestions] = useState([])
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAskForm, setShowAskForm] = useState(false)
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '', subject: 'General' })
  const [expandedQuestion, setExpandedQuestion] = useState(null)
  const [answerContent, setAnswerContent] = useState({})

  useEffect(() => {
    loadQuestions()
    loadSubjects()
  }, [])

  useEffect(() => {
    loadQuestions()
  }, [selectedSubject, searchTerm])

  async function loadQuestions() {
    try {
      const params = {}
      if (selectedSubject !== 'all') params.subject = selectedSubject
      if (searchTerm.trim()) params.search = searchTerm.trim()
      const data = await QuestionsAPI.list(params)
      setQuestions(data.questions || [])
    } catch (e) {
      console.error('Failed to load questions:', e)
    }
  }

  async function loadSubjects() {
    try {
      const data = await SubjectsAPI.list()
      setSubjects(data.subjects || [])
    } catch (e) {
      console.error('Failed to load subjects:', e)
    }
  }

  async function askQuestion(e) {
    e.preventDefault()
    if (!newQuestion.title.trim() || !newQuestion.content.trim()) {
      alert('Please fill in all fields')
      return
    }
    try {
      await QuestionsAPI.create(newQuestion)
      setNewQuestion({ title: '', content: '', subject: 'General' })
      setShowAskForm(false)
      loadQuestions()
    } catch (e) {
      alert(e.message || 'Failed to post question')
    }
  }

  async function postAnswer(questionId) {
    const content = answerContent[questionId]
    if (!content?.trim()) {
      alert('Please enter an answer')
      return
    }
    try {
      await QuestionsAPI.addAnswer(questionId, content)
      setAnswerContent({ ...answerContent, [questionId]: '' })
      loadQuestions()
    } catch (e) {
      alert(e.message || 'Failed to post answer')
    }
  }

  async function toggleResolved(questionId) {
    try {
      await QuestionsAPI.resolve(questionId)
      loadQuestions()
    } catch (e) {
      alert(e.message || 'Failed to update question')
    }
  }

  async function deleteQuestion(id) {
    if (!confirm('Delete this question?')) return
    try {
      await QuestionsAPI.remove(id)
      loadQuestions()
    } catch (e) {
      alert(e.message || 'Failed to delete question')
    }
  }

  async function deleteAnswer(questionId, answerId) {
    if (!confirm('Delete this answer?')) return
    try {
      await QuestionsAPI.removeAnswer(questionId, answerId)
      loadQuestions()
    } catch (e) {
      alert(e.message || 'Failed to delete answer')
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="container">
      <Header />
      
      <section className="qa-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>💬 Q&A Forum</h2>
          <button onClick={() => setShowAskForm(!showAskForm)}>
            {showAskForm ? 'Cancel' : 'Ask Question'}
          </button>
        </div>

        {/* Ask Question Form */}
        {showAskForm && (
          <div className="qa-form">
            <h3>Ask a Question</h3>
            <form onSubmit={askQuestion} className="form">
              <input
                type="text"
                placeholder="Question Title"
                value={newQuestion.title}
                onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Describe your question in detail..."
                value={newQuestion.content}
                onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
                rows="5"
                required
              />
              <select
                value={newQuestion.subject}
                onChange={(e) => setNewQuestion({ ...newQuestion, subject: e.target.value })}
              >
                <option value="General">General</option>
                {subjects.map(subject => (
                  <option key={subject._id} value={subject.name}>{subject.name}</option>
                ))}
              </select>
              <button type="submit">Post Question</button>
            </form>
          </div>
        )}

        {/* Search and Filter */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--color-border)', minWidth: '200px', background: 'rgba(255, 255, 255, 0.8)', flex: 1 }}
          />
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'rgba(255, 255, 255, 0.8)' }}
          >
            <option value="all">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject._id} value={subject.name}>{subject.name}</option>
            ))}
          </select>
        </div>

        {/* Questions List */}
        <div className="questions-list">
          {questions.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--color-text-light)', padding: '40px' }}>
              No questions yet. Be the first to ask!
            </p>
          ) : (
            questions.map(q => (
              <div key={q._id} className="question-card">
                <div className="question-header">
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <h3 style={{ margin: 0, color: 'var(--color-text-dark)' }}>{q.title}</h3>
                      {q.resolved && <span className="resolved-badge">✓ Resolved</span>}
                    </div>
                    <div className="meta">
                      📚 {q.subject} • Asked by {q.author?.name} • {formatDate(q.createdAt)} • {q.answers.length} answers
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {q.author?._id === user?._id && (
                      <button
                        onClick={() => toggleResolved(q._id)}
                        style={{ background: q.resolved ? 'var(--color-buttons)' : '#6c757d', fontSize: '12px', padding: '6px 10px' }}
                      >
                        {q.resolved ? 'Reopen' : 'Mark Resolved'}
                      </button>
                    )}
                    {(q.author?._id === user?._id || user?.role === 'admin') && (
                      <button onClick={() => deleteQuestion(q._id)} className="danger" style={{ fontSize: '12px', padding: '6px 10px' }}>
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                <p style={{ marginTop: '12px', color: 'var(--color-text-dark)', whiteSpace: 'pre-wrap' }}>{q.content}</p>

                <div style={{ marginTop: '15px' }}>
                  <button
                    onClick={() => setExpandedQuestion(expandedQuestion === q._id ? null : q._id)}
                    style={{ background: 'transparent', color: 'var(--color-buttons)', border: 'none', padding: '5px 0', boxShadow: 'none' }}
                  >
                    {expandedQuestion === q._id ? '▼ Hide Answers' : `▶ Show ${q.answers.length} Answers`}
                  </button>
                </div>

                {/* Answers Section */}
                {expandedQuestion === q._id && (
                  <div className="answers-section">
                    {/* Answer Form */}
                    <div className="answer-form">
                      <textarea
                        placeholder="Write your answer..."
                        value={answerContent[q._id] || ''}
                        onChange={(e) => setAnswerContent({ ...answerContent, [q._id]: e.target.value })}
                        rows="3"
                      />
                      <button onClick={() => postAnswer(q._id)} style={{ marginTop: '8px' }}>
                        Post Answer
                      </button>
                    </div>

                    {/* Answers List */}
                    {q.answers.map(answer => (
                      <div key={answer._id} className="answer-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div style={{ flex: 1 }}>
                            <div className="meta" style={{ marginBottom: '8px' }}>
                              <strong>{answer.author?.name}</strong> • {formatDate(answer.createdAt)}
                            </div>
                            <p style={{ margin: 0, color: 'var(--color-text-dark)', whiteSpace: 'pre-wrap' }}>{answer.content}</p>
                          </div>
                          {(answer.author?._id === user?._id || user?.role === 'admin') && (
                            <button
                              onClick={() => deleteAnswer(q._id, answer._id)}
                              className="danger"
                              style={{ fontSize: '12px', padding: '4px 8px' }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
