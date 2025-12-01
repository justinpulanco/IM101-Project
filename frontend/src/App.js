import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import Dashboard from './Dashboard';
import AdminDashboard from './AdminDashboard';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import AdminLoginPage from './pages/AdminLoginPage';
import useApi from './hooks/useApi';
import { authService, carService, bookingService } from './services/apiService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// AboutPage is rendered inside HomePage now

function App() {
  // API hooks
  const { callApi: callAuth, loading: authLoading, error: authError } = useApi();
  const { callApi: callCar, loading: carLoading, error: carError } = useApi();
  const { callApi: callBooking, loading: bookingLoading, error: bookingError } = useApi();
  
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
  const [showPublicDashboard, setShowPublicDashboard] = useState(false);
  const [showAllCars, setShowAllCars] = useState(false);
  const [allCarsDisplay, setAllCarsDisplay] = useState([]);
  const [showForms, setShowForms] = useState(true);
  const [showNavbarSearch, setShowNavbarSearch] = useState(false);
  const [showBookingsPopover, setShowBookingsPopover] = useState(false);
  const [showCarDropdown, setShowCarDropdown] = useState(false);

  
  // Booking states
  const [showBooking, setShowBooking] = useState(false);
  const [bookingCarId, setBookingCarId] = useState('');
  const [carsList, setCarsList] = useState([]);
  const [bookingStart, setBookingStart] = useState('');
  const [bookingEnd, setBookingEnd] = useState('');
  const [bookingTotal, setBookingTotal] = useState('');
  const [userBookings, setUserBookings] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
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

  // Load cars for booking modal
  const loadCarsForBooking = useCallback(async () => {
    try {
      const data = await callCar(() => carService.getAll());
      setCarsList(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      console.error('Error loading cars for booking:', err);
      setCarsList([]);
      return [];
    }
  }, [callCar]);

  // Load all cars for display
  const loadAllCars = useCallback(async () => {
    try {
      const data = await callCar(() => carService.getAll());
      setAllCarsDisplay(Array.isArray(data) ? data : []);
      setShowAllCars(true);
    } catch (err) {
      console.error('Error loading cars:', err);
      setAllCarsDisplay([]);
    }
  }, [callCar]);

  // Handle user login
  const handleLogin = useCallback(async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
      const email = e.target.email?.value || loginEmail;
      const password = e.target.password?.value || loginPassword;
      
      try {
        const response = await callAuth(() => authService.login(email, password));
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          setToken(response.token);
          setUser(response.user);
          setIsAuthenticated(true);
          setShowForms(false);
          toast.success('Login successful!');
          return true;
        }
        return false;
      } catch (err) {
        console.error('Login failed:', err);
        toast.error(err.response?.data?.message || 'Login failed. Please try again.');
        return false;
      }
    }
    // Handle direct function call (from AuthPage)
    else if (e && e.email && e.password) {
      try {
        const response = await callAuth(() => authService.login(e.email, e.password));
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          setToken(response.token);
          setUser(response.user);
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
        
        const response = await callAuth(() => authService.register(name, email, password));
        
        if (response.user) {
          // Auto-login after successful registration
          const loginResponse = await callAuth(() => authService.login(email, password));
          if (loginResponse.token) {
            localStorage.setItem('token', loginResponse.token);
            localStorage.setItem('user', JSON.stringify(loginResponse.user));
            setToken(loginResponse.token);
            setUser(loginResponse.user);
            setIsAuthenticated(true);
            toast.success('Registration and login successful!');
            setShowForms(false);
            return true;
          }
        }
        return false;
      } catch (err) {
        console.error('Registration failed:', err);
        toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
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

  // Check car availability
  const checkCarAvailability = useCallback(async (carId, startDate, endDate) => {
    try {
      const isAvailable = await callBooking(() => 
        bookingService.checkAvailability(carId, startDate, endDate)
      );
      setIsAvailable(isAvailable);
      return isAvailable;
    } catch (err) {
      console.error('Error checking car availability:', err);
      return false;
    }
  }, [callBooking]);

  // Create a new booking
  const createBooking = useCallback(async (bookingData) => {
    try {
      const newBooking = await callBooking(() => 
        bookingService.create(bookingData, token)
      );
      if (newBooking) {
        toast.success('Booking created successfully!');
        setShowBooking(false);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error creating booking:', err);
      return false;
    }
  }, [callBooking, token]);

  // Load user bookings
  const loadUserBookings = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const bookings = await callBooking(() => 
        bookingService.getAll(token, { userId: user?.id })
      );
      setUserBookings(Array.isArray(bookings) ? bookings : []);
    } catch (err) {
      console.error('Error loading user bookings:', err);
      setUserBookings([]);
    }
  }, [callBooking, isAuthenticated, token, user?.id]);
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
    <div className="App">
      {/* Navbar */}
      <nav className={`navbar ${isAuthenticated ? 'navbar-auth' : ''}`}>
        <div className="navbar-top">
          <div className="navbar-logo">Car2Go</div>
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
              
              <a 
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById('about');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                About
              </a>
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
            onLoadAllCars={loadAllCars}
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