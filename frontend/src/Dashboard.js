import React, { useEffect, useState } from 'react';
import './App.css';
import Pagination from './components/Pagination';

export default function Dashboard({ apiBase, token, onLogout, user }) {
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const carsPerPage = 6;
  
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  
  const [showBookings, setShowBookings] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCarForBooking, setSelectedCarForBooking] = useState(null);
  const [bookingStart, setBookingStart] = useState('');
  const [bookingEnd, setBookingEnd] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [gcashNumber, setGcashNumber] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [bankNameField, setBankNameField] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
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

    // If paying by card, require basic card info
    if (paymentMethod === 'credit_card') {
      if (!cardNumber || cardNumber.trim().length < 12) {
        alert('Please enter a valid card number');
        return;
      }
    }

    // Additional validations for other payment methods
    if (paymentMethod === 'gcash') {
      if (!gcashNumber || gcashNumber.replace(/[^0-9]/g, '').length < 7) {
        alert('Please enter a valid GCash number');
        return;
      }
    }

    if (paymentMethod === 'paypal') {
      if (!paypalEmail || !paypalEmail.includes('@')) {
        alert('Please enter a valid PayPal email');
        return;
      }
    }

    if (paymentMethod === 'bank_transfer') {
      if (!bankNameField || !bankAccountNumber || bankAccountNumber.replace(/[^0-9]/g, '').length < 6) {
        alert('Please enter valid bank transfer details');
        return;
      }
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
          payment_method: paymentMethod,
          // include minimal payment info for server/display only; do not send sensitive data in production
          ...(paymentMethod === 'credit_card' && { card_info: { number: cardNumber, name: cardName, expiry: cardExpiry } }),
          ...(paymentMethod === 'gcash' && { gcash: { number: gcashNumber } }),
          ...(paymentMethod === 'paypal' && { paypal: { email: paypalEmail } }),
          ...(paymentMethod === 'bank_transfer' && { bank_transfer: { bank: bankNameField, account_name: bankAccountName, account_number: bankAccountNumber } })
        })
      });

      const data = await res.json();
      if (res.ok) {
        // Store transaction details
        const days = Math.ceil((new Date(bookingEnd) - new Date(bookingStart)) / (1000 * 60 * 60 * 24));
        const mask = (s) => {
          if (!s) return undefined;
          const digits = String(s).replace(/[^0-9]/g, '');
          if (digits.length <= 4) return digits;
          return '**** **** **** ' + digits.slice(-4);
        };

        const paymentDetails = paymentMethod === 'credit_card'
          ? `Card: ${mask(cardNumber)}`
          : paymentMethod === 'gcash'
            ? `GCash: ${mask(gcashNumber)}`
            : paymentMethod === 'paypal'
              ? `PayPal: ${paypalEmail}`
              : paymentMethod === 'bank_transfer'
                ? `Bank: ${bankNameField} (${bankAccountName})` : undefined;

        setLastTransaction({
          bookingId: data.bookingId,
          userName: user?.name || 'Guest',
          userEmail: user?.email || 'N/A',
          carMake: selectedCarForBooking.make,
          carModel: selectedCarForBooking.model,
          carType: selectedCarForBooking.type,
          carImage: getCarImage(selectedCarForBooking),
          startDate: new Date(bookingStart).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
          endDate: new Date(bookingEnd).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
          days: days,
          dailyRate: selectedCarForBooking.price_per_day || selectedCarForBooking.price,
          totalPrice: totalPrice,
          paymentMethod: paymentMethod,
          paymentDetails: paymentDetails,
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

  // Filter and search logic
  const getFilteredCars = () => {
    let filtered = [...cars];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(car => 
        (car.make && car.make.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (car.model && car.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (car.type && car.type.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(car => 
        car.type && car.type.toLowerCase() === filterType.toLowerCase()
      );
    }
    
    // Availability filter
    if (filterAvailability !== 'all') {
      const isAvailable = filterAvailability === 'available';
      filtered = filtered.filter(car => 
        (car.availability === 1 || car.availability === true) === isAvailable
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        const nameA = `${a.make || ''} ${a.model || ''}`.toLowerCase();
        const nameB = `${b.make || ''} ${b.model || ''}`.toLowerCase();
        return nameA.localeCompare(nameB);
      } else if (sortBy === 'price-low') {
        return (a.price_per_day || a.price || 0) - (b.price_per_day || b.price || 0);
      } else if (sortBy === 'price-high') {
        return (b.price_per_day || b.price || 0) - (a.price_per_day || a.price || 0);
      }
      return 0;
    });
    
    return filtered;
  };

  return (
    <div className="dashboard">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}} />

      {/* Top Rentals Section */}
      <section className="top-rentals">
        <h2>Our Top Rentals</h2>
        <p>Discover our top car rentals, providing comfort, affordability, and convenience to make your next journey smooth and enjoyable!</p>
        
        {/* Search and Filter Bar */}
        <div className="search-filter-bar">
          <div className="search-box">
            <input 
              type="text"
              placeholder="Search cars..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="filter-group">
            <select 
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="sports">Sports</option>
              <option value="muscle">Muscle</option>
              <option value="compact">Compact</option>
              <option value="mpv">MPV</option>
              <option value="pickup">Pickup</option>
            </select>
            
            <select 
              value={filterAvailability}
              onChange={(e) => {
                setFilterAvailability(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
            
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
        
        <div className="rentals-grid">
          {(() => {
            const filteredCars = getFilteredCars();
            
            if (filteredCars.length === 0) {
              return <p style={{textAlign:'center',width:'100%',padding:'40px 0'}}>No cars found matching your criteria</p>;
            }
            
            const indexOfLastCar = currentPage * carsPerPage;
            const indexOfFirstCar = indexOfLastCar - carsPerPage;
            const currentCars = filteredCars.slice(indexOfFirstCar, indexOfLastCar);
            
            return currentCars.map((car) => (
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
                    Rent this car
                  </button>
                </div>
              </div>
            ));
          })()}
        </div>
        
        {/* Pagination */}
        {(() => {
          const filteredCars = getFilteredCars();
          return filteredCars.length > carsPerPage && (
            <Pagination 
              currentPage={currentPage}
              totalPages={Math.ceil(filteredCars.length / carsPerPage)}
              onPageChange={setCurrentPage}
            />
          );
        })()}
      </section>

      



      {/* Booking Modal */}
      {showBookingModal && selectedCarForBooking && (
        <div className="modal-overlay visible" onClick={closeBookingModal}>
          <div className="modal-content booking-modal-dashboard" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeBookingModal}>✕</button>
            <h2 className="booking-car-title">Book {selectedCarForBooking.make} {selectedCarForBooking.model}</h2>
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
                  {/* Card details shown when Credit/Debit selected */}
                  {paymentMethod === 'credit_card' && (
                    <div className="payment-card-details">
                      <div className="card-row">
                        <label>Card Number</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/[^0-9 ]/g, ''))}
                          placeholder="1234 5678 9012 3456"
                          required
                          className="card-input"
                        />
                      </div>
                      <div className="card-row">
                        <label>Cardholder Name</label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="Name on card"
                          className="card-input"
                        />
                      </div>
                      <div className="card-row split">
                        <div>
                          <label>Expiry</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                            className="card-input"
                          />
                        </div>
                        <div>
                          <label>CVV</label>
                          <input
                            type="password"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="123"
                            maxLength={4}
                            className="card-input"
                          />
                        </div>
                      </div>
                    </div>
                  )}
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
                  {paymentMethod === 'gcash' && (
                    <div className="payment-method-details">
                      <label>GCash Number</label>
                      <input
                        type="text"
                        value={gcashNumber}
                        onChange={(e) => setGcashNumber(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="09XXXXXXXXX"
                        className="card-input"
                      />
                    </div>
                  )}
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
                  {paymentMethod === 'paypal' && (
                    <div className="payment-method-details">
                      <label>PayPal Email</label>
                      <input
                        type="email"
                        value={paypalEmail}
                        onChange={(e) => setPaypalEmail(e.target.value)}
                        placeholder="you@paypal.com"
                        className="card-input"
                      />
                    </div>
                  )}
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
                  {paymentMethod === 'bank_transfer' && (
                    <div className="payment-method-details">
                      <div className="card-row">
                        <label>Bank Name</label>
                        <input
                          type="text"
                          value={bankNameField}
                          onChange={(e) => setBankNameField(e.target.value)}
                          placeholder="Bank Name"
                          className="card-input"
                        />
                      </div>
                      <div className="card-row">
                        <label>Account Name</label>
                        <input
                          type="text"
                          value={bankAccountName}
                          onChange={(e) => setBankAccountName(e.target.value)}
                          placeholder="Account Name"
                          className="card-input"
                        />
                      </div>
                      <div className="card-row">
                        <label>Account Number</label>
                        <input
                          type="text"
                          value={bankAccountNumber}
                          onChange={(e) => setBankAccountNumber(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="Account Number"
                          className="card-input"
                        />
                      </div>
                    </div>
                  )}
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

              {/* Vehicle preview inside receipt */}
              <div className="receipt-vehicle">
                <img src={lastTransaction.carImage} alt={`${lastTransaction.carMake} ${lastTransaction.carModel}`} />
                <div className="receipt-vehicle-info">
                  <div className="receipt-vehicle-name">{lastTransaction.carMake} {lastTransaction.carModel}</div>
                  <div className="receipt-vehicle-type">{lastTransaction.carType}</div>
                </div>
              </div>
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
              {lastTransaction.paymentDetails && (
                <div className="receipt-item">
                  <span className="receipt-label">Payment Details:</span>
                  <span className="receipt-value">{lastTransaction.paymentDetails}</span>
                </div>
              )}
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