// Centralized API service to avoid code duplication

// Use computer's IP address for mobile access
// Change this to your computer's IP if different
const API = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : 'http://192.168.254.125:5000/api';

// ============ AUTH ENDPOINTS ============
export const authService = {
  register: async (name, email, password) => {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return await res.json();
  },

  login: async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return await res.json();
  },

  getUsers: async (token) => {
    const res = await fetch(`${API}/auth/users`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return await res.json();
  },

  updateUser: async (userId, data, token) => {
    const res = await fetch(`${API}/auth/users/${userId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return await res.json();
  },
};

// ============ CAR ENDPOINTS ============
export const carService = {
  getAll: async () => {
    const res = await fetch(`${API}/cars`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  },

  getById: async (carId, token) => {
    const res = await fetch(`${API}/cars/${carId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return await res.json();
  },

  create: async (carData, token) => {
    const res = await fetch(`${API}/cars`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(carData),
    });
    return await res.json();
  },

  update: async (carId, carData, token) => {
    const res = await fetch(`${API}/cars/${carId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(carData),
    });
    return await res.json();
  },

  delete: async (carId, token) => {
    const res = await fetch(`${API}/cars/${carId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return await res.json();
  },
};

// ============ BOOKING ENDPOINTS ============
export const bookingService = {
  getAll: async (token) => {
    const res = await fetch(`${API}/bookings`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return await res.json();
  },

  getByUser: async (userId, token) => {
    const res = await fetch(`${API}/bookings/user/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return await res.json();
  },

  checkAvailability: async (carId, startDate, endDate) => {
    const res = await fetch(`${API}/bookings/check-availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        car_id: carId,
        start_date: startDate,
        end_date: endDate,
      }),
    });
    return await res.json();
  },

  create: async (bookingData, token) => {
    const res = await fetch(`${API}/bookings`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(bookingData),
    });
    return await res.json();
  },

  delete: async (bookingId, token) => {
    const res = await fetch(`${API}/bookings/${bookingId}`, {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return await res.json();
  },
};

export default API;
