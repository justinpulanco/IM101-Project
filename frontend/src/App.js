import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import './App.css';
import ErrorBoundary from './components/ErrorBoundary';
import BackToTop from './components/BackToTop';
import useApi from './hooks/useApi';
import { authService, carService, bookingService } from './services/apiService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { handleApiError } from './utils/errorHandler';
import { migrateLocalStorageUser } from './utils/roleMigration';

// Lazy load components for better performance
const Dashboard = lazy(() => import('./Dashboard'));
const AdminDashboard = lazy(() => import('./AdminDashboard'));
const HomePage = lazy(() => import('./pages/HomePage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const LandingNavbar = lazy(() => import('./components/LandingNavbar'));

// Loading component
const LoadingFallback = () => (
  <div className="loading-fallback" role="status" aria-live="polite">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
);

function App() {
  // API hooks
  const { callApi: callAuth, error: authError } = useApi();
  const { callApi: callCar, error: carError } = useApi();
  const { callApi: callBooking, error: bookingError } = useApi();
  
  // State management
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') || '');
  
  // Form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // UI states
  const [activeTab, setActiveTab] = useState('login');
  const [searchResults, setSearchResults] = useState([]);
  const [showAllCars, setShowAllCars] = useState(false);
  const [allCarsDisplay, setAllCarsDisplay] = useState([]);
  const [showForms, setShowForms] = useState(true);
  const [showNavbarSearch, setShowNavbarSearch] = useState(false);

  
  // Booking states
  const [showBooking, setShowBooking] = useState(false);
  const [bookingCarId, setBookingCarId] = useState('');
  const [carsList, setCarsList] = useState([]);
  const [bookingStart, setBookingStart] = useState('');
  const [bookingEnd, setBookingEnd] = useState('');
  const [bookingTotal, setBookingTotal] = useState('');
  const [isAvailable, setIsAvailable] = useState(false);
  
  // Refs
  const navbarSearchRef = useRef(null);

  // Currency formatter for PHP
  const currency = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 });

  // Handle API errors
  useEffect(() => {
    const error = authError || carError || bookingError;
    if (error) {
      toast.error(error.message || 'An error occurred');
    }
  }, [authError, carError, bookingError]);

  // Recompute total price when car or dates change
  const calculateBookingTotal = useCallback(() => {
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

  // Recalculate booking total when dependencies change
  useEffect(() => {
    calculateBookingTotal();
  }, [calculateBookingTotal]);



  // Handle user login
  const handleLogin = useCallback(async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
      const email = e.target.email?.value || loginEmail;
      const password = e.target.password?.value || loginPassword;
      
      try {
        const response = await callAuth(() => authService.login(email, password));
        if (response.token) {
          // Use the fresh user data from the login response
          const userData = response.user;
          
          // Clear old data first
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Set new user data
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(userData));
          setToken(response.token);
          setUser(userData);
          setIsAuthenticated(true);
          setShowForms(false);
          toast.success('Login successful!');
          return true;
        }
        return false;
      } catch (err) {
        console.error('Login failed:', err);
        const errorMessage = handleApiError(err, err.response?.data?.message || 'Login failed. Please try again.');
        toast.error(errorMessage);
        return false;
      }
    }
    // Handle direct function call (from AuthPage)
    else if (e && e.email && e.password) {
      try {
        const response = await callAuth(() => authService.login(e.email, e.password));
        if (response.token) {
          // Use the fresh user data from the login response
          const userData = response.user;
          
          // Clear old data first
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Set new user data
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(userData));
          setToken(response.token);
          setUser(userData);
          setIsAuthenticated(true);
          toast.success('Login successful!');
          return true;
        }
        return false;
      } catch (err) {
        console.error('Login failed:', err);
        return false;
      }
    }
  }, [callAuth, loginEmail, loginPassword, setShowForms]);

  // Handle user registration
  const handleRegister = useCallback(async (e) => {
    // Handle form submission
    if (e && e.preventDefault) {
      e.preventDefault();
      try {
        const name = e.target.name?.value || regName;
        const email = e.target.email?.value || regEmail;
        const password = e.target.password?.value || regPassword;
        
        console.log('Registering user:', { name, email });
        const response = await callAuth(() => authService.register(name, email, password));
        console.log('Registration response:', response);
        
        // Check if registration was successful
        if (response && (response.user || response.message)) {
          toast.success('✅ Account created successfully!');
          
          // Auto-login after successful registration
          try {
            const loginResponse = await callAuth(() => authService.login(email, password));
            if (loginResponse.token) {
              // Use the fresh user data from the login response
              const userData = loginResponse.user;
              
              // Clear old data first
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              
              // Set new user data
              localStorage.setItem('token', loginResponse.token);
              localStorage.setItem('user', JSON.stringify(userData));
              setToken(loginResponse.token);
              setUser(userData);
              setIsAuthenticated(true);
              toast.success('🎉 Welcome! You are now logged in!');
              setShowForms(false);
              return true;
            }
          } catch (loginErr) {
            console.error('Auto-login failed:', loginErr);
            toast.info('Account created! Please login to continue.');
            setActiveTab('login');
            return true;
          }
        }
        return false;
      } catch (err) {
        console.error('Registration failed:', err);
        const errorMsg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
        toast.error(`❌ ${errorMsg}`);
        return false;
      }
    } 
    // Handle direct function call (from AuthPage)
    else if (typeof e === 'string' && regEmail && regPassword) {
      const name = e; // First argument is name in this case
      const email = regEmail;
      const password = regPassword;
      
      try {
        const response = await callAuth(() => authService.register(name, email, password));
        if (response.user) {
          toast.success('Registration successful! Please login.');
          setActiveTab('login');
          return true;
        }
        return false;
      } catch (err) {
        console.error('Registration failed:', err);
        return false;
      }
    }
  }, [callAuth, regName, regEmail, regPassword, setActiveTab, setShowForms]);


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



  const API = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'http://192.168.254.125:5000/api';

  // restore auth from localStorage and migrate user role if needed
  useEffect(() => {
    try {
      const tokenSaved = localStorage.getItem('token');
      const adminTokenSaved = localStorage.getItem('adminToken');
      
      if (tokenSaved) {
        setToken(tokenSaved);
        setIsAuthenticated(true);
      }
      
      // Migrate user role if needed
      const migratedUser = migrateLocalStorageUser();
      if (migratedUser) {
        setUser(migratedUser);
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



  // logout helper
  const handleLogout = () => {
    // Clear localStorage FIRST before anything else
    localStorage.clear(); // Clear everything in localStorage
    
    // Clear all state
    setToken('');
    setUser(null);
    setIsAuthenticated(false);
    setShowBooking(false);
    setShowAllCars(false);
    setSearchResults([]);
    
    // Clear all booking-related state
    setBookingCarId('');
    setBookingStart('');
    setBookingEnd('');
    setBookingTotal('');
    
    // Clear all form state
    setLoginEmail('');
    setLoginPassword('');
    setRegName('');
    setRegEmail('');
    setRegPassword('');
    
    // Force page reload to ensure clean state
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  // search cars and handle redirection
  // Add this function to map car makes and models to their image paths
  const getCarImage = (make, model) => {
    if (!make && !model) return null;
    
    // Map of car makes and models to their image filenames
    const carImageMap = {
      'chevrolet': {
        'camaro': '/1967 Chevrolet Camaro.png'
      },
      'dodge': {
        'charger': '/1970 Dodge Charger.png',
        'challenger': '/2008 Dodge Challenger SRT8.png'
      },
      'mazda': {
        'rx-7': '/1993 Mazda RX-7 FD.png',
        'rx7': '/1993 Mazda RX-7 FD.png'
      },
      'honda': {
        'civic': '/1995 Honda Civic EG.png',
        'cr-v': '/Honda CR-V.png',
        'crv': '/Honda CR-V.png'
      },
      'mitsubishi': {
        'eclipse': '/1995 Mitsubishi Eclipse.png',
        'xpander': '/Mitsubishi Xpander.webp'
      },
      'toyota': {
        'supra': '/1995 Toyota Supra Mk4.png',
        'vios': '/Toyota Vios.png'
      },
      'nissan': {
        'skyline': '/1999 Nissan Skyline GT-R R34.png',
        'silvia': '/2002 Nissan Silvia S15.png',
        '350z': '/2006 Nissan 350Z.png',
        '350': '/2006 Nissan 350Z.png',
        'almera': '/nissan almera.png'
      },
      'ford': {
        'ranger': '/Ford Ranger.png'
      },
      'hyundai': {
        'accent': '/Hyundai Accent.png'
      }
    };
    
    // Handle case where we receive full model name or separated make/model
    let makeLower = '';
    let modelLower = '';
    
    if (make && model) {
      makeLower = make.toLowerCase().trim();
      modelLower = model.toLowerCase().trim();
    } else if (make && !model) {
      // If only make is provided, it might be the full model name
      const fullName = make.toLowerCase().trim();
      const parts = fullName.split(' ');
      makeLower = parts[0];
      modelLower = parts.slice(1).join(' ');
    } else if (!make && model) {
      // If only model is provided, try to extract make from it
      const fullName = model.toLowerCase().trim();
      const parts = fullName.split(' ');
      makeLower = parts[0];
      modelLower = parts.slice(1).join(' ');
    }
    
    // First try exact match with the make
    if (makeLower && carImageMap[makeLower]) {
      // Try exact match with full model
      if (modelLower && carImageMap[makeLower][modelLower]) {
        return carImageMap[makeLower][modelLower];
      }
      
      // Try partial matches - check each model key
      const models = carImageMap[makeLower];
      for (const [modelKey, path] of Object.entries(models)) {
        // Check if model contains the model key or vice versa
        if (modelLower.includes(modelKey) || modelKey.includes(modelLower) || 
            modelLower.startsWith(modelKey) || modelKey === modelLower.split(' ')[0]) {
          return path;
        }
      }
    }
    
    return null;
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

  const handleAdminLogout = () => {
    setAdminToken('');
    setIsAdminMode(false);
    localStorage.removeItem('adminToken');
  };

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

  return (
    <ErrorBoundary>
      <div className="App">
      {/* Conditional Navbar Rendering - Only show on landing page */}
      <Suspense fallback={<LoadingFallback />}>
        {!isAuthenticated && !isAdminMode && (
          <LandingNavbar 
            onShowForms={setShowForms}
            onShowAdminLogin={() => setIsAdminMode(true)}
            setActiveTab={setActiveTab}
          />
        )}
      </Suspense>

      {/* Main content branches */}
      <Suspense fallback={<LoadingFallback />}>
        {isAdminMode && !adminToken ? (
          <AdminLoginPage 
            adminEmail={adminEmail}
            setAdminEmail={setAdminEmail}
            adminPassword={adminPassword}
            setAdminPassword={setAdminPassword}
            onAdminLogin={handleAdminLogin}
            onBackToCustomer={() => setIsAdminMode(false)}
          />
        ) : isAdminMode && adminToken ? (
          <AdminDashboard apiBase={API} token={adminToken} onLogout={handleAdminLogout} />
        ) : !isAuthenticated ? (
          <>
            <HomePage 
              searchResults={searchResults}
              onSearch={handleSearch}
              currency={currency}
              getCarImage={getCarImage}
              API={API}
            />

            {showForms && (
              <AuthPage
                onLogin={handleLogin}
              onRegister={handleRegister}
              loginEmail={loginEmail}
              setLoginEmail={setLoginEmail}
              loginPassword={loginPassword}
              setLoginPassword={setLoginPassword}
              regName={regName}
              setRegName={setRegName}
              regEmail={regEmail}
              setRegEmail={setRegEmail}
              regPassword={regPassword}
              setRegPassword={setRegPassword}
              onClose={() => setShowForms(false)}
            />
          )}
        </>
        ) : (
          <>
            <Dashboard apiBase={API} token={token} user={user} onLogout={handleLogout} />
          
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
                    allCarsDisplay.map((car) => {
                      const isAvailable = car.is_available ?? car.available ?? true;
                      return (
                      <div key={car.id || car._id} className="car-card">
                        <div className="car-image" style={{ position: 'relative' }}>
                          <img 
                            src={`/${car.model || 'car'}.png`} 
                            alt={`${car.make} ${car.model}`}
                            onError={(e) => { e.target.src = '/gtr.png'; }}
                          />
                          <span className={`availability-badge ${isAvailable ? 'available' : 'unavailable'}`}>
                            {isAvailable ? '✓ Available' : '✗ Unavailable'}
                          </span>
                        </div>
                        <div className="car-details">
                          <h3>{car.make} {car.model}</h3>
                          <p className="car-type">{car.type}</p>
                          <p className="car-year">{car.year}</p>
                          <p className="car-transmission">{car.transmission}</p>
                          <p className="car-price">₱{car.price_per_day || car.price}/day</p>
                        </div>
                      </div>
                      );
                    })
                  ) : (
                    <p style={{gridColumn: '1 / -1', textAlign: 'center', padding: '20px'}}>No cars available</p>
                  )}
                </div>
              </div>
            </div>
          )}
          </>
        )}
      </Suspense>
      </div>
      
      {/* Back to Top Button */}
      <BackToTop />
    </ErrorBoundary>
  );
}

export default App;