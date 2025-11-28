import React, { useState, useEffect } from 'react';

export default function AdminDashboard({ apiBase, token, onLogout }) {
  const [cars, setCars] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('cars'); // 'cars', 'users', 'bookings', or 'add-cars'
  const [loading, setLoading] = useState(false);

  const authHeaders = { Authorization: `Bearer ${token}` };

  // All available car photos
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

  // Function to get clean car name from filename
  const getCarNameFromFile = (filename) => {
    return filename.replace(/\.(png|webp|jpg|jpeg)$/i, '');
  };

  useEffect(() => {
    loadCars();
    loadUsers();
    loadBookings();
  }, []);

  const loadCars = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/cars`, { headers: authHeaders });
      const data = await res.json();
      setCars(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('loadCars', err);
      alert('Error loading cars');
    }
    setLoading(false);
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/auth/users`, { headers: authHeaders });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('loadUsers', err);
      alert('Error loading users');
    }
    setLoading(false);
  };

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/bookings`, { headers: authHeaders });
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('loadBookings', err);
      alert('Error loading bookings');
    }
    setLoading(false);
  };

  const handleToggleCarAvailability = async (carId, currentStatus) => {
    try {
      const res = await fetch(`${apiBase}/cars/${carId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ 
          availability: currentStatus ? 0 : 1, // Toggle between 0 and 1 to match backend expectations
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update car');
      }
      alert(data.message || 'Updated successfully');
      loadCars();
    } catch (err) {
      console.error('Error toggling car availability:', err);
      alert(err.message || 'Error updating car. Please try again.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      const res = await fetch(`${apiBase}/auth/users/${userId}`, {
        method: 'DELETE',
        headers: { ...authHeaders },
      });
      const data = await res.json();
      alert(data.message || 'User deleted');
      loadUsers();
    } catch (err) {
      console.error('delete user', err);
      alert('Error deleting user');
    }
  };

  // Add all car photos to database
  const handleAddAllCars = async () => {
    if (!window.confirm(`Add ${allCarPhotos.length} cars to the database?`)) return;
    
    try {
      for (const photo of allCarPhotos) {
        const carName = getCarNameFromFile(photo);
        const res = await fetch(`${apiBase}/cars`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify({
            model: carName,
            make: carName.split(' ')[0],
            year: new Date().getFullYear(),
            price_per_day: 299,
            is_available: true,
            type: 'Sedan',
            transmission: 'Automatic',
            image: `/${photo}`
          }),
        });
        const data = await res.json();
        console.log(`Added: ${carName}`, data);
      }
      alert(`✅ All ${allCarPhotos.length} cars have been added to the database!`);
      await loadCars();
      setActiveTab('cars');
    } catch (err) {
      console.error('Error adding cars:', err);
      alert('Error adding cars to database');
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>🔐 Admin Dashboard</h1>
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'cars' ? 'active' : ''}`}
          onClick={() => setActiveTab('cars')}
        >
          🚗 Cars ({cars.length})
        </button>
        <button
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users ({users.length})
        </button>
        <button
          className={`admin-tab ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          📅 Bookings ({bookings.length})
        </button>
        <button
          className={`admin-tab ${activeTab === 'add-cars' ? 'active' : ''}`}
          onClick={() => setActiveTab('add-cars')}
        >
          ➕ Add Cars ({allCarPhotos.length})
        </button>
      </div>

      {loading && <p className="loading">Loading...</p>}

      {activeTab === 'cars' && (
        <div className="admin-section">
          <h2>Car Availability</h2>
          {cars.length === 0 ? (
            <p>No cars found</p>
          ) : (
            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Make</th>
                    <th>Model</th>
                    <th>Year</th>
                    <th>Price/Day</th>
                    <th>Available</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cars.map((car) => (
                    <tr key={car.id}>
                      <td>{car.id}</td>
                      <td>{car.brand || 'N/A'}</td>
                      <td>{car.model || 'N/A'}</td>
                      <td>{car.year || 'N/A'}</td>
                      <td>₱{car.price_per_day || 0}</td>
                      <td>
                        <span className={car.is_available ? 'available' : 'unavailable'}>
                          {car.is_available ? '✓ Yes' : '✗ No'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleCarAvailability(car.id, car.is_available)}
                          className="action-btn"
                        >
                          Toggle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="admin-section">
          <h2>Registered Users</h2>
          {users.length === 0 ? (
            <p>No users found</p>
          ) : (
            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name || 'N/A'}</td>
                      <td>{user.email || 'N/A'}</td>
                      <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="action-btn delete-btn"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="admin-section">
          <h2>All Bookings</h2>
          {bookings.length === 0 ? (
            <p>No bookings found</p>
          ) : (
            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Car</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.id}</td>
                      <td>{booking.user || 'N/A'}</td>
                      <td>{booking.car || 'N/A'}</td>
                      <td>{booking.start_date ? new Date(booking.start_date).toLocaleDateString() : 'N/A'}</td>
                      <td>{booking.end_date ? new Date(booking.end_date).toLocaleDateString() : 'N/A'}</td>
                      <td>₱{booking.total_price || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'add-cars' && (
        <div className="admin-section">
          <h2>🚗 Add Car Photos to Database</h2>
          <p>Click the button below to automatically add all car photos with their names from the filenames.</p>
          <button onClick={handleAddAllCars} className="add-cars-admin-btn">
            ➕ Add All {allCarPhotos.length} Cars
          </button>
          
          <h3 style={{marginTop: '32px', marginBottom: '16px'}}>Car Gallery Preview:</h3>
          <div className="admin-car-gallery">
            {allCarPhotos.map((photo, index) => (
              <div key={index} className="admin-car-photo-box">
                <div className="admin-car-photo-image">
                  <img src={`/${photo}`} alt={getCarNameFromFile(photo)} />
                </div>
                <div className="admin-car-photo-info">
                  <h4>{getCarNameFromFile(photo)}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
