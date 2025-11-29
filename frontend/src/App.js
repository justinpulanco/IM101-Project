import React, { useState, useEffect, useRef } from 'react';
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
  const [showAllCars, setShowAllCars] = useState(false);
  const [allCarsDisplay, setAllCarsDisplay] = useState([]);
  // Booking modal state
  const [showBooking, setShowBooking] = useState(false);
  const [bookingCarId, setBookingCarId] = useState('');
  const [carsList, setCarsList] = useState([]);
  const [bookingStart, setBookingStart] = useState('');
  const [bookingEnd, setBookingEnd] = useState('');
  const [bookingTotal, setBookingTotal] = useState('');
  const [showBookingsPopover, setShowBookingsPopover] = useState(false);
  const [userBookings, setUserBookings] = useState([]);
  const [showCarDropdown, setShowCarDropdown] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [showNavbarSearch, setShowNavbarSearch] = useState(false);
  const navbarSearchRef = useRef(null);

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
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setCarsList(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      console.error('Error loading cars for booking:', err);
      setCarsList([]);
      alert('Failed to load cars. Please try again.');
      return [];
    }
  };

  // fetch all cars for display
  const loadAllCars = async () => {
    try {
      const res = await fetch(`${API}/cars`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setAllCarsDisplay(Array.isArray(data) ? data : []);
      setShowAllCars(true);
    } catch (err) {
      console.error('Error loading cars:', err);
      setAllCarsDisplay([]);
      alert('Failed to load cars. Please try again.');
    }
  };

  // Check car availability
  const checkAvailability = async (carId, startDate, endDate) => {
    if (!carId || !startDate || !endDate) {
      setIsAvailable(false);
      return false;
    }
    try {
      const res = await fetch(`${API}/bookings/check-availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          car_id: carId,
          start_date: startDate,
          end_date: endDate
        })
      });
      const data = await res.json();
      setIsAvailable(data.available || false);
      return data.available || false;
    } catch (err) {
      console.error('checkAvailability', err);
      setIsAvailable(false);
      return false;
    }
  };

  // Handle booking a car
  const handleBookCar = async (carId) => {
    if (!carId || !bookingStart || !bookingEnd) {
      alert('Please select a car and dates');
      return;
    }

    const isCarAvailable = await checkAvailability(carId, bookingStart, bookingEnd);
    if (!isCarAvailable) {
      alert('Sorry, this car is not available for the selected dates');
      return;
    }

    try {
      const res = await fetch(`${API}/bookings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          car_id: carId,
          start_date: bookingStart,
          end_date: bookingEnd,
          user_id: user?.id || user?._id
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Booking successful!');
        setShowCarDropdown(false);
        setSelectedCar(null);
        setBookingStart('');
        setBookingEnd('');
      } else {
        alert(data.message || 'Booking failed');
      }
    } catch (err) {
      console.error('bookCar', err);
      alert('Booking failed');
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

  // Close navbar search popover when clicking outside, and focus input when opened
  useEffect(() => {
    function handleDocClick(e) {
      if (showNavbarSearch && navbarSearchRef.current && !navbarSearchRef.current.contains(e.target)) {
        setShowNavbarSearch(false);
      }
    }
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, [showNavbarSearch]);

  useEffect(() => {
    if (showNavbarSearch && navbarSearchRef.current) {
      const input = navbarSearchRef.current.querySelector('input[type=text]');
      if (input) input.focus();
    }
  }, [showNavbarSearch]);

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

  // search cars and handle redirection
  // Add this function to map car makes and models to their image paths
  const getCarImage = (make, model) => {
    if (!make || !model) return null;
    
    let imagePath = null;
    
    // Map of car makes and models to their image filenames
    const carImageMap = {
      'chevrolet': {
        'camaro': 'public/reviews/1967 Chevrolet Camaro.png'
      },
      'dodge': {
        'charger': '/1970 Dodge Charger.png',
        'challenger': '/2008 Dodge Challenger SRT8.png'
      },
      'mazda': {
        'rx-7': '/1993 Mazda RX-7 FD.png'
      },
      'honda': {
        'civic': '/1995 Honda Civic EG.png',
        'cr-v': '/Honda CR-V.png'
      },
      'mitsubishi': {
        'eclipse': '/1995 Mitsubishi Eclipse.png'
      },
      'toyota': {
        'supra': '/1995 Toyota Supra Mk4.png',
        'vios': '/reviews/Toyota Vios.png'
      },
      'nissan': {
        'skyline': '/1999 Nissan Skyline GT-R R34.png',
        'silvia': '/2002 Nissan Silvia S15.png',
        '350z': '/2006 Nissan 350Z.png',
        'almera': '/nissan almera.png'
      },
      'ford': {
        'ranger': '/Ford Ranger.png'
      },
      'hyundai': {
        'accent': '/Hyundai Accent.png'
      }
    };
    
    // Try to find a matching image
    const makeLower = make.toLowerCase().trim();
    const modelLower = model.toLowerCase().trim();
    
    // First try exact match
    if (carImageMap[makeLower] && carImageMap[makeLower][modelLower]) {
      return carImageMap[makeLower][modelLower];
    }
    
    // If no exact match, try partial matches in the model names
  // First try to find matching make
  if (carImageMap[makeLower]) {
    // Then try to find a model that contains the search term
    const models = carImageMap[makeLower];
    for (const [modelKey, path] of Object.entries(models)) {
      if (modelLower.includes(modelKey) || modelKey.includes(modelLower)) {
        imagePath = path;
        break;
      }
    }
  }
  
  return imagePath || null;
  };

  const handleSearch = async (searchTerm = '', redirect = false) => {
    try {
      const res = await fetch(`${API}/cars`);
      const data = await res.json();
      // naive filter by location or model text (case-insensitive) if provided
      const loc = searchTerm.toLowerCase().trim();
      let items = Array.isArray(data) ? data : [];
      let filteredItems = items;
      
      if (loc) {
        filteredItems = items.filter((c) => 
          (c.location || '').toLowerCase().includes(loc) || 
          (c.model || '').toLowerCase().includes(loc) ||
          (c.make || '').toLowerCase().includes(loc)
        );
      }
      
      setSearchResults(filteredItems);
      
      // Show error message if no cars found
      if (loc && filteredItems.length === 0) {
        // Remove any existing error message
        const existingError = document.querySelector('.search-error');
        if (existingError) existingError.remove();
        
        // Create and show error message
        const errorMsg = document.createElement('div');
        errorMsg.className = 'search-error';
        errorMsg.textContent = 'No cars found. Please try a different search term.';
        errorMsg.style.color = '#e74c3c';
        errorMsg.style.marginTop = '10px';
        errorMsg.style.textAlign = 'center';
        errorMsg.style.fontSize = '14px';
        
        // Insert after the search form
        const searchForm = document.querySelector('.search-form');
        if (searchForm) {
          searchForm.insertAdjacentElement('afterend', errorMsg);
        }
        
        // Remove error message after 3 seconds
        setTimeout(() => {
          if (errorMsg.parentNode) {
            errorMsg.style.opacity = '0';
            setTimeout(() => errorMsg.remove(), 300);
          }
        }, 3000);
      } else {
        // Remove error message if there are results
        const existingError = document.querySelector('.search-error');
        if (existingError) existingError.remove();
      }
      
      // If redirect is true and there are results, scroll to the featured section
      if (redirect) {
        if (filteredItems.length > 0) {
          const featuredSection = document.querySelector('.featured-section');
          if (featuredSection) {
            featuredSection.scrollIntoView({ behavior: 'smooth' });
          }
        } else {
          // If no results and redirect is true, show all cars
          setShowAllCars(true);
          const allCarsSection = document.querySelector('.all-cars-section');
          if (allCarsSection) {
            allCarsSection.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
      
      // Always return the filtered items
      return filteredItems;
    } catch (err) {
      console.error('search', err);
      alert('Search failed');
      return [];
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
                  alert('Please log in to access this page');
                  setActiveTab('login');
                  setShowForms(true);
                }}
              >
                Home
              </a>
              <a 
                href="#reviews"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Reviews
              </a>
              <a href="#about">About</a>
            </div>
          )}

          {/* Cars link removed (functionality still available via other UI) */}

          <div className="navbar-right">
            <button
              className="navbar-icon search-icon"
              onClick={() => setShowNavbarSearch(s => !s)}
              aria-label="Open search"
              aria-expanded={showNavbarSearch}
              title="Search"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
            {isAuthenticated && !isAdminMode && (
              <>
              </>
            )}
            {isAuthenticated && !isAdminMode && (
              <button
                title="Your bookings"
                aria-label="Your bookings"
                onClick={async () => {
                  // toggle popover and load bookings when opening
                  const next = !showBookingsPopover;
                  setShowBookingsPopover(next);
                  if (next) {
                    try {
                      const uid = user?.id || user?.user_id || user?._id;
                      if (!uid) { setUserBookings([]); return; }
                      const res = await fetch(`${API}/bookings/user/${uid}`);
                      const data = await res.json();
                      setUserBookings(Array.isArray(data) ? data : []);
                    } catch (err) {
                      console.error('load user bookings', err);
                      setUserBookings([]);
                    }
                  }
                }}
                className="navbar-bookings-btn navbar-icon"
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M16 3v4M8 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}

            <div className={`navbar-icons ${isAuthenticated ? 'is-hidden' : ''}`}>
              <button className="navbar-icon user-icon" onClick={() => setShowForms(true)} aria-label="Account"> 
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M4 20c1.5-4 6-6 8-6s6.5 2 8 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button className="navbar-icon admin-icon" onClick={() => setIsAdminMode(!isAdminMode)} title="Admin Login" aria-label="Admin"> 
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 0 1 2.28 16.9l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82L4.21 2.28A2 2 0 0 1 7.04.45l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V0a2 2 0 0 1 4 0v.09c.1.7.6 1.27 1.3 1.51h.06a1.65 1.65 0 0 0 1.82-.33l.06-.06A2 2 0 0 1 21.72 7.1l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.21.36.33.78.33 1.2s-.12.84-.33 1.2v.06z" stroke="currentColor" strokeWidth="0.6" />
                </svg>
              </button>
            </div>

            {showNavbarSearch && (
              <div ref={navbarSearchRef} className="navbar-search-popover" onClick={(e) => e.stopPropagation()}>
                <form
                  className="navbar-search-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setShowNavbarSearch(false);
                    handleSearch(e);
                  }}
                >
                  <input type="text" placeholder="Location or model" />
                  <div className="navbar-search-dates">
                    <input type="date" placeholder="Start" />
                    <input type="date" placeholder="Return" />
                  </div>
                  <div className="navbar-search-actions">
                    <button type="submit" className="btn primary">Search</button>
                    <button type="button" className="btn" onClick={() => { setShowNavbarSearch(false); loadAllCars(); }}>View All Cars</button>
                  </div>
                </form>
              </div>
            )}

            {isAuthenticated && (
              <button className="navbar-logout icon-pill" onClick={handleLogout} aria-label="Logout" title="Logout">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </nav>

        {/* Bookings popover anchored to navbar (simple absolute popover) */}
        {showBookingsPopover && (
        <div className="bookings-popover">
          <div className="bookings-popover-head">
            <strong>Your Bookings</strong>
            <button className="bookings-popover-close" onClick={() => setShowBookingsPopover(false)}>✕</button>
          </div>
          {userBookings.length === 0 ? (
            <div className="bookings-empty">No bookings found.</div>
          ) : (
            userBookings.map((b) => (
              <div key={b.id} className="bookings-item">
                <div className="bookings-id">ID: {b.id}</div>
                <div className="bookings-user">{b.user || (user && (user.name || user.email))}</div>
                <div className="bookings-car">{b.car || b.model || 'Car'}</div>
                <div className="bookings-dates">{new Date(b.start_date).toISOString()} → {new Date(b.end_date).toISOString()}</div>
                <div className="bookings-price">{currency.format(b.total_price || b.total || 0)}</div>
                <div style={{marginTop:8, display:'flex', gap:8}}>
                  {(b.payment_status || b.status) === 'paid' ? (
                    <div style={{fontSize:12, color:'#777'}}>Transacted</div>
                  ) : (
                    <button className="bookings-delete-btn" onClick={async () => {
                      const msg = window.confirm('Delete this booking?');
                      if (!msg) return;
                      try {
                        const res = await fetch(`${API}/bookings/${b.id}`, { method: 'DELETE', headers: { 'Content-Type':'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
                        const data = await res.json();
                        if (res.ok) {
                          // remove locally
                          setUserBookings((prev) => prev.filter((x) => x.id !== b.id));
                          alert(data.message || 'Booking deleted');
                        } else {
                          alert(data.message || 'Delete failed');
                        }
                      } catch (err) {
                        console.error('delete booking', err);
                        alert('Delete failed');
                      }
                    }}>Delete</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

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
                <div className="search-form" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
                  <input 
                    type="text" 
                    placeholder="Find a car model" 
                    onChange={(e) => handleSearch(e.target.value)}
                    style={{ 
                      flex: 1, 
                      padding: '10px', 
                      borderRadius: '4px', 
                      border: '1px solid #ddd',
                      height: '40px',
                      fontSize: '16px',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button 
                    onClick={async (e) => {
                      e.preventDefault();
                      const input = document.querySelector('.search-form input');
                      await handleSearch(input?.value || '', true);
                    }}
                    style={{
                      background: '#e74c3c',
                      border: 'none',
                      borderRadius: '4px',
                      color: 'white',
                      padding: '0 15px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '40px',
                      width: '40px',
                      transition: 'background 0.3s',
                      outline: 'none'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#c0392b'}
                    onMouseOut={(e) => e.target.style.background = '#e74c3c'}
                    title="Search"
                    type="button"
                  >
                    <span style={{ fontSize: '18px' }}>🔍</span>
                  </button>
                </div>
              </div>
              <div className="hero-welcome">
                <h1>Welcome Back!</h1>
                <p>Sign in to access your account and book amazing vehicles for your next adventure with Car2Go U-Drive.</p>
              </div>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="featured-section">
              <h3>Our Top Rentals</h3>
              <div className="cards-grid">
                {searchResults.map((car) => (
                  <div key={car.id || car._id} className="car-card">
                    <img 
            src={car.image || getCarImage(car.make, car.model) || '/gtr.png'} 
            onError={(e) => { e.target.src = '/gtr.png' }} 
            alt={car.model || 'car'} 
            style={{ width: '100%', height: '180px', objectFit: 'cover' }}
          />
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

          {/* Reviews Section */}
          <div id="reviews-section" className="reviews-section" style={{ marginTop: '50px', padding: '40px 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h2 style={{ color: 'white', display: 'inline-block', margin: '0 10px 0 0', verticalAlign: 'middle' }}>Customer Reviews</h2>
              <div style={{ display: 'inline-block', color: '#f1c40f', fontSize: '24px', verticalAlign: 'middle' }}>★★★★☆</div>
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '20px', 
              padding: '0 20px',
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              <div style={{ 
                background: '#D4A017', 
                padding: '25px', 
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    marginRight: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#e74c3c',
                    padding: '2px'
                  }}>
                    <img 
                      src="/reviews/reviews photos/download.png" 
                      alt="John D." 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '50%'
                      }}
                    />
                  </div>
                  <div>
                    <h4 style={{ color: '#555', display: 'inline-block', margin: '0 0 5px 0' }}>John D.</h4>
                    <div style={{ color: '#f1c40f', fontSize: '20px' }}>★★★★★</div>
                  </div>
                </div>
                <p style={{ margin: '0', lineHeight: '1.6', color: '#555' }}>"Amazing service! The car was clean and in perfect condition. Will definitely rent again!"</p>
              </div>
              
              <div style={{ 
                background: '#D4A017', 
                padding: '25px', 
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    marginRight: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#e74c3c',
                    padding: '2px'
                  }}>
                    <img 
                      src="/reviews/reviews%20photos/download (1).png" 
                      alt="Hector M." 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '50%'
                      }}
                      onError={(e) => {
                        console.log('Failed to load image at:', e.target.src);
                        e.target.src = '/user-icon.png';
                      }}
                    />
                  </div>
                  <div>
                    <h4 style={{ color: '#555', display: 'inline-block', margin: '0 0 5px 0' }}>Hector M.</h4>
                    <div style={{ color: '#f1c40f', fontSize: '20px' }}>★★★★☆</div>
                  </div>
                </div>
                <p style={{ margin: '0', lineHeight: '1.6', color: '#555' }}>"Great selection of cars and very easy booking process. The customer service was excellent!"</p>
              </div>
              
              <div style={{ 
                background: '#D4A017', 
                padding: '25px', 
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    marginRight: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#e74c3c',
                    padding: '2px'
                  }}>
                    <img 
                      src="/reviews/reviews%20photos/download(2).png"
                      alt="Tom P." 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '50%'
                      }}
                    />
                  </div>
                  <div>
                    <h4 style={{ color: '#555', display: 'inline-block', margin: '0 0 5px 0' }}>Tom P.</h4>
                    <div style={{ color: '#f1c40f', fontSize: '20px' }}>★★★★★</div>
                  </div>
                </div>
                <p style={{ margin: '0', lineHeight: '1.6', color: '#555' }}>"Best car rental experience ever! The prices are fair and the cars are well-maintained."</p>
              </div>

              <div style={{ 
                background: '#D4A017', 
                padding: '25px', 
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    marginRight: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#e74c3c',
                    padding: '2px'
                  }}>
                    <img 
                      src="/reviews/reviews%20photos/download (3).png"
                      alt="Anna S." 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        borderRadius: '50%'
                      }}
                    />
                  </div>
                  <div>
                    <h4 style={{ color: '#555', display: 'inline-block', margin: '0 0 5px 0' }}>Kevin G.</h4>
                    <div style={{ color: '#f1c40f', fontSize: '20px' }}>★★★★★</div>
                  </div>
                </div>
                <p style={{ margin: '0', lineHeight: '1.6', color: '#555' }}>"Very convenient and easy to use. The car was clean and ready when I arrived. Highly recommended!"</p>
              </div>

              <div style={{ 
                background: '#D4A017', 
                padding: '25px', 
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    marginRight: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#e74c3c',
                    padding: '2px'
                  }}>
                    <img 
                      src="/reviews/reviews%20photos/download(4).png"
                      alt="Mike R." 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        borderRadius: '50%'
                      }}
                    />
                  </div>
                  <div>
                    <h4 style={{ color: '#555', display: 'inline-block', margin: '0 0 5px 0' }}>Mike R.</h4>
                    <div style={{ color: '#f1c40f', fontSize: '20px' }}>★★★★★</div>
                  </div>
                </div>
                <p style={{ margin: '0', lineHeight: '1.6', color: '#555' }}>"Excellent customer service and great selection of vehicles. Will definitely be using Car2Go again for my next trip!"</p>
              </div>

              <div style={{ 
                background: '#D4A017', 
                padding: '25px', 
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    marginRight: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#e74c3c',
                    padding: '2px'
                  }}>
                    <img 
                      src="/reviews/reviews%20photos/download(5).png" 
                      alt="Nate R." 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        borderRadius: '50%'
                      }}
                    />
                  </div>
                  <div>
                    <h4 style={{ color: '#555', display: 'inline-block', margin: '0 0 5px 0' }}>Nate R.</h4>
                    <div style={{ color: '#f1c40f', fontSize: '20px' }}>★★★★★</div>
                  </div>
                </div>
                <p style={{ margin: '0', lineHeight: '1.6', color: '#555' }}>"Quick and easy booking process. The car was in perfect condition and the rates were very reasonable. 5-star experience!"</p>
              </div>
            </div>
          </div>

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
                    <div className="no-account">
                      <span className="no-account-text">No account?</span>
                      <button
                        type="button"
                        className="create-account-btn"
                        onClick={() => {
                          setActiveTab('register');
                          setTabAnim(true);
                          setTimeout(() => setTabAnim(false), 360);
                        }}
                      >
                        Click Here
                      </button>
                    </div>
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
                    const userId = user?.id || user?.user_id || user?._id || null;
                    const body = { user_id: userId, car_id: carId, start_date: bookingStart, end_date: bookingEnd, total_price: Number(bookingTotal) || 0 };
                    console.log('Booking payload:', body);
                    const res = await fetch(`${API}/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
                    const data = await res.json();
                    if (res.ok) { alert(data.message || 'Booking successful'); setShowBooking(false); setBookingCarId(''); setBookingStart(''); setBookingEnd(''); setBookingTotal(''); } else { alert(data.message || 'Booking failed'); }
                  } catch (err) { console.error('booking', err); alert('Booking failed'); }
                }}>
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

          {/* All Cars Modal */}
          {showAllCars && (
            <div className="modal-overlay visible" onClick={() => setShowAllCars(false)}>
              <div className="modal-content cars-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={() => setShowAllCars(false)}>✕</button>
                <h2>All Available Cars</h2>
                <div className="cars-grid">
                  {allCarsDisplay.length > 0 ? (
                    allCarsDisplay.map((car) => (
                      <div key={car.id || car._id} className="car-card">
                        <div className="car-image">
                          <img 
                            src={`/${car.model || 'car'}.png`} 
                            alt={`${car.make} ${car.model}`}
                            onError={(e) => { e.target.src = '/gtr.png'; }}
                          />
                        </div>
                        <div className="car-details">
                          <h3>{car.make} {car.model}</h3>
                          <p className="car-type">{car.type}</p>
                          <p className="car-year">{car.year}</p>
                          <p className="car-transmission">{car.transmission}</p>
                          <p className="car-price">₱{car.price_per_day || car.price}/day</p>
                          <p className="car-availability">
                            {car.availability || car.is_available ? 
                              <span style={{color: '#27ae60'}}>✓ Available</span> : 
                              <span style={{color: '#e74c3c'}}>✗ Not Available</span>
                            }
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{gridColumn: '1 / -1', textAlign: 'center', padding: '20px'}}>No cars available</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
