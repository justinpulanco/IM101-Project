import React from 'react';

function LandingNavbar({ onShowForms, onShowAdminLogin, setActiveTab }) {
  return (
    <nav className="navbar">
      <div className="navbar-top">
        <div className="navbar-logo">
          <img src="/download.png" alt="Car2Go U-Drive" className="navbar-logo-img" />
        </div>
        
        <div className="navbar-links">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              alert('Please log in to your account to access this.');
              setActiveTab('login');
              onShowForms(true);
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
              onClick={() => {
                setActiveTab('login');
                onShowForms(true);
              }} 
              aria-label="Login/Register"
              title="Login/Register"
            > 
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
                <path d="M4 20c1.5-4 6-6 8-6s6.5 2 8 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button 
              className="navbar-icon admin-icon" 
              onClick={onShowAdminLogin} 
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
}

export default LandingNavbar;
