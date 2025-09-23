import React from 'react';
import './HomePage.css'; // You'll create this file for styling

const HomePage = () => {
  return (
    <div className="homepage-container">
      <header className="homepage-header">
        <h1>Welcome to the Student Material Hub! 👋</h1>
        <p>Your one-stop destination for sharing and accessing academic notes and materials.</p>
      </header>
      
      <section className="homepage-features">
        <h2>What You Can Do Here:</h2>
        <ul>
          <li><strong>Upload and Share:</strong> Easily upload your study notes and materials for others to use.</li>
          <li><strong>Download Resources:</strong> Access a wide range of notes uploaded by fellow students.</li>
          <li><strong>Tag and Search:</strong> Organize notes with tags for quick and easy searching.</li>
          <li><strong>Q&A Section:</strong> Ask and answer questions related to your studies.</li>
        </ul>
      </section>

      <section className="homepage-cta">
        <p>Ready to get started? Log in or sign up to join our community!</p>
        <div className="homepage-buttons">
          {/* These buttons will navigate to the authentication page */}
          <a href="/auth" className="btn btn-primary">Login / Signup</a>
          <a href="/notes" className="btn btn-secondary">Browse All Notes</a>
        </div>
      </section>
    </div>
  );
};

export default HomePage;