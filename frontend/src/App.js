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
      {!isAuthenticated ? (
        <div className="layout">
          <div className="hero">
            <div className="hero-banner">
              <div className="hero-text">
                <h1>Car2Go-U-Drive Car Rental Services</h1>
                <p>Quick booking. Clean cars. Easy pick-up.</p>
              </div>

              <form className="hero-form" onSubmit={(e)=>{e.preventDefault(); alert('Quote requested')}}>
                <div className="hero-row">
                  <input type="text" placeholder="Pick-up Location" required />
                  <input type="date" placeholder="Pick-up Date" required />
                  <input type="date" placeholder="Return Date" required />
                </div>
                <div className="hero-row small">
                  <input type="time" placeholder="Pick-up Time" />
                  <input type="time" placeholder="Return Time" />
                  <button className="cta">Get a Quote</button>
                </div>
              </form>
            </div>
          </div>

          <div className="login-container">
            {/* Login Form */}
            <div className="login-form">
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

            {/* Register Form */}
            <div className="register-form">
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
          </div>
        </div>
      ) : (
  <Dashboard apiBase={API} token={token} user={user} onLogout={() => { setToken(''); setUser(null); setIsAuthenticated(false); }} />
      )}
    </div>
  );
}

export default App;