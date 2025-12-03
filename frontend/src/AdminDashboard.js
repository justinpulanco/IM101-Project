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

  

  // Function to get car make from model and year
  const getCarMake = (car) => {
    if (car.brand) return car.brand;
    
    const model = car.model?.toLowerCase() || '';
    
    // Map of car filenames to their makes and years
    const carMappings = {
      // Toyota
      'toyota vios.png': { make: 'Toyota', year: 2002 },
      'toyota supra mk4.png': { make: 'Toyota', year: 1995 },
      
      // Honda
      'honda civic eg.png': { make: 'Honda', year: 1995 },
      'honda cr-v.png': { make: 'Honda', year: 2018 },
      
      // Nissan
      'nissan almera.png': { make: 'Nissan', year: 1990 },
      'nissan skyline gtr r34.png': { make: 'Nissan', year: 1994 },
      'nissan silvia s15.png': { make: 'Nissan', year: 1993 },
      'nissan 350z.png': { make: 'Nissan', year: 1999 },
      
      // Mitsubishi
      'mitsubishi eclipse.png': { make: 'Mitsubishi', year: 1990 },
      'mitsubishi xpander.webp': { make: 'Mitsubishi', year: 1992 },
      
      // Ford
      'ford ranger.png': { make: 'Ford', year: 1970 },
      
      // Hyundai
      'hyundai accent.png': { make: 'Hyundai', year: 1991 },
      
      // Mazda
      'mazda rx-7 fd.png': { make: 'Mazda', year: 1993 },
      
      // Dodge
      'dodge challenger srt8.png': { make: 'Dodge', year: 2008 },
      'dodge charger.png': { make: 'Dodge', year: 1970 },
      
      // Chevrolet
      'chevrolet camaro.png': { make: 'Chevrolet', year: 1967 }
    };
    
    // Try to find exact match by filename first
    const filename = model.toLowerCase() + (model.endsWith('.png') || model.endsWith('.webp') ? '' : '.png');
    if (carMappings[filename]) {
      return carMappings[filename].make;
    }
    
    // If no exact match, try partial matching
    for (const [key, value] of Object.entries(carMappings)) {
      if (model.includes(key.split('.')[0])) {
        return value.make;
      }
    }
    
    return 'N/A';
  };
  
  // Function to get car year from model
  const getCarYear = (car) => {
    if (car.year) return car.year;
    
    const model = car.model?.toLowerCase() || '';
    
    // Same mapping as above but for years
    const yearMappings = {
      'toyota vios.png': 2002,
      'toyota supra mk4.png': 1995,
      'honda civic eg.png': 1995,
      'honda cr-v.png': 2018,
      'nissan almera.png': 1990,
      'nissan skyline gtr r34.png': 1994,
      'nissan silvia s15.png': 1993,
      'nissan 350z.png': 1999,
      'mitsubishi eclipse.png': 1990,
      'mitsubishi xpander.webp': 1992,
      'ford ranger.png': 1970,
      'hyundai accent.png': 1991,
      'mazda rx-7 fd.png': 1993,
      'dodge challenger srt8.png': 2008,
      'dodge charger.png': 1970,
      'chevrolet camaro.png': 1967
    };
    
    // Try to find exact match by filename first
    const filename = model.toLowerCase() + (model.endsWith('.png') || model.endsWith('.webp') ? '' : '.png');
    if (yearMappings[filename] !== undefined) {
      return yearMappings[filename];
    }
    
    // If no exact match, try partial matching
    for (const [key, year] of Object.entries(yearMappings)) {
      if (model.includes(key.split('.')[0])) {
        return year;
      }
    }
    
    return 'N/A';
  };

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

  const handleToggleCarAvailability = async (carId, currentStatus) => {
    const car = cars.find(c => c.id === carId);
    const carModel = car?.model || 'Unknown Car';
    
    setConfirmDialog({
      isOpen: true,
      title: 'Toggle Car Availability',
      message: `Are you sure you want to mark "${carModel}" as ${currentStatus ? 'unavailable' : 'available'}?`,
      type: 'warning',
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        setLoading(prev => ({ ...prev, action: 'toggle' }));
        const originalCars = [...cars];
        
        try {
          setCars(prevCars => 
            prevCars.map(c => 
              c.id === carId 
                ? { 
                    ...c, 
                    is_available: !currentStatus,
                    available: !currentStatus 
                  } 
                : c
            )
          );

          const res = await fetch(`${apiBase}/cars/${carId}`, {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json', 
              ...authHeaders 
            },
            body: JSON.stringify({ 
              availability: currentStatus ? 0 : 1,
            }),
          });

          if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to update car availability');
          }

          const updatedCar = await res.json();
          
          setCars(prevCars => 
            prevCars.map(c => 
              c.id === carId 
                ? { 
                    ...c, 
                    is_available: updatedCar.is_available || !currentStatus,
                    available: updatedCar.available || !currentStatus
                  } 
                : c
            )
          );
          
          // Log activity
          await logActivity(
            ActivityActions.TOGGLE_CAR(carModel, !currentStatus),
            `Car ID: ${carId}`,
            'Admin',
            apiBase,
            token
          );
          
          setTimeout(() => {
            alert(`Car marked as ${!currentStatus ? 'available' : 'unavailable'} successfully!`);
          }, 100);
          
        } catch (err) {
          setCars(originalCars);
          console.error('Error toggling car availability:', err);
          alert(`Error: ${err.message || 'Failed to update car availability. Please try again.'}`);
        } finally {
          setLoading(prev => ({ ...prev, action: null }));
        }
      }
    });
  };

  const [deletingUser, setDeletingUser] = useState(null);

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
                    <th>Available</th>
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
                        <span className={car.is_available ? 'available' : 'unavailable'}>
                          {car.is_available ? '✓ Yes' : '✗ No'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleCarAvailability(car.id, car.is_available)}
                          className="action-btn"
                          disabled={loading.action === 'toggle'}
                          style={{ minWidth: '80px' }}
                        >
                          {loading.action === 'toggle' ? (
                            <LoadingSpinner size={16} color="#fff" />
                          ) : 'Toggle'}
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
