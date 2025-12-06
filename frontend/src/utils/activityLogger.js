// Activity Logger Utility

export const logActivity = async (action, details, user, apiBase, token) => {
  const log = {
    action,
    details,
    user: user?.name || user?.email || 'Admin',
    timestamp: new Date().toISOString()
  };

  console.log('📝 Logging activity:', log);

  // Save to localStorage as primary storage
  try {
    const localLogs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
    localLogs.unshift(log); // Add to beginning
    
    // Keep only last 100 logs
    if (localLogs.length > 100) {
      localLogs.pop();
    }
    
    localStorage.setItem('activityLogs', JSON.stringify(localLogs));
    console.log('✅ Activity log saved to localStorage. Total logs:', localLogs.length);
  } catch (err) {
    console.error('❌ Failed to save activity log to localStorage:', err);
  }

  // Try to save to backend (optional - will fail if endpoint doesn't exist)
  try {
    await fetch(`${apiBase}/activity-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(log)
    });
  } catch (err) {
    // Silently fail - localStorage is our primary storage
  }

  return log;
};

export const getActivityLogs = () => {
  return JSON.parse(localStorage.getItem('activityLogs') || '[]');
};

export const clearActivityLogs = () => {
  localStorage.removeItem('activityLogs');
};

// Pre-defined action templates
export const ActivityActions = {
  // Cars
  DELETE_CAR: (carModel) => `Deleted car: ${carModel}`,
  ADD_CAR: (carModel) => `Added new car: ${carModel}`,
  UPDATE_CAR: (carModel) => `Updated car: ${carModel}`,
  TOGGLE_CAR: (carModel, status) => `Toggled car ${carModel} to ${status ? 'available' : 'unavailable'}`,
  
  // Users
  DELETE_USER: (userName) => `Deleted user: ${userName}`,
  ADD_USER: (userName) => `Added new user: ${userName}`,
  UPDATE_USER: (userName) => `Updated user: ${userName}`,
  
  // Bookings
  DELETE_BOOKING: (bookingId) => `Deleted booking #${bookingId}`,
  CREATE_BOOKING: (bookingId) => `Created booking #${bookingId}`,
  UPDATE_BOOKING: (bookingId) => `Updated booking #${bookingId}`,
  
  // Auth
  LOGIN: () => `Admin logged in`,
  LOGOUT: () => `Admin logged out`,
  
  // Bulk Actions
  BULK_DELETE_CARS: (count) => `Bulk deleted ${count} car(s)`,
  BULK_DELETE_USERS: (count) => `Bulk deleted ${count} user(s)`,
  BULK_DELETE_BOOKINGS: (count) => `Bulk deleted ${count} booking(s)`,
  BULK_TOGGLE_CARS: (count) => `Bulk toggled ${count} car(s)`,
};
