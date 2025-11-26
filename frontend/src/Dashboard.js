import React, { useEffect, useState } from 'react';
import './App.css';

export default function Dashboard({ apiBase, token, onLogout, user }) {
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);


  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  // All available car photos with their names from the filenames
  const allCarPhotos = [
    '1967 Chevrolet Camaro.png',
    '1970 Dodge Charger.png',
    '1993 Mazda RX-7 FD.png',
    '1995 Honda Civic EG.png',
    '1995 Mitsubishi Eclipse.png',
    '1995 Toyota Supra Mk4.png',
    '1999 Nissan Skyline GT-R R34.png',
    '2002 Nissan Silvia S15.png',
    '2006 Nissan 350Z.png',
    '2008 Dodge Challenger SRT8.png',
    'Ford Ranger.png',
    'Honda CR-V.png',
    'Hyundai Accent.png',
    'Mitsubishi Xpander.webp',
    'nissan almera.png',
    'Toyota Vios.png',
  ];

  // Function to get clean car name from filename (remove extension)
  const getCarNameFromFile = (filename) => {
    return filename.replace(/\.(png|webp|jpg|jpeg)$/i, '');
  };

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
        <h3>🚗 Our Car Collection</h3>
        <div className="car-gallery">
          {allCarPhotos.map((photo, index) => (
            <div key={index} className="car-photo-box">
              <div className="car-photo-image">
                <img src={`/${photo}`} alt={getCarNameFromFile(photo)} />
              </div>
              <div className="car-photo-info">
                <h4>{getCarNameFromFile(photo)}</h4>
              </div>
            </div>
          ))}
        </div>
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