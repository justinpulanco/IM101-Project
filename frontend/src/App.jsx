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
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [gcashNumber, setGcashNumber] = useState('');

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
      console.log('Loading cars from API...');
      const res = await fetch(`${API}/cars`);
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('API error response:', errorText);
        throw new Error(`Failed to load cars: ${res.status} ${res.statusText}`);
      }
      
      const carsData = await res.json();
      console.log('Cars data received:', carsData);
      
      if (!Array.isArray(carsData)) {
        console.error('Received data is not an array:', carsData);
        setCars([]);
        return;
      }
      
      // Deduplicate cars by model+type (case-insensitive) keeping first occurrence
      const seen = new Set();
      const uniqueCars = carsData.filter(car => {
        if (!car || !car.model || !car.type) {
          console.warn('Invalid car data:', car);
          return false;
        }
        const key = `${String(car.model).trim().toLowerCase()}::${String(car.type).trim().toLowerCase()}`;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
      
      console.log(`Loaded ${uniqueCars.length} unique cars`);
      setCars(uniqueCars);
    } catch (error) {
      console.error('Error loading cars:', error);
      setCars([]);
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

  const handleBookNow = (car) => {
    setSelectedCar(car);
    setShowBookingModal(true);
    setStartDate('');
    setEndDate('');
    setPaymentMethod('');
  };

  const scrollToCars = () => {
    console.log('Book a Car clicked. Current cars:', cars);
    loadCars().then(() => {
      setShowBookingModal(true);
      setSelectedCar(null);
      setStartDate('');
      setEndDate('');
      setPaymentMethod('');
    });
  };

  const calculateTotalDays = () => {
    if (!startDate || !endDate) return 0;
    const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  };

  const calculateTotalPrice = () => {
    if (!selectedCar || !startDate || !endDate) return 0;
    return calculateTotalDays() * selectedCar.price_per_day;
  };

  const handleBookingSubmit = async () => {
    if (!token) {
      alert('Please sign in to complete your booking');
      setShowAuth(true);
      return;
    }

    try {
      const days = calculateTotalDays();
      const totalPrice = calculateTotalPrice();
      
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          car_id: selectedCar.id,
          start_date: startDate,
          end_date: endDate,
          total_price: totalPrice,
          payment_method: paymentMethod || 'cash',
          ...(paymentMethod === 'gcash' && { gcash_number: gcashNumber }),
          ...((paymentMethod === 'credit' || paymentMethod === 'debit') && {
            card_last_four: cardNumber.slice(-4),
            card_expiry: cardExpiry
          })
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      const result = await response.json();
      alert('Booking successful!');
      setShowBookingModal(false);
      loadBookings(); // Refresh the bookings list
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  useEffect(() => {
    if (token) {
      loadCars();
      loadBookings();
    }
  }, [token]);

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
          <a href="#" className="nav-link" onClick={() => setShowQuotation(true)}>Quotation</a>
          <button className="book-car-btn" onClick={scrollToCars}>
            Book a Car ↓
          </button>
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
        

        {/* Booking Modal */}
        {showBookingModal && selectedCar && (
          <div className="booking-modal-overlay" onClick={() => setShowBookingModal(false)}>
            <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
              <div className="booking-modal-header">
                <h2>Book {selectedCar.model}</h2>
                <button 
                  className="close-booking-modal" 
                  onClick={() => setShowBookingModal(false)}
                >
                  &times;
                </button>
              </div>
              <div className="booking-modal-body">
                <div className="booking-form-group">
                  <label>Start Date:</label>
                  <input 
                    type="date" 
                    className="booking-form-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="booking-form-group">
                  <label>End Date:</label>
                  <input 
                    type="date" 
                    className="booking-form-control"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                {/* Payment Method Selection */}
                <div className="booking-form-group">
                  <label>Payment Method:</label>
                  <select 
                    className="booking-form-control"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="">Select payment method</option>
                    <option value="cash">Cash on Pickup</option>
                    <option value="gcash">GCash</option>
                    <option value="credit">Credit Card</option>
                    <option value="debit">Debit Card</option>
                  </select>
                </div>

                {paymentMethod === 'gcash' && (
                  <div className="booking-form-group">
                    <label>GCash Mobile Number:</label>
                    <input 
                      type="text"
                      className="form-control"
                      placeholder="09XXXXXXXXX"
                      value={gcashNumber}
                      onChange={(e) => setGcashNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    />
                  </div>
                )}

                {(paymentMethod === 'credit' || paymentMethod === 'debit') && (
                  <>
                    <div className="booking-form-group">
                      <label>Card Number:</label>
                      <input 
                        type="text"
                        className="booking-form-control"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19))}
                      />
                    </div>
                    <div className="booking-form-row">
                      <div className="booking-form-group">
                        <label>Expiry Date (MM/YY):</label>
                        <input 
                          type="text"
                          className="booking-form-control"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value.replace(/\D/g, '').replace(/^(\d{2})(\d{0,2})/, '$1/$2').slice(0, 5))}
                        />
                      </div>
                      <div className="booking-form-group">
                        <label>CVV:</label>
                        <input 
                          type="text"
                          className="booking-form-control"
                          placeholder="123"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        />
                      </div>
                    </div>
                  </>
                )}

                {startDate && endDate && (
                  <div className="booking-summary">
                    <h4>Booking Summary</h4>
                    <p><strong>Car:</strong> {selectedCar.model}</p>
                    <p><strong>Price per day:</strong> ₱{selectedCar.price_per_day}</p>
                    <p><strong>Total days:</strong> {calculateTotalDays()}</p>
                    <p className="total-price"><strong>Total:</strong> ₱{calculateTotalPrice()}</p>
                  </div>
                )}
              </div>
              <div className="booking-modal-footer">
                <button 
                  className="booking-btn booking-btn-secondary" 
                  onClick={() => setShowBookingModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="booking-btn booking-btn-primary"
                  onClick={handleBookingSubmit}
                  disabled={!startDate || !endDate || (paymentMethod === 'gcash' && !gcashNumber) || 
                           ((paymentMethod === 'credit' || paymentMethod === 'debit') && (!cardNumber || !cardExpiry || !cardCvc))}
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        )}

        <section className="bookings-section">
          <h2>Your Bookings</h2>
          <div className="bookings-list">
            {Array.isArray(bookings) && bookings.length > 0 ? (
              bookings.map((booking) => (
                <div key={booking.id} className="booking-card">
                  <h3>Booking #{booking.id}</h3>
                  <p><strong>Car:</strong> {booking.car}</p>
                  <p><strong>From:</strong> {booking.start_date}</p>
                  <p><strong>To:</strong> {booking.end_date}</p>
                  <p className="booking-price"><strong>Total:</strong> ₱{booking.total_price}</p>
                </div>
              ))
            ) : (
              <p>No bookings found. Book a car to see your reservations here.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;