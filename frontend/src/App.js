import React, { useState } from 'react';
import './App.css';
import Dashboard from './Dashboard';

function App() {
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showForms, setShowForms] = useState(true);
  const [activeTab, setActiveTab] = useState('login');
  const [tabAnim, setTabAnim] = useState(false);

  const API = 'http://localhost:5000/api';

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
      });
      const data = await res.json();
      alert(data.message || JSON.stringify(data));

      // Attempt to auto-login after successful registration
      if (res.ok) {
        const loginRes = await fetch(`${API}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: regEmail, password: regPassword }),
        });
        const loginData = await loginRes.json();
        if (loginData.token) {
          setToken(loginData.token);
          setUser(loginData.user || null);
          setIsAuthenticated(true);
        }
      }
    } catch (err) {
      console.error(err);
      alert('Registration failed');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        setUser(data.user || null);
        setIsAuthenticated(true);
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      alert('Login failed');
    }
  };

  

  return (
    <div className="App">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-top">
          <div className="navbar-logo">Car2Go.</div>
          <div className="navbar-links">
            <a href="#home">Home</a>
            <a href="#cars">Cars</a>
            <a href="#reviews">Reviews</a>
            <a href="#about">About</a>
          </div>
          <div className="navbar-right">
            <button className="navbar-icon search-icon">🔍</button>
            <button className="navbar-icon user-icon">👤</button>
          </div>
        </div>
      </nav>

      {!isAuthenticated ? (
        <div className="layout">
          <div className="hero">
            <div className="hero-inner">
              <img className="hero-car" src="/gtr.png" alt="car" />

              <div className="hero-search">
                <form onSubmit={(e)=>{e.preventDefault(); alert('Search');}} className="search-form">
                  <input type="text" placeholder="Location" required />
                  <input type="date" placeholder="Start" required />
                  <input type="date" placeholder="Return" required />
                  <button className="search-btn" type="submit">🔍</button>
                </form>
              </div>
            </div>
          </div>

          <div className={`modal-overlay ${showForms ? 'visible' : 'hidden'}`}>
            <div className={`modal-content ${tabAnim ? 'tab-anim' : ''}`}>
              <button className="modal-close" onClick={() => setShowForms(false)}>✕</button>
              
              <div className="modal-tabs">
                <button
                  className={`modal-tab ${activeTab === 'login' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('login');
                    setTabAnim(true);
                    setTimeout(() => setTabAnim(false), 360);
                  }}
                >
                  Login
                </button>
                <button
                  className={`modal-tab ${activeTab === 'register' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('register');
                    setTabAnim(true);
                    setTimeout(() => setTabAnim(false), 360);
                  }}
                >
                  Register
                </button>
              </div>

              {/* Login Form */}
              {activeTab === 'login' && (
                <div className="modal-form login-form">
                  <h2>Login</h2>
                  <form onSubmit={handleLogin}>
                    <input
                      type="email"
                      placeholder="Email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                    <button type="submit">Login</button>
                  </form>
                  <div className="forgot-password">
                    <button type="button" className="link">Forgotten password?</button>
                  </div>
                </div>
              )}

              {/* Register Form */}
              {activeTab === 'register' && (
                <div className="modal-form register-form">
                  <h2>Register</h2>
                  <form onSubmit={handleRegister}>
                    <input
                      type="text"
                      placeholder="Name"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                    />
                    <button type="submit" className="secondary">Register</button>
                  </form>
                </div>
              )}
            </div>
          </div>

          <button className="modal-trigger" onClick={() => setShowForms(true)}>
            Sign In
          </button>
        </div>
      ) : (
  <Dashboard apiBase={API} token={token} user={user} onLogout={() => { setToken(''); setUser(null); setIsAuthenticated(false); }} />
      )}
    </div>
  );
}

export default App;