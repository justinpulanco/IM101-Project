import React from 'react';
import './About.css';

function AboutPage() {
  return (
    <div id="about" className="about-page">
      <div className="about-hero">
        <div className="about-hero-content">
          <h1>About Car2Go U-Drive</h1>
          <p>Your Trusted Partner for Premium Car Rentals</p>
        </div>
      </div>

      <div className="about-section">
        <div className="about-container">
          <div className="about-card">
            <div className="about-icon">🚗</div>
            <h3>Our Mission</h3>
            <p>
              Car2Go U-Drive is dedicated to providing affordable, reliable, and convenient car rental 
              services to travelers and locals alike. We believe everyone deserves access to quality 
              vehicles for their adventures without breaking the bank.
            </p>
          </div>

          <div className="about-card">
            <div className="about-icon">⭐</div>
            <h3>Why Choose Us</h3>
            <p>
              With over 16 meticulously maintained vehicles in our fleet, competitive pricing, 
              and a commitment to customer satisfaction, we've become the go-to choice for 
              car rentals in Davao and beyond Davao del Sur.
            </p>
          </div>

          <div className="about-card">
            <div className="about-icon">💪</div>
            <h3>Our Commitment</h3>
            <p>
              We pride ourselves on transparency, reliability, and exceptional customer service. 
              Every vehicle in our fleet is regularly maintained to ensure your safety and comfort 
              on every journey.
            </p>
          </div>
        </div>
      </div>

      <div className="what-we-offer">
        <div className="about-container">
          <h2>What We Offer</h2>
          <div className="card-container">
            <div className="card">
              <div className="number">1</div>
              <h3>Wide Vehicle Selection</h3>
              <p>From economical daily drivers to premium sports cars, we have the perfect vehicle for every need and budget.</p>
            </div>

            <div className="card">
              <div className="number">2</div>
              <h3>Competitive Pricing</h3>
              <p>Transparent pricing with no hidden fees. Get the best value for your rental with our flexible daily rates.</p>
            </div>

            <div className="card">
              <div className="number">3</div>
              <h3>Easy Booking</h3>
              <p>Book your car in minutes through our user-friendly online platform. No complicated procedures, just simple and fast.</p>
            </div>

            <div className="card">
              <div className="number">4</div>
              <h3>Professional Service</h3>
              <p>Our dedicated team is available to assist you with any questions or special requests for your rental.</p>
            </div>

            <div className="card">
              <div className="number">5</div>
              <h3>Vehicle Maintenance</h3>
              <p>Every car is thoroughly inspected and maintained to the highest standards for your safety and peace of mind.</p>
            </div>

            <div className="card">
              <div className="number">6</div>
              <h3>Flexible Terms</h3>
              <p>Flexible rental periods, convenient pickup and drop-off options to suit your schedule.</p>
            </div>
          </div>

          <div className="stats-section">
            <div className="stat-box">
              <div className="stat-number">16+</div>
              <div className="stat-label">Vehicles</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">1000+</div>
              <div className="stat-label">Happy Customers</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">5★</div>
              <div className="stat-label">Customer Rating</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Support</div>
            </div>
          </div>

          <h2 className="contact-heading">Get In Touch</h2>
          <div className="contact-grid">
            <div className="contact-item">
              <div className="contact-icon">📍</div>
              <h4>Location</h4>
              <p>Davao City, Philippines</p>
            </div>
            <div className="contact-item">
              <div className="contact-icon">📞</div>
              <h4>Phone</h4>
              <p>+63 (2) 1234-5678</p>
            </div>
            <div className="contact-item">
              <div className="contact-icon">✉️</div>
              <h4>Email</h4>
              <p>info@car2go.com</p>
            </div>
            <div className="contact-item">
              <div className="contact-icon">🕐</div>
              <h4>Hours</h4>
              <p>24/7 Available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;