import React from 'react';
import { hasPermission } from '../utils/roleManager';

function ProtectedRoute({ 
  user, 
  requiredPermission, 
  children, 
  fallback = null 
}) {
  if (!requiredPermission) {
    return children;
  }

  if (!hasPermission(user, requiredPermission)) {
    return fallback || (
      <div className="access-denied">
        <h2>🔒 Access Denied</h2>
        <p>You don't have permission to access this feature.</p>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
