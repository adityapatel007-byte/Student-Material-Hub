import React, { useState } from 'react';
import './AuthPage.css';

const AuthPage = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Only for signup

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? 'YOUR_BACKEND_API/api/auth/login' : 'YOUR_BACKEND_API/api/auth/signup';
    const body = isLogin ? { email, password } : { name, email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        // Assuming your backend returns a user object and token
        setUser(data.user);
        // You might store the token in localStorage here: localStorage.setItem('token', data.token);
        alert(isLogin ? 'Login successful!' : 'Signup successful!');
        // Redirect or update UI
      } else {
        const errorData = await response.json();
        alert(errorData.message || (isLogin ? 'Login failed.' : 'Signup failed.'));
      }
    } catch (error) {
      console.error('Authentication error:', error);
      alert('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
      <form onSubmit={handleAuth} className="auth-form">
        {!isLogin && (
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={!isLogin}
            />
          </div>
        )}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="auth-btn">
          {isLogin ? 'Login' : 'Sign Up'}
        </button>
      </form>
      <div className="auth-toggle">
        <p>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span onClick={() => setIsLogin(!isLogin)} className="toggle-link">
            {isLogin ? ' Sign Up' : ' Login'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;