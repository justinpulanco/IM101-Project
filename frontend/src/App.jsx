import React, { useState, useEffect } from 'react';

function App() {
  const [token, setToken] = useState('');
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [carId, setCarId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalPrice, setTotalPrice] = useState('');

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
        alert('Login OK');
        // load data after token set
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

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: 1,
          car_id: Number(carId),
          start_date: startDate,
          end_date: endDate,
          total_price: Number(totalPrice),
        }),
      });
      const data = await res.json();
      alert(data.message || JSON.stringify(data));
      await loadBookings();
    } catch (err) {
      console.error(err);
      alert('Booking failed');
    }
  };

  // on mount load cars (public)
  useEffect(() => {
    loadCars();
  }, []);

  return (
    <div>
      <header>
        <h1>Car2Go-U-Drive Car Rental</h1>
      </header>

      <section>
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
          <button type="submit">Register</button>
        </form>

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

        <h2>Cars</h2>
        <div className="cars">
          {Array.isArray(cars) && cars.map((car) => (
            <div key={car.id} className="car-item">
              <b>ID:</b> {car.id}
              <br />
              <b>Model:</b> {car.model}
              <br />
              <b>Type:</b> {car.type}
              <br />
              <b>₱{car.price_per_day}</b>
            </div>
          ))}
        </div>

        <h2>Book a Car</h2>
        <form onSubmit={handleBooking}>
          <input
            type="number"
            placeholder="Car ID"
            value={carId}
            onChange={(e) => setCarId(e.target.value)}
            required
          />
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
          <input
            type="number"
            placeholder="Total Price"
            value={totalPrice}
            onChange={(e) => setTotalPrice(e.target.value)}
            required
          />
          <button type="submit">Book</button>
        </form>

        <h2>Bookings</h2>
        <div className="bookings">
          {Array.isArray(bookings) && bookings.map((booking) => (
            <div key={booking.id} className="booking-item">
              <b>ID:</b> {booking.id}
              <br />
              <b>User:</b> {booking.user}
              <br />
              <b>Car:</b> {booking.car}
              <br />
              <b>{booking.start_date}</b> → <b>{booking.end_date}</b>
              <br />
              <b>₱{booking.total_price}</b>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
