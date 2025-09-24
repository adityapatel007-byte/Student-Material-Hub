import { useState } from 'react'
import Header from '../components/Header'
import { NotesAPI } from '../lib/api'

export default function UploadPage() {
  const [upload, setUpload] = useState({ title: '', description: '', file: null })
  function onUploadChange(e) { const { name, value, files } = e.target; if (name==='file') setUpload(p=>({...p, file: files?.[0]||null})); else setUpload(p=>({...p, [name]: value})) }
  async function submitUpload(e) { e.preventDefault(); if(!upload.file) return alert('Select a file'); await NotesAPI.upload(upload); setUpload({ title:'', description:'', file:null }); alert('Uploaded!') }
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
    </div>
  )
}
