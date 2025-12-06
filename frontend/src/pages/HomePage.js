import React from 'react';
import AboutPage from './AboutPage';

function HomePage({ 
  searchResults, 
  onSearch, 
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

      <div className="featured-section" style={{ backgroundColor: '#228C22' }}>
        <h3 style={{ color: '#f7eeeeff' }}>{searchResults.length > 0 ? 'Search Results' : 'All Available Cars'}</h3>
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
                'Hyundai Grand Starex': '/Hyundai Grand Starex.png',
                'Tonery Tiggo 2': '/Tonery Tiggo 2.png',
                'Toyota Fortuner': '/Toyota Fortuner.png',
                'Toyota HiAce': '/Toyota Hiace.png',
                'Toyota Hilux': '/Toyota Hilux.png',
                'Toyota Scion xB': '/Toyota Scion xB.png',
                'Kia Picanto': '/Kia Picanto.png'
              };
              
              const carImage = carImageMap[car.model] || '/gtr.png';
              
              const isAvailable = car.is_available ?? car.available ?? true;
              
              return (
              <div key={car.id || car._id} className="car-card">
                <div style={{ position: 'relative' }}>
                  <img 
                    src={carImage} 
                    onError={(e) => { e.target.src = '/gtr.png' }} 
                    alt={car.model || 'car'} 
                    style={{ width: '100%', height: '180px', objectFit: 'contain', backgroundColor: '#f5f5f5' }}
                  />
                  <span className={`availability-badge ${isAvailable ? 'available' : 'unavailable'}`}>
                    {isAvailable ? '✓ Available' : '✗ Unavailable'}
                  </span>
                </div>
                <div className="card-body">
                  <h4>{car.model}</h4>
                  <p className="price">{car.price_per_day || car.price ? `${currency.format(car.price_per_day || car.price)}/day` : '—'}</p>
                  <p className="location">{car.location || 'Unknown'}</p>
                </div>
              </div>
              );
            })
          ) : (
            // Show all 13 cars when no search
            <>
            {/* Car 1: Toyota Vios */}
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
                <p className="location">Davao</p>
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
                <p className="location">Davao</p>
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
                <p className="location">Davao</p>
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
                <p className="location">Davao</p>
              </div>
            </div>

            {/* Car 5: Ford Ranger */}
            <div className="car-card">
              <img 
                src="/Ford Ranger.png"
                onError={(e) => { e.target.src = '/Ford Ranger.png' }}
                alt="Ford Ranger" 
                style={{ width: '100%', height: '180px', objectFit: 'contain', backgroundColor: '#f5f5f5' }}
              />
              <div className="card-body">
                <h4>Ford Ranger</h4>
                <p className="price">₱2,700/day</p>
                <p className="location">Davao</p>
              </div>
            </div>

            {/* Car 6: Hyundai Accent */}
            <div className="car-card">
              <img 
                src="/Hyundai Accent.png"
                onError={(e) => { e.target.src = '/Hyundai Accent.png' }}
                alt="Hyundai Accent" 
                style={{ width: '100%', height: '180px', objectFit: 'contain', backgroundColor: '#f5f5f5' }}
              />
              <div className="card-body">
                <h4>Hyundai Accent</h4>
                <p className="price">₱1,600/day</p>
                <p className="location">Davao</p>
              </div>
            </div>

            {/* Car 7: Hyundai Grand Starex */}
            <div className="car-card">
              <img 
                src="/Hyundai Grand Starex.png"
                onError={(e) => { e.target.src = '/Hyundai Grand Starex.png' }}
                alt="Hyundai Grand Starex" 
                style={{ width: '100%', height: '180px', objectFit: 'contain', backgroundColor: '#f5f5f5' }}
              />
              <div className="card-body">
                <h4>Hyundai Grand Starex</h4>
                <p className="price">₱2,800/day</p>
                <p className="location">Davao</p>
              </div>
            </div>

            {/* Car 8: Tonery Tiggo 2 */}
            <div className="car-card">
              <img 
                src="/Tonery Tiggo 2.png"
                onError={(e) => { e.target.src = '/Tonery Tiggo 2.png' }}
                alt="Tonery Tiggo 2" 
                style={{ width: '100%', height: '180px', objectFit: 'contain', backgroundColor: '#f5f5f5' }}
              />
              <div className="card-body">
                <h4>Tonery Tiggo 2</h4>
                <p className="price">₱2,200/day</p>
                <p className="location">Davao</p>
              </div>
            </div>

            {/* Car 9: Toyota Fortuner */}
            <div className="car-card">
              <img 
                src="/Toyota Fortuner.png"
                onError={(e) => { e.target.src = '/Toyota Fortuner.png' }}
                alt="Toyota Fortuner" 
                style={{ width: '100%', height: '180px', objectFit: 'contain', backgroundColor: '#f5f5f5' }}
              />
              <div className="card-body">
                <h4>Toyota Fortuner</h4>
                <p className="price">₱3,200/day</p>
                <p className="location">Davao</p>
              </div>
            </div>

            {/* Car 10: Toyota HiAce */}
            <div className="car-card">
              <img 
                src="/Toyota Hiace.png"
                onError={(e) => { e.target.src = '/Toyota Hiace.png' }}
                alt="Toyota HiAce" 
                style={{ width: '100%', height: '180px', objectFit: 'contain', backgroundColor: '#f5f5f5' }}
              />
              <div className="card-body">
                <h4>Toyota HiAce</h4>
                <p className="price">₱2,900/day</p>
                <p className="location">Davao</p>
              </div>
            </div>

            {/* Car 11: Toyota Hilux */}
            <div className="car-card">
              <img 
                src="/Toyota Hilux.png"
                onError={(e) => { e.target.src = '/Toyota Hilux.png' }}
                alt="Toyota Hilux" 
                style={{ width: '100%', height: '180px', objectFit: 'contain', backgroundColor: '#f5f5f5' }}
              />
              <div className="card-body">
                <h4>Toyota Hilux</h4>
                <p className="price">₱2,800/day</p>
                <p className="location">Davao</p>
              </div>
            </div>

            {/* Car 12: Toyota Scion xB */}
            <div className="car-card">
              <img 
                src="/Toyota Scion xB.png"
                onError={(e) => { e.target.src = '/Toyota Scion xB.png' }}
                alt="Toyota Scion xB" 
                style={{ width: '100%', height: '180px', objectFit: 'contain', backgroundColor: '#f5f5f5' }}
              />
              <div className="card-body">
                <h4>Toyota Scion xB</h4>
                <p className="price">₱1,800/day</p>
                <p className="location">Davao</p>
              </div>
            </div>

            {/* Car 13: Kia Picanto */}
            <div className="car-card">
              <img 
                src="/Kia Picanto.png"
                onError={(e) => { e.target.src = '/Kia Picanto.png' }}
                alt="Kia Picanto" 
                style={{ width: '100%', height: '180px', objectFit: 'contain', backgroundColor: '#f5f5f5' }}
              />
              <div className="card-body">
                <h4>Kia Picanto</h4>
                <p className="price">₱1,200/day</p>
                <p className="location">Davao</p>
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
