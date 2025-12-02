import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import './App.css';

// Components
const AdminLoginPage = ({ adminEmail, setAdminEmail, adminPassword, setAdminPassword, onAdminLogin, onBackToCustomer }) => (
  <div className="admin-login">
    <h2>Admin Login</h2>
    <form onSubmit={onAdminLogin}>
      <input
        type="email"
        placeholder="Admin Email"
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
      <div className="form-actions">
        <button type="button" onClick={onBackToCustomer}>
          Back to Customer
        </button>
        <button type="submit">Login</button>
      </div>
    </form>
  </div>
);

const AdminDashboard = ({ apiBase, token, onLogout }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(`${apiBase}/bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setBookings(Array.isArray(data) ? data : []);
        } else {
          setError(data.message || 'Failed to fetch bookings');
        }
      } catch (err) {
        setError('Failed to fetch bookings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [apiBase, token]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <button onClick={onLogout}>Logout</button>
      </div>
      <div className="bookings-list">
        {bookings.map((booking) => (
          <div key={booking._id} className="booking-item">
            <p>Booking ID: {booking._id}</p>
            <p>User: {booking.user?.name || booking.user?.email || 'N/A'}</p>
            <p>Car: {booking.car?.make} {booking.car?.model}</p>
            <p>Dates: {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</p>
            <p>Total: ${booking.totalPrice?.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const AuthPage = ({
  onLogin,
  onRegister,
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  regName,
  setRegName,
  regEmail,
  setRegEmail,
  regPassword,
  setRegPassword,
  onClose,
  activeTab,
  setActiveTab
}) => (
  <div className="auth-overlay">
    <div className="auth-modal">
      <button className="close-button" onClick={onClose}>✕</button>
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'login' ? 'active' : ''}`}
          onClick={() => setActiveTab('login')}
        >
          Login
        </button>
        <button 
          className={`tab ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => setActiveTab('register')}
        >
          Register
        </button>
      </div>

      {activeTab === 'login' ? (
        <form onSubmit={onLogin} className="auth-form">
          <h2>Login</h2>
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
      ) : (
        <form onSubmit={onRegister} className="auth-form">
          <h2>Register</h2>
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
            minLength="6"
          />
          <button type="submit">Register</button>
        </form>
      )}
    </div>
  </div>
);

// Main App Component
function App() {
  const API = 'http://localhost:5000/api';
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  
  // Admin state
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminToken, setAdminToken] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  // UI state
  const [showForms, setShowForms] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [showNavbarSearch, setShowNavbarSearch] = useState(false);
  const [showBookingsPopover, setShowBookingsPopover] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [showAllCars, setShowAllCars] = useState(false);
  
  // Form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  // Booking state
  const [bookingCarId, setBookingCarId] = useState('');
  const [bookingStart, setBookingStart] = useState('');
  const [bookingEnd, setBookingEnd] = useState('');
  const [bookingTotal, setBookingTotal] = useState(0);
  const [userBookings, setUserBookings] = useState([]);
  
  // Car and search state
  const [cars, setCars] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [allCarsDisplay, setAllCarsDisplay] = useState([]);
  
  // Refs
  const navbarSearchRef = useRef(null);
  
  // Format currency
  const currency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  // Rest of the component logic...
  
  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setShowForms(false);
        setLoginEmail('');
        setLoginPassword('');
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      alert('Login failed');
    }
  };

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Registration successful! Please login.');
        setActiveTab('login');
        setRegName('');
        setRegEmail('');
        setRegPassword('');
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      alert('Registration failed');
    }
  };

  // Handle logout
  const handleLogout = () => {
    setToken('');
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setShowPublicDashboard(false);
    setShowBookingsPopover(false);
    setUserBookings([]);
  };

  // Handle admin login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      const data = await res.json();
      if (res.ok) {
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

  // Handle admin logout
  const handleAdminLogout = () => {
    setAdminToken('');
    setIsAdminMode(false);
    localStorage.removeItem('adminToken');
  };

  // Restore auth from localStorage on component mount
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
      console.warn('Error restoring auth state:', err);
    }
  }, []);

  // Close navbar search popover when clicking outside
  useEffect(() => {
    function handleDocClick(e) {
      if (showNavbarSearch && navbarSearchRef.current && !navbarSearchRef.current.contains(e.target)) {
        setShowNavbarSearch(false);
      }
    }
    
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, [showNavbarSearch]);

  // Focus search input when search is opened
  useEffect(() => {
    if (showNavbarSearch && navbarSearchRef.current) {
      const input = navbarSearchRef.current.querySelector('input[type=text]');
      if (input) input.focus();
    }
  }, [showNavbarSearch]);

  // Format price with currency
  const formatPrice = (price) => {
    return currency.format(price || 0);
  };

  // Main render
  return (
    <div className="App">
      {/* Admin Mode */}
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
        <AdminDashboard 
          apiBase={API} 
          token={adminToken} 
          onLogout={handleAdminLogout} 
        />
      ) : (
        /* User Mode */
        <>
          {/* Navbar */}
          <nav className="navbar">
            <div className="navbar-container">
              <div className="navbar-brand">Car2Go</div>
              
              {isAuthenticated ? (
                <div className="navbar-links">
                  <button 
                    className="navbar-link"
                    onClick={() => setShowBookingsPopover(!showBookingsPopover)}
                  >
                    My Bookings
                  </button>
                  <button 
                    className="navbar-link"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="navbar-links">
                  <button 
                    className="navbar-link"
                    onClick={() => {
                      setShowForms(true);
                      setActiveTab('login');
                    }}
                  >
                    Login
                  </button>
                  <button 
                    className="navbar-button"
                    onClick={() => {
                      setShowForms(true);
                      setActiveTab('register');
                    }}
                  >
                    Sign Up
                  </button>
                  <button 
                    className="admin-button"
                    onClick={() => setIsAdminMode(true)}
                  >
                    Admin
                  </button>
                </div>
              )}
              
              <button 
                className="search-button"
                onClick={() => setShowNavbarSearch(!showNavbarSearch)}
              >
                🔍
              </button>
              
              {showNavbarSearch && (
                <div ref={navbarSearchRef} className="search-dropdown">
                  <input 
                    type="text" 
                    placeholder="Search cars..." 
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              )}
            </div>
          </nav>
          
          {/* Main Content */}
          <main>
            {/* Hero Section */}
            <section className="hero">
              <h1>Find the perfect car for your next adventure</h1>
              <p>Search from our wide selection of vehicles</p>
              <button 
                className="cta-button"
                onClick={() => setShowAllCars(true)}
              >
                Browse All Cars
              </button>
            </section>
            
            {/* Featured Cars */}
            <section className="featured-cars">
              <h2>Featured Cars</h2>
              <div className="car-grid">
                {cars.slice(0, 4).map((car) => (
                  <div key={car._id} className="car-card">
                    <img 
                      src={car.image || '/default-car.jpg'} 
                      alt={`${car.make} ${car.model}`} 
                    />
                    <h3>{car.make} {car.model}</h3>
                    <p className="price">{formatPrice(car.pricePerDay)}/day</p>
                    <button 
                      className="book-button"
                      onClick={() => {
                        setBookingCarId(car._id);
                        setShowBooking(true);
                      }}
                    >
                      Book Now
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </main>
          
          {/* Booking Modal */}
          {showBooking && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>Book a Car</h2>
                <form onSubmit={handleBookCar}>
                  <div className="form-group">
                    <label>Start Date</label>
                    <input 
                      type="date" 
                      value={bookingStart}
                      onChange={(e) => setBookingStart(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>End Date</label>
                    <input 
                      type="date" 
                      value={bookingEnd}
                      onChange={(e) => setBookingEnd(e.target.value)}
                      min={bookingStart || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="secondary"
                      onClick={() => setShowBooking(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={!bookingStart || !bookingEnd}
                    >
                      Confirm Booking
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {/* Auth Modal */}
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
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          )}
          
          {/* All Cars Modal */}
          {showAllCars && (
            <div className="modal-overlay">
              <div className="modal large">
                <div className="modal-header">
                  <h2>All Available Cars</h2>
                  <button 
                    className="close-button" 
                    onClick={() => setShowAllCars(false)}
                  >
                    ✕
                  </button>
                </div>
                
                <div className="car-grid">
                  {cars.map((car) => (
                    <div key={car._id} className="car-card">
                      <img 
                        src={car.image || '/default-car.jpg'} 
                        alt={`${car.make} ${car.model}`} 
                      />
                      <h3>{car.make} {car.model}</h3>
                      <p className="price">{formatPrice(car.pricePerDay)}/day</p>
                      <button 
                        className="book-button"
                        onClick={() => {
                          setBookingCarId(car._id);
                          setShowAllCars(false);
                          setShowBooking(true);
                        }}
                      >
                        Book Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Bookings Popover */}
          {showBookingsPopover && (
            <div className="bookings-popover">
              <div className="popover-header">
                <h3>My Bookings</h3>
                <button 
                  className="close-button"
                  onClick={() => setShowBookingsPopover(false)}
                >
                  ✕
                </button>
              </div>
              
              {userBookings.length > 0 ? (
                <div className="bookings-list">
                  {userBookings.map((booking) => (
                    <div key={booking._id} className="booking-item">
                      <p><strong>{booking.car?.make} {booking.car?.model}</strong></p>
                      <p>
                        {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                      <p>Total: {formatPrice(booking.totalPrice)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No bookings found.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
