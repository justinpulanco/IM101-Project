import React, { useEffect, useState } from 'react';
import './App.css';

export default function Dashboard({ apiBase, token, onLogout, user }) {
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showBookings, setShowBookings] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCarForBooking, setSelectedCarForBooking] = useState(null);
  const [bookingStart, setBookingStart] = useState('');
  const [bookingEnd, setBookingEnd] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [totalPrice, setTotalPrice] = useState(0);
  const [showTransactionReceipt, setShowTransactionReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  // Calculate total price when dates change
  useEffect(() => {
    if (selectedCarForBooking && bookingStart && bookingEnd) {
      const start = new Date(bookingStart);
      const end = new Date(bookingEnd);
      const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      const days = diff > 0 ? diff : 0;
      const dailyRate = selectedCarForBooking.price_per_day || selectedCarForBooking.price || 0;
      setTotalPrice(days * dailyRate);
    }
  }, [selectedCarForBooking, bookingStart, bookingEnd]);

  // Open booking modal for a car
  const openBookingModal = (car) => {
    setSelectedCarForBooking(car);
    setBookingStart('');
    setBookingEnd('');
    setPaymentMethod('credit_card');
    setTotalPrice(0);
    setShowBookingModal(true);
  };

  // Close booking modal
  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedCarForBooking(null);
    setBookingStart('');
    setBookingEnd('');
    setTotalPrice(0);
  };

  // Handle booking submission
  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!selectedCarForBooking || !bookingStart || !bookingEnd) {
      alert('Please fill in all fields');
      return;
    }

    if (new Date(bookingStart) >= new Date(bookingEnd)) {
      alert('End date must be after start date');
      return;
    }

    try {
      const res = await fetch(`${apiBase}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          user_id: user?.id || user?._id,
          car_id: selectedCarForBooking.id || selectedCarForBooking._id,
          start_date: bookingStart,
          end_date: bookingEnd,
          total_price: totalPrice,
          payment_method: paymentMethod
        })
      });

      const data = await res.json();
      if (res.ok) {
        // Store transaction details
        const days = Math.ceil((new Date(bookingEnd) - new Date(bookingStart)) / (1000 * 60 * 60 * 24));
        setLastTransaction({
          bookingId: data.bookingId,
          userName: user?.name || 'Guest',
          userEmail: user?.email || 'N/A',
          carMake: selectedCarForBooking.make,
          carModel: selectedCarForBooking.model,
          carType: selectedCarForBooking.type,
          startDate: new Date(bookingStart).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
          endDate: new Date(bookingEnd).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
          days: days,
          dailyRate: selectedCarForBooking.price_per_day || selectedCarForBooking.price,
          totalPrice: totalPrice,
          paymentMethod: paymentMethod,
          timestamp: new Date().toLocaleString()
        });
        
        setShowTransactionReceipt(true);
        setShowBookingModal(false);
        loadBookings();
      } else {
        alert(data.message || 'Booking failed');
      }
    } catch (err) {
      console.error('Booking error:', err);
      alert('Booking failed');
    }
  };

  // All available car photos with their names from the filenames
  // (Removed - no longer needed)

  // Function to get the car image path based on car name
  const getCarImage = (car) => {
    if (!car) return '/gtr.png';
    
    // Try to match car make and model with photo filename
    const carName = car.make && car.model ? `${car.make} ${car.model}` : car.model || '';
    
    // Map of car names to photo filenames
    const carPhotos = {
      'Chevrolet Camaro': '1967 Chevrolet Camaro.png',
      'Dodge Charger': '1970 Dodge Charger.png',
      'Mazda RX-7': '1993 Mazda RX-7 FD.png',
      'Honda Civic': '1995 Honda Civic EG.png',
      'Mitsubishi Eclipse': '1995 Mitsubishi Eclipse.png',
      'Toyota Supra': '1995 Toyota Supra Mk4.png',
      'Nissan Skyline': '1999 Nissan Skyline GT-R R34.png',
      'Nissan Silvia': '2002 Nissan Silvia S15.png',
      'Nissan 350Z': '2006 Nissan 350Z.png',
      'Dodge Challenger': '2008 Dodge Challenger SRT8.png',
      'Ford Ranger': 'Ford Ranger.png',
      'Honda CR-V': 'Honda CR-V.png',
      'Hyundai Accent': 'Hyundai Accent.png',
      'Mitsubishi Xpander': 'Mitsubishi Xpander.webp',
      'Nissan Almera': 'nissan almera.png',
      'Toyota Vios': 'Toyota Vios.png',
    };
    
    // Check if exact match exists
    if (carPhotos[carName]) {
      return `/${carPhotos[carName]}`;
    }
    
    // Try partial matching for make
    for (const [photoName, fileName] of Object.entries(carPhotos)) {
      if (carName.toLowerCase().includes(photoName.toLowerCase()) || 
          photoName.toLowerCase().includes(carName.toLowerCase())) {
        return `/${fileName}`;
      }
    }
    
    return '/gtr.png';
  };

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
                  <img src={getCarImage(car)} alt={car.model || 'car'} className="rental-image" />
                  <button className="rental-heart">♥</button>
                </div>
                <div className="rental-info">
                  <p className="rental-type">{car.type || 'Sedan'}</p>
                  <h3 className="rental-name">{car.make ? `${car.make} ${car.model || ''}` : car.model || 'Car'}</h3>
                  <p className="rental-transmission">{car.transmission || 'Automatic'}</p>
                  <p className="rental-price">₱{car.price_per_day || car.price || '—'}/day</p>
                  <button 
                    class="capitalize"
                    className="rental-btn"
                    onClick={() => openBookingModal(car)}
                  >
                    Book this car
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p style={{textAlign:'center',width:'100%'}}>No cars available</p>
          )}
        </div>
      </section>

      <section style={{marginTop:24}}>
        {token && (
          <>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
              <h3 style={{margin:0}}>Your Bookings</h3>
              <button 
                onClick={() => setShowBookings(!showBookings)}
                style={{
                  padding:'8px 16px',
                  background: showBookings ? '#27ae60' : '#666',
                  color:'white',
                  border:'none',
                  borderRadius:'6px',
                  cursor:'pointer',
                  fontSize:'13px',
                  fontWeight:'600',
                  transition:'all 0.2s'
                }}
              >
                {showBookings ? '▼ Hide' : '▶ Show'}
              </button>
            </div>
            {showBookings && (
              <div className="bookings">
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
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
                  ))
                ) : (
                  <p style={{color:'#999', textAlign:'center', padding:'20px'}}>No bookings yet. Book a car to get started!</p>
                )}
              </div>
            )}
          </>
        )}
      </section>



      {/* Booking Modal */}
      {showBookingModal && selectedCarForBooking && (
        <div className="modal-overlay visible" onClick={closeBookingModal}>
          <div className="modal-content booking-modal-dashboard" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeBookingModal}>✕</button>
            <h2>Book {selectedCarForBooking.make} {selectedCarForBooking.model}</h2>
            <div className="booking-user">Booking as: {user?.name || user?.email || 'Guest'}</div>
            
            <form onSubmit={handleBooking} className="booking-form-dashboard">
              {/* Dates Section */}
              <div className="booking-section">
                <h3>Select Dates</h3>
                <div className="date-inputs">
                  <div className="form-group">
                    <label>Start Date:</label>
                    <input 
                      type="date"
                      value={bookingStart}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setBookingStart(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date:</label>
                    <input 
                      type="date"
                      value={bookingEnd}
                      min={bookingStart || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setBookingEnd(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Price Section */}
              {totalPrice > 0 && (
                <div className="booking-section">
                  <h3>Pricing</h3>
                  <div className="price-breakdown">
                    <p><span>Daily Rate:</span> <span>₱{selectedCarForBooking.price_per_day || selectedCarForBooking.price}/day</span></p>
                    <p><span>Total Days:</span> <span>{Math.ceil((new Date(bookingEnd) - new Date(bookingStart)) / (1000 * 60 * 60 * 24))}</span></p>
                    <hr style={{margin: '10px 0', borderColor: 'rgba(255, 255, 255, 0.1)'}} />
                    <p style={{fontSize: '16px', fontWeight: 'bold'}}><span>Total Price:</span> <span style={{color: 'var(--brand-red)'}}>₱{totalPrice}</span></p>
                  </div>
                </div>
              )}

              {/* Payment Section */}
              <div className="booking-section">
                <h3>Payment Method</h3>
                <div className="payment-methods">
                  <label className="payment-option">
                    <input 
                      type="radio" 
                      name="payment" 
                      value="credit_card"
                      checked={paymentMethod === 'credit_card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>💳 Credit/Debit Card</span>
                  </label>
                  <label className="payment-option">
                    <input 
                      type="radio" 
                      name="payment" 
                      value="gcash"
                      checked={paymentMethod === 'gcash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>📱 GCash</span>
                  </label>
                  <label className="payment-option">
                    <input 
                      type="radio" 
                      name="payment" 
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>🌐 PayPal</span>
                  </label>
                  <label className="payment-option">
                    <input 
                      type="radio" 
                      name="payment" 
                      value="bank_transfer"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>🏦 Bank Transfer</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="booking-actions">
                <button 
                  type="submit"
                  className="book-btn"
                  disabled={!bookingStart || !bookingEnd}
                >
                  Confirm Booking
                </button>
                <button 
                  type="button"
                  className="cancel-btn"
                  onClick={closeBookingModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Receipt Modal */}
      {showTransactionReceipt && lastTransaction && (
        <div className="modal-overlay visible" onClick={() => setShowTransactionReceipt(false)}>
          <div className="modal-content transaction-receipt" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close" 
              onClick={() => setShowTransactionReceipt(false)}
            >
              ✕
            </button>

            {/* Receipt Header */}
            <div className="receipt-header">
              <div className="receipt-check">✓</div>
              <h2>Booking Confirmed!</h2>
              <p className="receipt-subtitle">Your reservation has been successfully created</p>
            </div>

            {/* Transaction Details */}
            <div className="receipt-section">
              <h3 className="receipt-section-title">Customer Information</h3>
              <div className="receipt-item">
                <span className="receipt-label">Name:</span>
                <span className="receipt-value">{lastTransaction.userName}</span>
              </div>
              <div className="receipt-item">
                <span className="receipt-label">Email:</span>
                <span className="receipt-value">{lastTransaction.userEmail}</span>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="receipt-section">
              <h3 className="receipt-section-title">Vehicle Details</h3>
              <div className="receipt-item">
                <span className="receipt-label">Vehicle:</span>
                <span className="receipt-value">{lastTransaction.carMake} {lastTransaction.carModel}</span>
              </div>
              <div className="receipt-item">
                <span className="receipt-label">Type:</span>
                <span className="receipt-value">{lastTransaction.carType}</span>
              </div>
            </div>

            {/* Rental Period */}
            <div className="receipt-section">
              <h3 className="receipt-section-title">Rental Period</h3>
              <div className="receipt-item">
                <span className="receipt-label">Start Date:</span>
                <span className="receipt-value">{lastTransaction.startDate}</span>
              </div>
              <div className="receipt-item">
                <span className="receipt-label">End Date:</span>
                <span className="receipt-value">{lastTransaction.endDate}</span>
              </div>
              <div className="receipt-item">
                <span className="receipt-label">Duration:</span>
                <span className="receipt-value">{lastTransaction.days} day{lastTransaction.days !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div className="receipt-section">
              <h3 className="receipt-section-title">Pricing Breakdown</h3>
              <div className="receipt-item">
                <span className="receipt-label">Daily Rate:</span>
                <span className="receipt-value">₱{lastTransaction.dailyRate.toLocaleString()}</span>
              </div>
              <div className="receipt-item">
                <span className="receipt-label">Number of Days:</span>
                <span className="receipt-value">{lastTransaction.days}</span>
              </div>
              <div className="receipt-divider"></div>
              <div className="receipt-item receipt-total">
                <span className="receipt-label">Total Amount:</span>
                <span className="receipt-value">₱{lastTransaction.totalPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="receipt-section">
              <h3 className="receipt-section-title">Payment Information</h3>
              <div className="receipt-item">
                <span className="receipt-label">Payment Method:</span>
                <span className="receipt-value">{
                  lastTransaction.paymentMethod === 'credit_card' ? '💳 Credit/Debit Card' :
                  lastTransaction.paymentMethod === 'gcash' ? '📱 GCash' :
                  lastTransaction.paymentMethod === 'paypal' ? '🌐 PayPal' :
                  '🏦 Bank Transfer'
                }</span>
              </div>
              <div className="receipt-item">
                <span className="receipt-label">Booking ID:</span>
                <span className="receipt-value">{lastTransaction.bookingId}</span>
              </div>
              <div className="receipt-item">
                <span className="receipt-label">Transaction Time:</span>
                <span className="receipt-value">{lastTransaction.timestamp}</span>
              </div>
            </div>

            {/* Action Button */}
            <button 
              className="receipt-close-btn"
              onClick={() => setShowTransactionReceipt(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}