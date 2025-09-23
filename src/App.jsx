import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import NotesPage from './pages/NotesPage';
import QAPage from './pages/QAPage';
import AuthPage from './pages/AuthPage';
import './App.css';

function App() {
  const [user, setUser] = useState(null); // State for the logged-in user

  return (
    <Router>
      <div className="app-container">
        <Header user={user} setUser={setUser} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage setUser={setUser} />} />
            {user && (
              <>
                <Route path="/dashboard" element={<DashboardPage user={user} />} />
                <Route path="/upload" element={<UploadPage user={user} />} />
                <Route path="/notes" element={<NotesPage user={user} />} />
                <Route path="/qa" element={<QAPage user={user} />} />
              </>
            )}
            <Route path="*" element={<h1>404 Not Found</h1>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;