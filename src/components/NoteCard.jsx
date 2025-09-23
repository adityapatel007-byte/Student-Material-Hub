import React from 'react';
import './NoteCard.css';

const NoteCard = ({ note, user, onDelete }) => {
  return (
    <div className="note-card">
      <h3>{note.title}</h3>
      <p>Uploaded by: {note.uploader}</p>
      <div className="tags">
        {note.tags.map((tag, index) => (
          <span key={index} className="tag">
            {tag}
          </span>
        ))}
      </div>
      <a href={note.downloadUrl} className="download-btn" download>
        Download
      </a>
      {user && user.role === 'admin' && (
        <button onClick={() => onDelete(note._id)} className="delete-btn">
          Delete
        </button>
      )}
    </div>
  );
};

export default NoteCard;