import React, { useEffect, useState } from 'react';
import './App.css';

export default function Dashboard({ apiBase, token, onLogout, user }) {
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [carId, setCarId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalPrice, setTotalPrice] = useState('');

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const loadCars = async () => {
    try {
      const res = await fetch(`${apiBase}/cars`);
      const data = await res.json();
      setCars(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('loadCars', err);
    }
  };

  const loadBookings = async () => {
    try {
      const res = await fetch(`${apiBase}/bookings`, { headers: authHeaders });
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('loadBookings', err);
    }
  };

  useEffect(() => {
    loadCars();
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      if (!user || !user.id) {
        alert('User not found. Please log in again.');
        return;
      }

      const res = await fetch(`${apiBase}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          user_id: Number(user.id),
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

  return (
    <div className="dashboard">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}} />

      {/* Top Rentals Section */}
      <section className="top-rentals">
        <h2>Our Top Rentals</h2>
        <p>Discover our top car rentals, providing comfort, affordability, and convenience to make your next journey smooth and enjoyable!</p>
        <div className="rentals-grid">
          {cars.length > 0 ? (
            cars.map((car) => (
              <div key={car.id || car._id} className="rental-card">
                <div className="rental-image-wrapper">
                  <img src={car.image || '/gtr.png'} alt={car.model || 'car'} className="rental-image" />
                  <button className="rental-heart">♥</button>
                </div>
                <div className="rental-info">
                  <p className="rental-type">{car.type || 'Sedan'}</p>
                  <h3 className="rental-name">{car.make ? `${car.make} ${car.model || ''}` : car.model || 'Car'}</h3>
                  <p className="rental-transmission">{car.transmission || 'Automatic'}</p>
                  <p className="rental-price">₱{car.price_per_day || car.price || '—'}/day</p>
                  <button className="rental-btn">Rent</button>
                </div>
              </div>
            ))
          ) : (
            <p style={{textAlign:'center',width:'100%'}}>No cars available</p>
          )}
        </div>
      </section>

      <section>
        <h3>Cars</h3>
        <div className="cars">
          {cars.map((car) => (
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
      </section>

      <section style={{marginTop:20}}>
        <h3>Book a Car</h3>
        <form onSubmit={handleBooking} style={{maxWidth:420,display:'grid',gap:8}}>
          <input type="number" placeholder="Car ID" value={carId} onChange={(e)=>setCarId(e.target.value)} required />
          <input type="date" placeholder="Start Date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} required />
          <input type="date" placeholder="End Date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} required />
          <input type="number" placeholder="Total Price" value={totalPrice} onChange={(e)=>setTotalPrice(e.target.value)} required />
          <div style={{display:'flex',gap:8}}>
            <button type="submit">Book</button>
            <button type="button" className="secondary" onClick={()=>{ setCarId(''); setStartDate(''); setEndDate(''); setTotalPrice(''); }}>Clear</button>
          </div>
        </form>
      </section>

      <section style={{marginTop:24}}>
        <h3>Your Bookings</h3>
        <div className="bookings">
          {bookings.map((booking) => (
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