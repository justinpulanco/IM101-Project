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
  const [showPublicDashboard, setShowPublicDashboard] = useState(false);
  // Booking modal state
  const [showBooking, setShowBooking] = useState(false);
  const [bookingCarId, setBookingCarId] = useState('');
  const [carsList, setCarsList] = useState([]);
  const [bookingStart, setBookingStart] = useState('');
  const [bookingEnd, setBookingEnd] = useState('');
  const [bookingTotal, setBookingTotal] = useState('');

  // currency formatter for PHP
  const currency = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 });

  // recompute total price when car or dates change
  useEffect(() => {
    if (!bookingCarId || !bookingStart || !bookingEnd) {
      setBookingTotal('');
      return;
    }
    const sd = new Date(bookingStart);
    const ed = new Date(bookingEnd);
    const diff = Math.ceil((ed - sd) / (1000 * 60 * 60 * 24));
    const days = diff > 0 ? diff : 0;
    const car = carsList.find((x) => String(x.id) === String(bookingCarId) || String(x._id) === String(bookingCarId));
    const rate = car ? (car.price_per_day || car.price || 50) : 50;
    setBookingTotal(days * rate);
  }, [bookingCarId, bookingStart, bookingEnd, carsList]);

  // fetch cars for booking modal
  const loadCarsForBooking = async () => {
    try {
      const res = await fetch(`${API}/cars`);
      const data = await res.json();
      setCarsList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('loadCarsForBooking', err);
      setCarsList([]);
    }
  };

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
    setShowPublicDashboard(false);
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
      <nav className={`navbar ${isAuthenticated ? 'navbar-auth' : ''}`}>
        <div className="navbar-top">
          <div className="navbar-logo">Car2Go.</div>
          {!isAuthenticated && (
            <div className={`navbar-links ${isAuthenticated ? 'is-hidden' : ''}`}>
              <a
                href="#home"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('login');
                  setShowForms(true);
                }}
              >
                Home
              </a>
              <a href="#cars">Cars</a>
              <a href="#reviews">Reviews</a>
              <a href="#about">About</a>
            </div>
          )}

          <div className="navbar-right">
            <button className="navbar-icon search-icon">🔍</button>
            {isAuthenticated && !isAdminMode && (
              <button
                className="navbar-signin"
                onClick={async () => {
                  await loadCarsForBooking();
                  setShowBooking(true);
                }}
              >
                Book a Car
              </button>
            )}

            <div className={`navbar-icons ${isAuthenticated ? 'is-hidden' : ''}`}>
              <button className="navbar-icon user-icon" onClick={() => setShowForms(true)}>👤</button>
              <button className="navbar-icon admin-icon" onClick={() => setIsAdminMode(!isAdminMode)} title="Admin Login">⚙️</button>
            </div>

            {isAuthenticated && (
              <button className="navbar-logout icon-pill" onClick={handleLogout} aria-label="Logout" title="Logout">🚪</button>
            )}
          </div>
        </div>
      </nav>

      {/* Main content branches */}
      {isAdminMode && !adminToken ? (
        <div className="admin-login-screen">
          <div className="admin-login-container">
            <h1>🔐 Admin Login</h1>
            <form onSubmit={handleAdminLogin}>
              <input type="email" placeholder="Email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required />
              <input type="password" placeholder="Password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} required />
              <button type="submit" className="admin-login-btn">Login as Admin</button>
            </form>
            <button onClick={() => setIsAdminMode(false)} className="cancel-admin">Back to Customer</button>
          </div>
        </div>
      ) : isAdminMode && adminToken ? (
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
              <div className="hero-welcome">
                <h1>Welcome Back!</h1>
                <p>Sign in to access your account and book amazing vehicles for your next adventure with Car2Go U-Drive.</p>
                <div className="welcome-login-form">
                  <button type="button" className="welcome-btn" onClick={() => setShowForms(true)}>Sign In</button>
                </div>
              </div>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="featured-section">
              <h3>Search Results</h3>
              <div className="cards-grid">
                {searchResults.map((car) => (
                  <div key={car.id || car._id} className="car-card">
                    <img src={car.image || '/gtr.png'} alt={car.model || 'car'} />
                    <div className="card-body">
                      <h4>{car.make ? `${car.make} ${car.model || ''}` : car.model}</h4>
                      <p className="price">{car.price_per_day || car.price ? `${currency.format(car.price_per_day || car.price)}/day` : '—'}</p>
                      <p className="location">{car.location || 'Unknown'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showForms && (
            <div className="modal-overlay visible">
              <div className="modal-content auth-modal">
                <button className="modal-close" onClick={() => setShowForms(false)}>✕</button>
                <div className="modal-tabs">
                  <button className={`modal-tab ${activeTab === 'login' ? 'active' : ''}`} onClick={() => { setActiveTab('login'); setTabAnim(true); setTimeout(() => setTabAnim(false), 360); }}>Login</button>
                  <button className={`modal-tab ${activeTab === 'register' ? 'active' : ''}`} onClick={() => { setActiveTab('register'); setTabAnim(true); setTimeout(() => setTabAnim(false), 360); }}>Register</button>
                </div>

                {activeTab === 'login' && (
                  <div className="modal-form login-form">
                    <h2>Login</h2>
                    <form onSubmit={handleLogin}>
                      <input type="email" placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                      <input type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                      <button type="submit">Login</button>
                    </form>
                    <div className="forgot-password"><button type="button" className="link">Forgotten password?</button></div>
                  </div>
                )}

                {activeTab === 'register' && (
                  <div className="modal-form register-form">
                    <h2>Register</h2>
                    <form onSubmit={handleRegister}>
                      <input type="text" placeholder="Name" value={regName} onChange={(e) => setRegName(e.target.value)} required />
                      <input type="email" placeholder="Email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
                      <input type="password" placeholder="Password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
                      <button type="submit" className="secondary">Register</button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <Dashboard apiBase={API} token={token} user={user} onLogout={() => { setToken(''); setUser(null); setIsAuthenticated(false); }} />
          
          {/* Booking Modal - only appears in Dashboard context */}
          {showBooking && (
            <div className="modal-overlay visible">
              <div className="modal-content booking-content">
                <button className="modal-close" onClick={() => setShowBooking(false)}>✕</button>
                <h2>Book a Car</h2>
                <form className="booking-form" onSubmit={async (e) => {
                  e.preventDefault();
                  if (!isAuthenticated) {
                    setShowBooking(false);
                    setActiveTab('login');
                    setShowForms(true);
                    return;
                  }
                  const carId = bookingCarId;
                  const car = carsList.find((c) => String(c.id) === String(carId) || String(c._id) === String(carId));
                  const available = car ? (car.available ?? car.is_available ?? true) : true;
                  if (!available) { alert('Selected car is not available for booking'); return; }
                  try {
                    const body = { car_id: carId, start_date: bookingStart, end_date: bookingEnd, total_price: bookingTotal || null };
                    const res = await fetch(`${API}/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
                    const data = await res.json();
                    if (res.ok) { alert(data.message || 'Booking successful'); setShowBooking(false); setBookingCarId(''); setBookingStart(''); setBookingEnd(''); setBookingTotal(''); } else { alert(data.message || 'Booking failed'); }
                  } catch (err) { console.error('booking', err); alert('Booking failed'); }
                }}>
                  <label style={{fontSize:13, color:'#333', marginBottom:6}}>Select Car</label>
                  <select value={bookingCarId} onChange={(e) => setBookingCarId(e.target.value)} required>
                    <option value="">-- pick a car --</option>
                    {carsList.map((c) => (<option key={c.id || c._id} value={c.id || c._id}>{c.make ? `${c.make} ${c.model || ''}` : c.model || c.name || `Car ${c.id || c._id}`}</option>))}
                  </select>

                  <div style={{display:'flex',gap:8,marginTop:10}}>
                    <div style={{flex:1}}>
                      <label style={{fontSize:13, color:'#333'}}>Start</label>
                      <input type="date" value={bookingStart} onChange={(e) => setBookingStart(e.target.value)} required />
                    </div>
                    <div style={{flex:1}}>
                      <label style={{fontSize:13, color:'#333'}}>End</label>
                      <input type="date" value={bookingEnd} onChange={(e) => setBookingEnd(e.target.value)} required />
                    </div>
                  </div>

                  <label style={{fontSize:13, color:'#333', marginTop:10}}>Per day / Availability</label>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <div style={{fontWeight:700}}>{(() => { const car = carsList.find((x) => String(x.id) === String(bookingCarId) || String(x._id) === String(bookingCarId)); if (!car) return '—'; const rate = car.price_per_day || car.price || null; return rate ? `${currency.format(rate)}/day` : '—'; })()}</div>
                    <div style={{color: (() => { const car = carsList.find((x) => String(x.id) === String(bookingCarId) || String(x._id) === String(bookingCarId)); if (!car) return '#666'; const available = car.available ?? car.is_available ?? true; return available ? 'var(--brand-green)' : '#f44336'; })()}}>{(() => { const car = carsList.find((x) => String(x.id) === String(bookingCarId) || String(x._id) === String(bookingCarId)); if (!car) return ''; const available = car.available ?? car.is_available ?? true; return available ? 'Available' : 'Unavailable'; })()}</div>
                  </div>

                  <input type="text" placeholder="Total Price" value={bookingTotal ? currency.format(bookingTotal) : ''} readOnly style={{marginTop:10}} />

                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <button type="submit" disabled={!(bookingCarId && bookingStart && bookingEnd && bookingTotal > 0)}>Book</button>
                    <button type="button" onClick={() => { setBookingCarId(''); setBookingStart(''); setBookingEnd(''); setBookingTotal(''); }}>Clear</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
