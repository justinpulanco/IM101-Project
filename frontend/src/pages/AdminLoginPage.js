import React from 'react';

function AdminLoginPage({ 
  adminEmail,
  setAdminEmail,
  adminPassword,
  setAdminPassword,
  onAdminLogin,
  onBackToCustomer
}) {
  return (
    <div className="admin-login-screen">
      <div className="admin-login-container">
        <h1>🔐 Admin Login</h1>
        <form onSubmit={onAdminLogin}>
          <input 
            type="email" 
            placeholder="Email" 
            value={adminEmail} 
            onChange={(e) => setAdminEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={adminPassword} 
            onChange={(e) => setAdminPassword(e.target.value)} 
            required 
          />
          <button type="submit" className="admin-login-btn">Login as Admin</button>
        </form>
        <button onClick={onBackToCustomer} className="cancel-admin">Back to Customer</button>
      </div>
    </div>
  );
}

export default AdminLoginPage;
