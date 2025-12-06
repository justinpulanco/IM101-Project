import React, { useState, useEffect } from 'react';
import ConfirmDialog from './components/ConfirmDialog';
import ActivityLog from './components/ActivityLog';
import { logActivity, ActivityActions } from './utils/activityLogger';

// Loading spinner component
const LoadingSpinner = ({ size = 20, color = '#3498db' }) => (
  <div style={{
    width: size,
    height: size,
    border: `2px solid #f3f3f3`,
    borderTop: `2px solid ${color}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto'
  }} />
);

// Add CSS animation
const styles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
`;

// Add styles to head
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default function AdminDashboard({ apiBase, token, onLogout }) {
  const [cars, setCars] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('cars'); // 'cars', 'users', 'bookings', 'activity', or 'add-cars'
  const [loading, setLoading] = useState({
    cars: false,
    users: false,
    bookings: false,
    action: null // 'toggle', 'delete', 'addAll'
  });

  // ConfirmDialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger'
  });

  const authHeaders = { Authorization: `Bearer ${token}` };

  // All available car photos
  const allCarPhotos = [
    'Toyota Vios.png',
    'Honda CR-V.png',
    'nissan almera.png',
    'Mitsubishi Xpander.webp',
    'Ford Ranger.png',
    'Hyundai Accent.png',
    'Hyundai Grand Starex.png',
    'Tonery Tiggo 2.png',
    'Toyota Fortuner.png',
    'Toyota Hiace.png',
    'Toyota Hilux.png',
    'Toyota Scion xB.png',
    'Kia Picanto.png',
  ];

  

  // Function to get car make (brand)
  const getCarMake = (car) => {
    return car.make || car.brand || 'N/A';
  };
  
  // Function to get car year
  const getCarYear = (car) => {
    return car.year || 'N/A';
  };

  // Function to get clean car name from filename
  const getCarNameFromFile = (filename) => {
    return filename.replace(/\.(png|webp|jpg|jpeg)$/i, '');
  };

  useEffect(() => {
    loadCars();
    loadUsers();
    loadBookings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCars = async () => {
    setLoading(prev => ({ ...prev, cars: true }));
    try {
      const res = await fetch(`${apiBase}/cars`, { headers: authHeaders });
      const data = await res.json();
      setCars(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading cars:', error);
      alert('Failed to load cars');
    } finally {
      setLoading(prev => ({ ...prev, cars: false }));
    }
  };

  const loadUsers = async () => {
    setLoading(prev => ({ ...prev, users: true }));
    try {
      const res = await fetch(`${apiBase}/auth/users`, { headers: authHeaders });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Failed to load users');
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  const loadBookings = async () => {
    setLoading(prev => ({ ...prev, bookings: true }));
    try {
      const res = await fetch(`${apiBase}/bookings`, { headers: authHeaders });
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading bookings:', error);
      alert('Failed to load bookings');
    } finally {
      setLoading(prev => ({ ...prev, bookings: false }));
    }
  };

  // Handle direct toggle of car availability
  const handleDirectToggle = async (carId, targetStatus) => {
    const car = cars.find(c => c.id === carId);
    const carModel = car?.model || 'Unknown Car';
    const statusText = targetStatus ? 'available' : 'unavailable';
    
    setConfirmDialog({
      isOpen: true,
      title: 'Update Car Availability',
      message: `Mark "${carModel}" as ${statusText}?`,
      type: 'warning',
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        setLoading(prev => ({ ...prev, action: 'toggle' }));
        
        try {
          const res = await fetch(`${apiBase}/cars/${carId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify({ availability: targetStatus ? 1 : 0 }),
          });
          
          if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to update car availability');
          }
          
          await logActivity(
            ActivityActions.TOGGLE_CAR(carModel, targetStatus),
            `Car ID: ${carId}`,
            'Admin',
            apiBase,
            token
          );
          
          await loadCars();
          alert(`✅ Car marked as ${statusText}!`);
        } catch (err) {
          console.error('Error toggling car availability:', err);
          alert(`❌ Error: ${err.message}`);
        } finally {
          setLoading(prev => ({ ...prev, action: null }));
        }
      }
    });
  };

  const [deletingUser, setDeletingUser] = useState(null);

  // Handle booking confirmation/cancellation
  const handleBookingAction = async (bookingId, newStatus) => {
    const booking = bookings.find(b => b.id === bookingId);
    const actionText = newStatus === 'confirmed' ? 'confirm' : 'cancel';
    
    setConfirmDialog({
      isOpen: true,
      title: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Booking`,
      message: `Are you sure you want to ${actionText} booking #${bookingId}?`,
      type: newStatus === 'confirmed' ? 'info' : 'danger',
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        setLoading(prev => ({ ...prev, action: 'booking' }));
        
        try {
          const res = await fetch(`${apiBase}/bookings/${bookingId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify({ status: newStatus }),
          });
          
          if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to update booking status');
          }
          
          await logActivity(
            `${actionText.charAt(0).toUpperCase() + actionText.slice(1)}ed booking #${bookingId}`,
            `Booking for ${booking?.car || 'car'} by ${booking?.user || 'user'}`,
            'Admin',
            apiBase,
            token
          );
          
          await loadBookings();
          alert(`✅ Booking ${actionText}ed successfully!`);
        } catch (err) {
          console.error('Error updating booking status:', err);
          alert(`❌ Error: ${err.message}`);
        } finally {
          setLoading(prev => ({ ...prev, action: null }));
        }
      }
    });
  };

  // Handle deleting completed bookings
  const handleDeleteBooking = async (bookingId, carName, userName) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Completed Booking',
      message: `Are you sure you want to delete booking #${bookingId}?\n\nCar: ${carName || 'N/A'}\nUser: ${userName || 'N/A'}\n\nThis action cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        setLoading(prev => ({ ...prev, action: 'delete-booking' }));
        
        try {
          const res = await fetch(`${apiBase}/bookings/${bookingId}`, {
            method: 'DELETE',
            headers: authHeaders,
          });
          
          if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to delete booking');
          }
          
          await logActivity(
            ActivityActions.DELETE_BOOKING(bookingId),
            `Deleted completed booking for ${carName || 'car'} by ${userName || 'user'}`,
            'Admin',
            apiBase,
            token
          );
          
          await loadBookings();
          alert(`✅ Booking #${bookingId} deleted successfully!`);
        } catch (err) {
          console.error('Error deleting booking:', err);
          alert(`❌ Error: ${err.message}`);
        } finally {
          setLoading(prev => ({ ...prev, action: null }));
        }
      }
    });
  };

  const handleDeleteUser = async (userId) => {
    const user = users.find(u => u.id === userId);
    const userName = user?.name || user?.email || 'Unknown User';
    
    setConfirmDialog({
      isOpen: true,
      title: 'Delete User',
      message: `Are you sure you want to delete user "${userName}"? This action cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        setDeletingUser(userId);
        try {
          const res = await fetch(`${apiBase}/auth/users/${userId}`, {
            method: 'DELETE',
            headers: { ...authHeaders },
          });
          const data = await res.json();
          
          // Log activity
          await logActivity(
            ActivityActions.DELETE_USER(userName),
            `User ID: ${userId}`,
            'Admin',
            apiBase,
            token
          );
          
          alert(data.message || 'User deleted');
          await loadUsers();
        } catch (err) {
          console.error('delete user', err);
          alert('Error deleting user');
        } finally {
          setDeletingUser(null);
        }
      }
    });
  };

  // Add all car photos to database
  const handleAddAllCars = async () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Add All Cars',
      message: `Are you sure you want to add ${allCarPhotos.length} cars to the database?`,
      type: 'info',
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        setLoading(prev => ({ ...prev, action: 'addAll' }));
        
        try {
          let addedCount = 0;
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
            addedCount++;
          }
          
          // Log activity
          await logActivity(
            `Added ${addedCount} cars to database`,
            `Bulk car addition`,
            'Admin',
            apiBase,
            token
          );
          
          alert(`✅ All ${allCarPhotos.length} cars have been added to the database!`);
          await loadCars();
          setLoading(prev => ({ ...prev, action: null }));
          setActiveTab('cars');
        } catch (err) {
          console.error('Error adding cars:', err);
          alert('Error adding cars to database');
        } finally {
          setLoading(prev => ({ ...prev, cars: false }));
        }
      }
    });
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-container" style={{ position: 'relative' }}>
        {/* Global loading overlay */}
        {Object.values(loading).some(Boolean) && (
          <div className="loading-overlay">
            <LoadingSpinner size={40} />
          </div>
        )}
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
          className={`admin-tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          📋 Activity Log
        </button>
        <button
          className={`admin-tab ${activeTab === 'add-cars' ? 'active' : ''}`}
          onClick={() => setActiveTab('add-cars')}
        >
          ➕ Add Cars ({allCarPhotos.length})
        </button>
      </div>

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
                    <th>Current Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cars.map((car) => (
                    <tr key={car.id}>
                      <td>{car.id}</td>
                      <td>{getCarMake(car)}</td>
                      <td>{car.model || 'N/A'}</td>
                      <td>{getCarYear(car)}</td>
                      <td>₱{car.price_per_day || 0}</td>
                      <td>
                        <span className={car.is_available ? 'available' : 'unavailable'} style={{ fontWeight: '600', fontSize: '14px' }}>
                          {car.is_available ? '✓ Available' : '✗ Unavailable'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', padding: '8px' }}>
                        {car.is_available ? (
                          <button
                            onClick={() => handleDirectToggle(car.id, false)}
                            className="action-btn mark-unavailable"
                            disabled={loading.action === 'toggle'}
                            style={{
                              padding: '8px 16px',
                              fontSize: '13px',
                              fontWeight: '600',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              border: 'none',
                              backgroundColor: '#f8d7da',
                              color: '#721c24',
                              transition: 'all 0.2s'
                            }}
                          >
                            Mark as Unavailable
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDirectToggle(car.id, true)}
                            className="action-btn mark-available"
                            disabled={loading.action === 'toggle'}
                            style={{
                              padding: '8px 16px',
                              fontSize: '13px',
                              fontWeight: '600',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              border: 'none',
                              backgroundColor: '#d4edda',
                              color: '#155724',
                              transition: 'all 0.2s'
                            }}
                          >
                            Mark as Available
                          </button>
                        )}
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
                          className="action-btn delete"
                          disabled={deletingUser === user.id}
                          style={{ minWidth: '80px' }}
                        >
                          {deletingUser === user.id ? (
                            <LoadingSpinner size={16} color="#fff" />
                          ) : 'Delete'}
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
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              margin: '20px 0'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>📋</div>
              <p style={{ 
                margin: '0 0 10px 0', 
                color: '#000', 
                fontWeight: '700', 
                fontSize: '18px' 
              }}>
                No bookings found
              </p>
              <p style={{ 
                margin: '0', 
                color: '#666', 
                fontSize: '14px', 
                fontWeight: '400' 
              }}>
                Bookings will appear here once users start making reservations
              </p>
            </div>
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
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => {
                    const status = booking.status || 'pending';
                    return (
                      <tr key={booking.id}>
                        <td>{booking.id}</td>
                        <td>{booking.user || 'N/A'}</td>
                        <td>{booking.car || 'N/A'}</td>
                        <td>{booking.start_date ? new Date(booking.start_date).toLocaleDateString() : 'N/A'}</td>
                        <td>{booking.end_date ? new Date(booking.end_date).toLocaleDateString() : 'N/A'}</td>
                        <td>₱{booking.total_price || 0}</td>
                        <td>
                          <span 
                            className={`booking-status ${status}`}
                            style={{
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '600',
                              textTransform: 'capitalize',
                              backgroundColor: status === 'confirmed' ? '#d4edda' : status === 'cancelled' ? '#f8d7da' : '#fff3cd',
                              color: status === 'confirmed' ? '#155724' : status === 'cancelled' ? '#721c24' : '#856404'
                            }}
                          >
                            {status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {status === 'pending' && (
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button
                                onClick={() => handleBookingAction(booking.id, 'confirmed')}
                                className="action-btn"
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '12px',
                                  backgroundColor: '#28a745',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                              >
                                ✓ Confirm
                              </button>
                              <button
                                onClick={() => handleBookingAction(booking.id, 'cancelled')}
                                className="action-btn"
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '12px',
                                  backgroundColor: '#dc3545',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                              >
                                ✗ Cancel
                              </button>
                            </div>
                          )}
                          {status === 'completed' && (
                            <button
                              onClick={() => handleDeleteBooking(booking.id, booking.car, booking.user)}
                              className="action-btn delete-btn"
                              style={{
                                padding: '6px 12px',
                                fontSize: '12px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              🗑️ Delete
                            </button>
                          )}
                          {status !== 'pending' && status !== 'completed' && (
                            <span style={{ color: '#999', fontSize: '12px' }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="admin-section">
          <ActivityLog apiBase={apiBase} token={token} />
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

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />
    </div>
  );
}
