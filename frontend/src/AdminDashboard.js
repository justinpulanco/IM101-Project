import React, { useState, useEffect } from 'react';

export default function AdminDashboard({ apiBase, token, onLogout }) {
  const [cars, setCars] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('cars'); // 'cars' or 'users'
  const [loading, setLoading] = useState(false);

  const authHeaders = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    loadCars();
    loadUsers();
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

  const handleToggleCarAvailability = async (carId, currentStatus) => {
    try {
      const res = await fetch(`${apiBase}/cars/${carId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ is_available: !currentStatus }),
      });
      const data = await res.json();
      alert(data.message || 'Updated');
      loadCars();
    } catch (err) {
      console.error('toggle car', err);
      alert('Error updating car');
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
    </div>
  );
}
