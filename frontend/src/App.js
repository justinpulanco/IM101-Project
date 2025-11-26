import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './Dashboard';
import AdminDashboard from './AdminDashboard';

function App() {
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminToken, setAdminToken] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showForms, setShowForms] = useState(true);
  const [activeTab, setActiveTab] = useState('login');
  const [tabAnim, setTabAnim] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const API = 'http://localhost:5000/api';

  // restore auth from localStorage
  useEffect(() => {
    try {
      const tokenSaved = localStorage.getItem('token');
      const userSaved = localStorage.getItem('user');
      const adminTokenSaved = localStorage.getItem('adminToken');
      if (tokenSaved) {
        setToken(tokenSaved);
        setIsAuthenticated(true);
      }
      if (userSaved) {
        setUser(JSON.parse(userSaved));
      }
      if (adminTokenSaved) {
        setAdminToken(adminTokenSaved);
        setIsAdminMode(true);
      }
    } catch (err) {
      console.warn('restore auth', err);
    }
  }, []);

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
          localStorage.setItem('token', loginData.token);
          if (loginData.user) localStorage.setItem('user', JSON.stringify(loginData.user));
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
        localStorage.setItem('token', data.token);
        if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      alert('Login failed');
    }
  };

  // logout helper
  const handleLogout = () => {
    setToken('');
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // search cars (simple fetch all then client filter)
  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/cars`);
      const data = await res.json();
      // naive filter by location text (case-insensitive) if provided
      const form = e.target;
      const loc = form.querySelector('input[type=text]')?.value?.toLowerCase() || '';
      let items = Array.isArray(data) ? data : [];
      if (loc) {
        items = items.filter((c) => (c.location || '').toLowerCase().includes(loc) || (c.model || '').toLowerCase().includes(loc));
      }
      setSearchResults(items);
      // scroll to featured results
      setTimeout(() => {
        const el = document.querySelector('.featured-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    } catch (err) {
      console.error('search', err);
      alert('Search failed');
    }
  };

  // admin login handler
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      const data = await res.json();
      if (data.token) {
        setAdminToken(data.token);
        setIsAdminMode(true);
        localStorage.setItem('adminToken', data.token);
        setAdminEmail('');
        setAdminPassword('');
      } else {
        alert(data.message || 'Admin login failed');
      }
    } catch (err) {
      console.error(err);
      alert('Admin login failed');
    }
  };

  const handleAdminLogout = () => {
    setAdminToken('');
    setIsAdminMode(false);
    localStorage.removeItem('adminToken');
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
            <button className="navbar-icon user-icon" onClick={() => setShowForms(true)}>👤</button>
            <button className="navbar-icon admin-icon" onClick={() => setIsAdminMode(!isAdminMode)} title="Admin Login">⚙️</button>
          </div>
        </div>
      </nav>

      {isAdminMode && !adminToken ? (
        // Admin Login Screen
        <div className="admin-login-screen">
          <div className="admin-login-container">
            <h1>🔐 Admin Login</h1>
            <form onSubmit={handleAdminLogin}>
              <input
                type="email"
                placeholder="Email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
              />
              <button type="submit" className="admin-login-btn">Login as Admin</button>
            </form>
            <button onClick={() => setIsAdminMode(false)} className="cancel-admin">Back to Customer</button>
          </div>
        </div>
      ) : isAdminMode && adminToken ? (
        // Admin Dashboard
        <AdminDashboard apiBase={API} token={adminToken} onLogout={handleAdminLogout} />
      ) : !isAuthenticated ? (
        <div className="layout">
          <div className="hero">
            <div className="hero-inner">
              <img className="hero-car" src="/gtr.png" alt="car" />

              <div className="hero-search">
                <form onSubmit={handleSearch} className="search-form">
                  <input type="text" placeholder="Location" />
                  <input type="date" placeholder="Start" />
                  <input type="date" placeholder="Return" />
                  <button className="search-btn" type="submit">🔍</button>
                </form>
              </div>
            </div>
          </div>

          <div className="featured-section">
            <h3>Search Results</h3>
            {searchResults.length === 0 ? (
              <p className="muted">No results yet. Try a location and click search.</p>
            ) : (
              <div className="cards-grid">
                {searchResults.map((car) => (
                  <div key={car.id || car._id} className="car-card">
                    <img src={car.image || '/gtr.png'} alt={car.model || 'car'} />
                    <div className="card-body">
                      <h4>{car.make ? `${car.make} ${car.model || ''}` : car.model}</h4>
                      <p className="price">${car.price_per_day || car.price || '—'} / day</p>
                      <p className="location">{car.location || 'Unknown'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
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