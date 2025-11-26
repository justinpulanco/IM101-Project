import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [token, setToken] = useState('');
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showAuth, setShowAuth] = useState(true);
  const [isLogin, setIsLogin] = useState(true);

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [selectedCar, setSelectedCar] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showQuotation, setShowQuotation] = useState(false);

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
      if (res.ok) {
        setIsLogin(true);
        setRegName('');
        setRegEmail('');
        setRegPassword('');
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
        setShowAuth(false);
        await loadCars();
        await loadBookings(data.token);
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      alert('Login request failed');
    }
  };

  const loadCars = async () => {
    try {
      const res = await fetch(`${API}/cars`);
      const cars = await res.json();
      console.log('Cars loaded:', cars);
      setCars(cars);
    } catch (err) {
      console.error('loadCars', err);
    }
  };

  const loadBookings = async (authToken = token) => {
    if (!authToken) return;
    try {
      const res = await fetch(`${API}/bookings`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const bookings = await res.json();
      setBookings(bookings);
    } catch (err) {
      console.error('loadBookings', err);
    }
  };

  const handleBooking = async (car) => {
    if (!startDate || !endDate) {
      alert('Please select start and end dates');
      return;
    }
    
    try {
      const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
      const totalPrice = days * car.price_per_day;
      
      const res = await fetch(`${API}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: 1,
          car_id: car.id,
          start_date: startDate,
          end_date: endDate,
          total_price: totalPrice,
        }),
      });
      const data = await res.json();
      alert(data.message || JSON.stringify(data));
      if (res.ok) {
        await loadBookings();
        setSelectedCar(null);
        setStartDate('');
        setEndDate('');
      }
    } catch (err) {
      console.error(err);
      alert('Booking failed');
    }
  };

  useEffect(() => {
    loadCars();
  }, []);

  if (showAuth) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Car2Go</h1>
            <p>Your journey starts here</p>
          </div>
          
          <div className="auth-tabs">
            <button 
              className={`tab-btn ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              Sign In
            </button>
            <button 
              className={`tab-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          <div className="auth-form">
            {isLogin ? (
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
                <button type="submit" className="auth-btn">Sign In</button>
              </form>
            ) : (
              <form onSubmit={handleRegister}>
                <input
                  type="text"
                  placeholder="Full Name"
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
                <button type="submit" className="auth-btn">Sign Up</button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">
          <h1>Car2Go</h1>
        </div>
        <div className="nav-menu">
          <a href="#" className="nav-link">Home</a>
          <a href="#" className="nav-link">Cars</a>
          <a href="#" className="nav-link" onClick={() => setShowQuotation(true)}>Quotation</a>
          <button className="nav-btn" onClick={() => {setToken(''); setShowAuth(true);}}>
            Logout
          </button>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-content">
          <h2>Find Your Perfect Ride</h2>
          <p>Choose from our wide selection of vehicles</p>
        </div>
      </header>

      <main className="main-content">
        <section className="cars-section">
          <h2>Available Cars</h2>
          <div className="cars-grid">
            {Array.isArray(cars) && cars.map((car) => (
              <div key={car.id} className="car-card">
                <div className="car-image">
                  <img src="/gtr.png" alt={car.model} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                </div>
                <div className="car-info">
                  <h3>{car.model}</h3>
                  <p className="car-type">{car.type}</p>
                  <p className="car-price">₱{car.price_per_day}/day</p>
                  <button 
                    className="book-btn"
                    onClick={() => setSelectedCar(car)}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {selectedCar && (
          <div className="booking-modal">
            <div className="modal-content">
              <h3>Book {selectedCar.model}</h3>
              <div className="booking-form">
                <input
                  type="date"
                  placeholder="Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
                <input
                  type="date"
                  placeholder="End Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
                <div className="modal-buttons">
                  <button 
                    className="confirm-btn"
                    onClick={() => handleBooking(selectedCar)}
                  >
                    Confirm Booking
                  </button>
                  <button 
                    className="cancel-btn"
                    onClick={() => setSelectedCar(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showQuotation && (
          <div className="booking-modal">
            <div className="modal-content">
              <h3>Get a Quotation</h3>
              <div className="booking-form">
                <select onChange={(e) => setSelectedCar(cars.find(c => c.id == e.target.value))}>
                  <option value="">Select a car</option>
                  {cars && cars.length > 0 ? (
                    cars.map(car => (
                      <option key={car.id} value={car.id}>{car.model} - ₱{car.price_per_day}/day</option>
                    ))
                  ) : (
                    <option value="">No cars available</option>
                  )}
                </select>
                <input
                  type="date"
                  placeholder="Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <input
                  type="date"
                  placeholder="End Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                {selectedCar && startDate && endDate && (
                  <div className="quotation-result">
                    <h4>Quotation Summary</h4>
                    <p><strong>Car:</strong> {selectedCar.model}</p>
                    <p><strong>Daily Rate:</strong> ₱{selectedCar.price_per_day}</p>
                    <p><strong>Days:</strong> {Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))}</p>
                    <p><strong>Total Price:</strong> ₱{Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) * selectedCar.price_per_day}</p>
                  </div>
                )}
                <div className="modal-buttons">
                  <button 
                    className="cancel-btn"
                    onClick={() => {setShowQuotation(false); setSelectedCar(null); setStartDate(''); setEndDate('');}}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <section className="bookings-section">
          <h2>Your Bookings</h2>
          <div className="bookings-list">
            {Array.isArray(bookings) && bookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <h3>Booking #{booking.id}</h3>
                <p><strong>Car:</strong> {booking.car}</p>
                <p><strong>From:</strong> {booking.start_date}</p>
                <p><strong>To:</strong> {booking.end_date}</p>
                <p className="booking-price"><strong>Total:</strong> ₱{booking.total_price}</p>
              </div>
            ))}
            {(!bookings || bookings.length === 0) && (
              <p className="no-bookings">No bookings yet</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
