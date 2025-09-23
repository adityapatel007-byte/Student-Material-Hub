import React, { useState, useEffect } from 'react';
import NoteCard from '../components/NoteCard';
import './NotesPage.css';

const NotesPage = ({ user }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch('YOUR_BACKEND_API/api/notes');
        if (!response.ok) {
          throw new Error('Failed to fetch notes.');
        }
        const data = await response.json();
        setNotes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  const handleDeleteNote = async (noteId) => {
    if (user.role !== 'admin') {
      alert('You do not have permission to delete this note.');
      return;
    }

    try {
      const response = await fetch(`YOUR_BACKEND_API/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`, // Assuming token-based auth
        },
      });

      if (response.ok) {
        // Filter out the deleted note from the state
        setNotes(notes.filter((note) => note._id !== noteId));
      } else {
        alert('Failed to delete note.');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('An error occurred. Please try again.');
    }
  };

  if (loading) return <div className="loading-message">Loading notes...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="notes-page">
      <h2>All Notes</h2>
      <div className="notes-grid">
        {notes.length > 0 ? (
          notes.map((note) => (
            <NoteCard key={note._id} note={note} user={user} onDelete={handleDeleteNote} />
          ))
        ) : (
          <p>No notes available yet. Be the first to upload one!</p>
        )}
      </div>
    </div>
  );
};

export default NotesPage;