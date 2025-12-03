// Role Migration Utility for Existing Accounts

import { USER_ROLES } from './roleManager';

/**
 * Assign default role to user if not set
 */
export const assignDefaultRole = (user) => {
  if (!user) return null;
  
  // If user already has a role, return as is
  if (user.role) return user;
  
  // Create updated user object with default role
  const updatedUser = { ...user };
  
  // Only one admin email
  const adminEmails = [
    'admin@carrentals.com' // The only admin account
  ];
  
  // Check if admin by email or is_admin flag
  if (user.is_admin === true || user.is_admin === 1) {
    updatedUser.role = USER_ROLES.ADMIN;
  } else if (user.email && adminEmails.includes(user.email.toLowerCase())) {
    updatedUser.role = USER_ROLES.ADMIN;
  } else {
    // All other accounts are regular users
    updatedUser.role = USER_ROLES.USER;
  }
  
  return updatedUser;
};

/**
 * Migrate existing user in localStorage
 */
export const migrateLocalStorageUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    
    // If user doesn't have role, assign default
    if (!user.role) {
      const updatedUser = assignDefaultRole(user);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('✅ User role migrated:', updatedUser.role);
      return updatedUser;
    }
    
    return user;
  } catch (err) {
    console.error('Error migrating user role:', err);
    return null;
  }
};

/**
 * Batch migrate users (for admin use)
 */
export const batchMigrateUsers = async (users, apiBase, token) => {
  const results = {
    success: [],
    failed: [],
    skipped: []
  };
  
  for (const user of users) {
    // Skip if already has role
    if (user.role) {
      results.skipped.push(user);
      continue;
    }
    
    try {
      const updatedUser = assignDefaultRole(user);
      
      // Update user via API
      const response = await fetch(`${apiBase}/auth/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: updatedUser.role })
      });
      
      if (response.ok) {
        results.success.push(updatedUser);
      } else {
        results.failed.push({ user, error: 'API request failed' });
      }
    } catch (err) {
      results.failed.push({ user, error: err.message });
    }
  }
  
  return results;
};

/**
 * Check if user needs role migration
 */
export const needsRoleMigration = (user) => {
  return user && !user.role;
};

/**
 * Get migration status for all users
 */
export const getMigrationStatus = (users) => {
  const total = users.length;
  const withRole = users.filter(u => u.role).length;
  const withoutRole = total - withRole;
  
  return {
    total,
    withRole,
    withoutRole,
    percentage: total > 0 ? Math.round((withRole / total) * 100) : 0,
    needsMigration: withoutRole > 0
  };
};
