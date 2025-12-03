import React, { useState } from 'react';
import AboutPage from './AboutPage';

function HomePage({ 
  searchResults, 
  onSearch, 
  onLoadAllCars,
  currency,
  getCarImage,
  API
}) {
  return (
    <div className="layout">
      <div className="hero">
        <div className="hero-inner">
          <img className="hero-car" src="/gtr.png" alt="car" />
          <div className="hero-search">
            <div className="search-form" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
              <input 
                type="text" 
                placeholder="Find a car model" 
                onChange={(e) => onSearch(e.target.value)}
                style={{ 
                  flex: 1, 
                  padding: '10px', 
                  borderRadius: '4px', 
                  border: '1px solid #ddd',
                  height: '40px',
                  fontSize: '16px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
              <button 
                onClick={async (e) => {
                  e.preventDefault();
                  const input = document.querySelector('.search-form input');
                  await onSearch(input?.value || '', true);
                }}
                style={{
                  background: '#e74c3c',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  padding: '0 15px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '40px',
                  width: '40px',
                  transition: 'background 0.3s',
                  outline: 'none'
                }}
                onMouseOver={(e) => e.target.style.background = '#c0392b'}
                onMouseOut={(e) => e.target.style.background = '#e74c3c'}
                title="Search"
                type="button"
              >
                <span style={{ fontSize: '5px' }}>🔍</span>
              </button>
            </div>
          </div>
          <div className="hero-welcome">
            <h1>Welcome!</h1>
            <p>Sign in to access your account and start driving your dreams. Book amazing vehicles for unforgettable journeys.</p>
          </div>
        </div>
      </div>

      <div className="featured-section">
        <h3>{searchResults.length > 0 ? 'Search Results' : 'All Available Cars'}</h3>
        <div className="cards-grid">
          {searchResults.length > 0 ? (
            // Show filtered search results
            searchResults.map((car) => {
              // Direct mapping of car models to image files - MUST match database exactly
              const carImageMap = {
                'Toyota Vios': '/Toyota Vios.png',
                'Honda CR-V': '/Honda CR-V.png',
                'Mitsubishi Xpander': '/Mitsubishi Xpander.webp',
                'Nissan Almera': '/nissan almera.png',
                'Hyundai Accent': '/Hyundai Accent.png',
                'Ford Ranger': '/Ford Ranger.png',
                'Honda Civic': '/1995 Honda Civic EG.png',
                'Mazda 3': '/1993 Mazda RX-7 FD.png',
                'Nissan Skyline GT-R R34': '/1999 Nissan Skyline GT-R R34.png',
                'Toyota Supra Mk4': '/1995 Toyota Supra Mk4.png',
                'Honda Civic EG': '/1995 Honda Civic EG.png',
                'Dodge Charger': '/1970 Dodge Charger.png',
                'Chevrolet Camaro': '/1967 Chevrolet Camaro.png',
                'Nissan Silvia S15': '/2002 Nissan Silvia S15.png',
                'Nissan 350Z': '/2006 Nissan 350Z.png',
                'Dodge Challenger SRT8': '/2008 Dodge Challenger SRT8.png',
                'Mazda RX-7 FD': '/1993 Mazda RX-7 FD.png',
                'Mitsubishi Eclipse': '/1995 Mitsubishi Eclipse.png',
                // Alternative names that might come from database
                '1970 Dodge Charger': '/1970 Dodge Charger.png',
                '1970 Dodge Charger R/T': '/1970 Dodge Charger.png',
                '1967 Chevrolet Camaro': '/1967 Chevrolet Camaro.png',
                '2002 Nissan Silvia S15': '/2002 Nissan Silvia S15.png',
                '2006 Nissan 350Z': '/2006 Nissan 350Z.png',
                '2008 Dodge Challenger SRT8': '/2008 Dodge Challenger SRT8.png',
                '1995 Honda Civic EG': '/1995 Honda Civic EG.png',
                '1995 Mitsubishi Eclipse': '/1995 Mitsubishi Eclipse.png',
                '1993 Mazda RX-7 FD': '/1993 Mazda RX-7 FD.png',
                '1999 Nissan Skyline GT-R R34': '/1999 Nissan Skyline GT-R R34.png',
                '1995 Toyota Supra Mk4': '/1995 Toyota Supra Mk4.png'
              };
              
              const carImage = carImageMap[car.model] || '/gtr.png';
              
              return (
              <div key={car.id || car._id} className="car-card">
                <img 
                  src={carImage} 
                  onError={(e) => { e.target.src = '/gtr.png' }} 
                  alt={car.model || 'car'} 
                  style={{ width: '100%', height: '180px', objectFit: 'contain', backgroundColor: '#f5f5f5' }}
                />
                <div className="card-body">
                  <h4>{car.model}</h4>
                  <p className="price">{car.price_per_day || car.price ? `${currency.format(car.price_per_day || car.price)}/day` : '—'}</p>
                  <p className="location">{car.location || 'Unknown'}</p>
                </div>
              </div>
              );
            })
          ) : (
            // Show all 16 cars when no search
            <>
            {/* Car 1: Toyota Supra */}
            <div className="car-card">
              <img 
                src="/1995 Toyota Supra Mk4.png"
                onError={(e) => { e.target.src = '/1995 Toyota Supra Mk4.png' }}
                alt="1995 Toyota Supra Mk4" 
                style={{ width: '100%', height: '180px', objectFit: 'contain', backgroundColor: '#f5f5f5' }}
              />
              <div className="card-body">
                <h4>1995 Toyota Supra Mk4</h4>
                <p className="price">₱2,500/day</p>
                <p className="location">Manila</p>
              </div>
            </div>

            {/* Car 2: Honda CR-V */}
            <div className="car-card">
              <img 
                src="/Honda CR-V.png"
                onError={(e) => { e.target.src = '/Honda CR-V.png' }}
                alt="Honda CR-V" 
                style={{ width: '100%', height: '180px', objectFit: 'contain', backgroundColor: '#f5f5f5' }}
              />
              <div className="card-body">
                <h4>Honda CR-V</h4>
                <p className="price">₱2,500/day</p>
                <p className="location">Manila</p>
              </div>
            </div>

            {/* Car 3: Nissan Almera */}
            <div className="car-card">
              <img 
                src="/nissan almera.png"
                onError={(e) => { e.target.src = '/nissan almera.png' }}
                alt="Nissan Almera" 
                style={{ width: '100%', height: '180px', objectFit: 'contain', backgroundColor: '#f5f5f5' }}
              />
              <div className="card-body">
                <h4>Nissan Almera</h4>
                <p className="price">₱1,400/day</p>
                <p className="location">Manila</p>
              </div>
            </div>

            {/* Car 4: Mitsubishi Xpander */}
            <div className="car-card">
              <img 
                src="/Mitsubishi Xpander.webp"
                onError={(e) => { e.target.src = '/Mitsubishi Xpander.webp' }}
                alt="Mitsubishi Xpander" 
                style={{ width: '100%', height: '180px', objectFit: 'contain', backgroundColor: '#f5f5f5' }}
              />
              <div className="card-body">
                <h4>Mitsubishi Xpander</h4>
                <p className="price">₱2,200/day</p>
                <p className="location">Manila</p>
              </div>
            </div>

            {/* Car 5: Nissan Skyline GT-R */}
            <div className="car-card">
              <img 
                src="/1999 Nissan Skyline GT-R R34.png"
                onError={(e) => { e.target.src = '/1999 Nissan Skyline GT-R R34.png' }}
                alt="1999 Nissan Skyline GT-R R34" 
                style={{ width: '100%', height: '180px', objectFit: 'contain', backgroundColor: '#f5f5f5' }}
              />
              <div className="card-body">
                <h4>1999 Nissan Skyline GT-R R34</h4>
                <p className="price">₱4,000/day</p>
                <p className="location">Manila</p>
              </div>
            </div>

            {/* Car 6: Toyota Vios */}
            <div className="car-card">
              <img 
                src="/Toyota Vios.png"
                onError={(e) => { e.target.src = '/Toyota Vios.png' }}
                alt="Toyota Vios" 
                style={{ width: '100%', height: '180px', objectFit: 'contain', backgroundColor: '#f5f5f5' }}
              />
              <div className="card-body">
                <h4>Toyota Vios</h4>
                <p className="price">₱1,500/day</p>
                <p className="location">Manila</p>
              </div>
            </div>

            {/* Car 7: Chevrolet Camaro */}
            <div className="car-card">
              <img 
                src="/1967 Chevrolet Camaro.png"
                onError={(e) => { e.target.src = '/1967 Chevrolet Camaro.png' }}
                alt="1967 Chevrolet Camaro" 
                style={{ width: '100%', height: '180px', objectFit: 'contain', backgroundColor: '#f5f5f5' }}
              />
              <div className="card-body">
                <h4>1967 Chevrolet Camaro</h4>
                <p className="price">₱3,500/day</p>
                <p className="location">Manila</p>
              </div>
            </div>

            {/* Car 8: Dodge Charger */}
            <div className="car-card">
              <img 
                src="/1970 Dodge Charger.png"
                onError={(e) => { e.target.src = '/1970 Dodge Charger.png' }}
                alt="1970 Dodge Charger" 
                style={{ width: '100%', height: '180px', objectFit: 'contain', backgroundColor: '#f5f5f5' }}
              />
              <div className="card-body">
                <h4>1970 Dodge Charger</h4>
                <p className="price">₱3,800/day</p>
                <p className="location">Manila</p>
              </div>
            </div>

            {/* Car 9: Mazda RX-7 */}
            <div className="car-card">
              <img 
                src="/1993 Mazda RX-7 FD.png"
                onError={(e) => { e.target.src = '/1993 Mazda RX-7 FD.png' }}
                alt="1993 Mazda RX-7 FD" 
                style={{ width: '100%', height: '180px', objectFit: 'contain', backgroundColor: '#f5f5f5' }}
              />
              <div className="card-body">
                <h4>1993 Mazda RX-7 FD</h4>
                <p className="price">₱2,800/day</p>
                <p className="location">Manila</p>
              </div>
            </div>

            {/* Car 10: Honda Civic */}
            <div className="car-card">
              <img 
                src="/1995 Honda Civic EG.png"
                onError={(e) => { e.target.src = '/1995 Honda Civic EG.png' }}
                alt="1995 Honda Civic EG" 
                style={{ width: '100%', height: '180px', objectFit: 'contain', backgroundColor: '#f5f5f5' }}
              />
              <div className="card-body">
                <h4>1995 Honda Civic EG</h4>
                <p className="price">₱1,800/day</p>
                <p className="location">Manila</p>
              </div>
            </div>

            {/* Car 11: Mitsubishi Eclipse */}
            <div className="car-card">
              <img 
                src="/1995 Mitsubishi Eclipse.png"
                onError={(e) => { e.target.src = '/1995 Mitsubishi Eclipse.png' }}
                alt="1995 Mitsubishi Eclipse" 
                style={{ width: '100%', height: '180px', objectFit: 'contain', backgroundColor: '#f5f5f5' }}
              />
              <div className="card-body">
                <h4>1995 Mitsubishi Eclipse</h4>
                <p className="price">₱2,000/day</p>
                <p className="location">Manila</p>
              </div>
            </div>

            {/* Car 12: Nissan Silvia */}
            <div className="car-card">
              <img 
                src="/2002 Nissan Silvia S15.png"
                onError={(e) => { e.target.src = '/2002 Nissan Silvia S15.png' }}
                alt="2002 Nissan Silvia S15" 
                style={{ width: '100%', height: '180px', objectFit: 'contain', backgroundColor: '#f5f5f5' }}
              />
              <div className="card-body">
                <h4>2002 Nissan Silvia S15</h4>
                <p className="price">₱2,600/day</p>
                <p className="location">Manila</p>
              </div>
            </div>

            {/* Car 13: Nissan 350Z */}
            <div className="car-card">
              <img 
                src="/2006 Nissan 350Z.png"
                onError={(e) => { e.target.src = '/2006 Nissan 350Z.png' }}
                alt="2006 Nissan 350Z" 
                style={{ width: '100%', height: '180px', objectFit: 'contain', backgroundColor: '#f5f5f5' }}
              />
              <div className="card-body">
                <h4>2006 Nissan 350Z</h4>
                <p className="price">₱3,200/day</p>
                <p className="location">Manila</p>
              </div>
            </div>

            {/* Car 14: Dodge Challenger */}
            <div className="car-card">
              <img 
                src="/2008 Dodge Challenger SRT8.png"
                onError={(e) => { e.target.src = '/2008 Dodge Challenger SRT8.png' }}
                alt="2008 Dodge Challenger SRT8" 
                style={{ width: '100%', height: '180px', objectFit: 'contain', backgroundColor: '#f5f5f5' }}
              />
              <div className="card-body">
                <h4>2008 Dodge Challenger SRT8</h4>
                <p className="price">₱3,900/day</p>
                <p className="location">Manila</p>
              </div>
            </div>

            {/* Car 15: Ford Ranger */}
            <div className="car-card">
              <img 
                src="/Ford Ranger.png"
                onError={(e) => { e.target.src = '/Ford Ranger.png' }}
                alt="Ford Ranger" 
                style={{ width: '100%', height: '180px', objectFit: 'contain', backgroundColor: '#f5f5f5' }}
              />
              <div className="card-body">
                <h4>Ford Ranger</h4>
                <p className="price">₱2,100/day</p>
                <p className="location">Manila</p>
              </div>
            </div>

            {/* Car 16: Hyundai Accent */}
            <div className="car-card">
              <img 
                src="/Hyundai Accent.png"
                onError={(e) => { e.target.src = '/Hyundai Accent.png' }}
                alt="Hyundai Accent" 
                style={{ width: '100%', height: '180px', objectFit: 'contain', backgroundColor: '#f5f5f5' }}
              />
              <div className="card-body">
                <h4>Hyundai Accent</h4>
                <p className="price">₱1,300/day</p>
                <p className="location">Manila</p>
              </div>
            </div>
            </>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div id="reviews-section" className="reviews-section" style={{ marginTop: '50px', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: 'white', display: 'inline-block', margin: '0 10px 0 0', verticalAlign: 'middle' }}>Customer Reviews</h2>
          <div style={{ display: 'inline-block', color: '#f1c40f', fontSize: '24px', verticalAlign: 'middle' }}>★★★★☆</div>
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px', 
          padding: '0 20px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ 
            background: '#D4A017', 
            padding: '25px', 
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                overflow: 'hidden',
                marginRight: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#e74c3c',
                padding: '2px'
              }}>
                <img 
                  src="/reviews/reviews photos/download.png" 
                  alt="John D." 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '50%'
                  }}
                />
              </div>
              <div>
                <h4 style={{ color: '#555', display: 'inline-block', margin: '0 0 5px 0' }}>John D.</h4>
                <div style={{ color: '#f1c40f', fontSize: '20px' }}>★★★★★</div>
              </div>
            </div>
            <p style={{ margin: '0', lineHeight: '1.6', color: '#555' }}>"Amazing service! The car was clean and in perfect condition. Will definitely rent again!"</p>
          </div>
          
          <div style={{ 
            background: '#D4A017', 
            padding: '25px', 
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                overflow: 'hidden',
                marginRight: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#e74c3c',
                padding: '2px'
              }}>
                <img 
                  src="/reviews/reviews%20photos/download (1).png" 
                  alt="Hector M." 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '50%'
                  }}
                  onError={(e) => {
                    console.log('Failed to load image at:', e.target.src);
                    e.target.src = '/user-icon.png';
                  }}
                />
              </div>
              <div>
                <h4 style={{ color: '#555', display: 'inline-block', margin: '0 0 5px 0' }}>Hector M.</h4>
                <div style={{ color: '#f1c40f', fontSize: '20px' }}>★★★★☆</div>
              </div>
            </div>
            <p style={{ margin: '0', lineHeight: '1.6', color: '#555' }}>"Great selection of cars and very easy booking process. The customer service was excellent!"</p>
          </div>
          
          <div style={{ 
            background: '#D4A017', 
            padding: '25px', 
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                overflow: 'hidden',
                marginRight: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#e74c3c',
                padding: '2px'
              }}>
                <img 
                  src="/reviews/reviews%20photos/download(2).png"
                  alt="Tom P." 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '50%'
                  }}
                />
              </div>
              <div>
                <h4 style={{ color: '#555', display: 'inline-block', margin: '0 0 5px 0' }}>Tom P.</h4>
                <div style={{ color: '#f1c40f', fontSize: '20px' }}>★★★★★</div>
              </div>
            </div>
            <p style={{ margin: '0', lineHeight: '1.6', color: '#555' }}>"Best car rental experience ever! The prices are fair and the cars are well-maintained."</p>
          </div>

          <div style={{ 
            background: '#D4A017', 
            padding: '25px', 
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                overflow: 'hidden',
                marginRight: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#e74c3c',
                padding: '2px'
              }}>
                <img 
                  src="/reviews/reviews%20photos/download (3).png"
                  alt="Anna S." 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    borderRadius: '50%'
                  }}
                />
              </div>
              <div>
                <h4 style={{ color: '#555', display: 'inline-block', margin: '0 0 5px 0' }}>Kevin G.</h4>
                <div style={{ color: '#f1c40f', fontSize: '20px' }}>★★★★★</div>
              </div>
            </div>
            <p style={{ margin: '0', lineHeight: '1.6', color: '#555' }}>"Very convenient and easy to use. The car was clean and ready when I arrived. Highly recommended!"</p>
          </div>

          <div style={{ 
            background: '#D4A017', 
            padding: '25px', 
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                overflow: 'hidden',
                marginRight: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#e74c3c',
                padding: '2px'
              }}>
                <img 
                  src="/reviews/reviews%20photos/download(4).png"
                  alt="Mike R." 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    borderRadius: '50%'
                  }}
                />
              </div>
              <div>
                <h4 style={{ color: '#555', display: 'inline-block', margin: '0 0 5px 0' }}>Mike R.</h4>
                <div style={{ color: '#f1c40f', fontSize: '20px' }}>★★★★★</div>
              </div>
            </div>
            <p style={{ margin: '0', lineHeight: '1.6', color: '#555' }}>"Excellent customer service and great selection of vehicles. Will definitely be using Car2Go again for my next trip!"</p>
          </div>

          <div style={{ 
            background: '#D4A017', 
            padding: '25px', 
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                overflow: 'hidden',
                marginRight: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#e74c3c',
                padding: '2px'
              }}>
                <img 
                  src="/reviews/reviews%20photos/download(5).png" 
                  alt="Nate R." 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    borderRadius: '50%'
                  }}
                />
              </div>
              <div>
                <h4 style={{ color: '#555', display: 'inline-block', margin: '0 0 5px 0' }}>Nate R.</h4>
                <div style={{ color: '#f1c40f', fontSize: '20px' }}>★★★★★</div>
              </div>
            </div>
            <p style={{ margin: '0', lineHeight: '1.6', color: '#555' }}>"Quick and easy booking process. The car was in perfect condition and the rates were very reasonable. 5-star experience!"</p>
          </div>
        </div>
      </div>
      {/* About Section (embedded) */}
      <AboutPage />
    </div>
  );
}

export default HomePage;
