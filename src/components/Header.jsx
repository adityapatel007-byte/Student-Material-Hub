import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = ({ user, setUser }) => {
  const handleLogout = () => {
    setUser(null);
    // You would also call an API to log out on the backend here.
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">Study Hub</Link>
      </div>
      <nav className="nav-links">
        <Link to="/notes">Notes</Link>
        <Link to="/qa">Q&A</Link>
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </>
        ) : (
          <Link to="/auth">Login / Signup</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;