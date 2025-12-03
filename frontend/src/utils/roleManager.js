// Role-Based Access Control Utility

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest'
};

export const PERMISSIONS = {
  // Car permissions
  VIEW_CARS: 'view_cars',
  BOOK_CAR: 'book_car',
  MANAGE_CARS: 'manage_cars',
  
  // User permissions
  VIEW_USERS: 'view_users',
  MANAGE_USERS: 'manage_users',
  
  // Booking permissions
  VIEW_OWN_BOOKINGS: 'view_own_bookings',
  VIEW_ALL_BOOKINGS: 'view_all_bookings',
  MANAGE_BOOKINGS: 'manage_bookings',
  
  // Activity log permissions
  VIEW_ACTIVITY_LOG: 'view_activity_log'
};

// Role-Permission mapping
const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    PERMISSIONS.VIEW_CARS,
    PERMISSIONS.BOOK_CAR,
    PERMISSIONS.MANAGE_CARS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_OWN_BOOKINGS,
    PERMISSIONS.VIEW_ALL_BOOKINGS,
    PERMISSIONS.MANAGE_BOOKINGS,
    PERMISSIONS.VIEW_ACTIVITY_LOG
  ],
  [USER_ROLES.USER]: [
    PERMISSIONS.VIEW_CARS,
    PERMISSIONS.BOOK_CAR,
    PERMISSIONS.VIEW_OWN_BOOKINGS
  ],
  [USER_ROLES.GUEST]: [
    PERMISSIONS.VIEW_CARS
  ]
};

export const getUserRole = (user) => {
  if (!user) return USER_ROLES.GUEST;
  
  // Check if user has explicit role
  if (user.role) {
    return user.role;
  }
  
  // Check if user is admin (legacy support)
  if (user.is_admin === true || user.is_admin === 1) {
    return USER_ROLES.ADMIN;
  }
  
  // Check by email (only real admin account)
  const adminEmails = [
    'admin@carrentals.com' // The only admin account
  ];
  if (user.email && adminEmails.includes(user.email.toLowerCase())) {
    return USER_ROLES.ADMIN;
  }
  
  // Default to USER role for all other accounts
  return USER_ROLES.USER;
};

export const hasPermission = (user, permission) => {
  const role = getUserRole(user);
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
};

export const hasAnyPermission = (user, permissions) => {
  return permissions.some(permission => hasPermission(user, permission));
};

export const hasAllPermissions = (user, permissions) => {
  return permissions.every(permission => hasPermission(user, permission));
};

export const isAdmin = (user) => {
  return getUserRole(user) === USER_ROLES.ADMIN;
};

export const canAccessRoute = (user, requiredPermissions = []) => {
  if (requiredPermissions.length === 0) return true;
  return hasAllPermissions(user, requiredPermissions);
};
