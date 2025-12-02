import React, { useCallback } from 'react';

// Main Navigation Bar Component (for authenticated users)
export const MainNavbar = ({ 
  showNavbarSearch, 
  setShowNavbarSearch, 
  showBookingsPopover, 
  setShowBookingsPopover,
  userBookings,
  setUserBookings,
  user,
  handleLogout,
  API,
  token
}) => {
  const loadUserBookings = useCallback(async () => {
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
  }, [API, user, setUserBookings]);

  return (
    <nav className="navbar navbar-main">
      <div className="navbar-top">
        <div className="navbar-logo">Car2Go</div>
        <div className="navbar-right">
          <button
            className="navbar-signin"
            onClick={() => setShowNavbarSearch(s => !s)}
            aria-label="Sign In"
            title="Sign In"
          >
            Sign In
          </button>
          <button
            className="navbar-icon search-icon"
            onClick={() => setShowNavbarSearch(s => !s)}
            aria-label="Open search"
            aria-expanded={showNavbarSearch}
            title="Search"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="10.5" cy="10.5" r="7.5" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
          <button
            title="Your bookings"
            aria-label="Your bookings"
            onClick={async () => {
              const next = !showBookingsPopover;
              setShowBookingsPopover(next);
              if (next) {
                await loadUserBookings();
              }
            }}
            className="navbar-bookings-btn navbar-icon"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M16 3v4M8 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <button 
            className="navbar-logout icon-pill" 
            onClick={handleLogout} 
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
  );
};

// Home Navigation Bar Component (for unauthenticated users)
export const HomeNavbar = ({ 
  setActiveTab, 
  setShowForms, 
  isAdminMode, 
  setIsAdminMode 
}) => (
  <nav className="navbar navbar-home">
    <div className="navbar-top">
      <div className="navbar-logo">Car2Go</div>
      <div className="navbar-links">
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            alert('To access the home page, please log in or sign up first.');
            setActiveTab('login');
            setShowForms(true);
          }}
        >
          Home
        </a>
        <a 
          href="#reviews"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          Reviews
        </a>
        <a 
          href="#about"
          onClick={(e) => {
            e.preventDefault();
            const el = document.getElementById('about');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          About
        </a>
      </div>
      <div className="navbar-right">
        <div className="navbar-icons">
          <button 
            className="navbar-icon user-icon" 
            onClick={() => setShowForms(true)} 
            aria-label="Account"
          > 
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
              <path d="M4 20c1.5-4 6-6 8-6s6.5 2 8 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button 
            className="navbar-icon admin-icon" 
            onClick={() => setIsAdminMode(!isAdminMode)} 
            title="Admin Login" 
            aria-label="Admin"
          > 
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 0 1 2.28 16.9l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82L4.21 2.28A2 2 0 0 1 7.04.45l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V0a2 2 0 0 1 4 0v.09c.1.7.6 1.27 1.3 1.51h.06a1.65 1.65 0 0 0 1.82-.33l.06-.06A2 2 0 0 1 21.72 7.1l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.21.36.33.78.33 1.2s-.12.84-.33 1.2v.06z" stroke="currentColor" strokeWidth="0.6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </nav>
);

const Navbars = { MainNavbar, HomeNavbar };

export default Navbars;
