import React from 'react';

function MainNavbar({ 
  user, 
  token,
  showBookingsPopover,
  setShowBookingsPopover,
  userBookings,
  setUserBookings,
  onLogout,
  currency
}) {
  const API = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'http://192.168.254.125:5000/api';

  const handleLoadBookings = async () => {
    const next = !showBookingsPopover;
    setShowBookingsPopover(next);
    if (next) {
      try {
        const uid = user?.id || user?.user_id || user?._id;
        if (!uid) { 
          setUserBookings([]); 
          return; 
        }
        const res = await fetch(`${API}/bookings/user/${uid}`);
        const data = await res.json();
        setUserBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('load user bookings', err);
        setUserBookings([]);
      }
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    const msg = window.confirm('Cancel this booking?');
    if (!msg) return;
    try {
      const res = await fetch(`${API}/bookings/${bookingId}`, { 
        method: 'DELETE', 
        headers: { 
          'Content-Type':'application/json', 
          ...(token ? { Authorization: `Bearer ${token}` } : {}) 
        } 
      });
      const data = await res.json();
      if (res.ok) {
        setUserBookings((prev) => prev.filter((x) => x.id !== bookingId));
        alert(data.message || 'Booking canceled');
      } else {
        alert(data.message || 'Cancellation failed');
      }
    } catch (err) {
      console.error('delete booking', err);
      alert('Cancellation failed');
    }
  };

  return (
    <>
      <nav className="navbar navbar-auth">
        <div className="navbar-top" style={{ justifyContent: 'center', position: 'relative' }}>
          <div className="navbar-logo" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            <img src="/download.png" alt="Car2Go U-Drive" className="navbar-logo-img" />
          </div>

          <div className="navbar-right" style={{ marginLeft: 'auto' }}>
            <button
              title="Your bookings"
              aria-label="Your bookings"
              onClick={handleLoadBookings}
              className="navbar-bookings-btn navbar-icon"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M16 3v4M8 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            <button 
              className="navbar-logout icon-pill" 
              onClick={onLogout} 
              aria-label="Logout" 
              title="Logout"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Bookings Popover */}
      {showBookingsPopover && (
        <div className="bookings-popover">
          <div className="bookings-popover-head">
            <strong>Your Bookings</strong>
            <button className="bookings-popover-close" onClick={() => setShowBookingsPopover(false)}>✕</button>
          </div>
          {userBookings.length === 0 ? (
            <div className="bookings-empty">No bookings found.</div>
          ) : (
            userBookings.map((b) => (
              <div key={b.id} className="bookings-item">
                <div className="bookings-id">ID: {b.id}</div>
                <div className="bookings-user">{b.user || (user && (user.name || user.email))}</div>
                <div className="bookings-car">{b.car || b.model || 'Car'}</div>
                <div className="bookings-dates">
                  {new Date(b.start_date).toLocaleDateString()} → {new Date(b.end_date).toLocaleDateString()}
                </div>
                <div className="bookings-price">{currency.format(b.total_price || b.total || 0)}</div>
                <div style={{marginTop:8, display:'flex', gap:8}}>
                  {(b.payment_status || b.status) === 'paid' ? (
                    <div style={{fontSize:12, color:'#777'}}>Transacted</div>
                  ) : (
                    <button 
                      className="bookings-delete-btn" 
                      onClick={() => handleDeleteBooking(b.id)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
}

export default MainNavbar;
