import React, { useState } from 'react';
import './UploadPage.css';

const UploadPage = ({ user }) => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [tags, setTags] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);
    formData.append('tags', tags);
    formData.append('uploaderId', user._id);

    try {
      // This is where you connect to the backend
      const response = await fetch('YOUR_BACKEND_API/api/notes/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('File uploaded successfully!');
        setTitle('');
        setFile(null);
        setTags('');
      } else {
        alert('Upload failed.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="upload-page">
      <h2>Upload Your Notes</h2>
      <form onSubmit={handleUpload} className="upload-form">
        <label>
          Title:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <label>
          File:
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </label>
        <label>
          Tags (comma-separated):
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </label>
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default UploadPage;