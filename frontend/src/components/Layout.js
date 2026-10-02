import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const links = [
    { to: '/dashboard', label: 'Dashboard', adminOnly: true },
    { to: '/guests', label: 'Guests' },
    { to: '/bookings', label: 'Bookings' },
    { to: '/complaints', label: 'Complaints' },
    { to: '/feedback', label: 'Feedback' }
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">H</div>
          <div className="sidebar-brand-name">Haven CRM</div>
        </div>

        <nav>
          {links
            .filter((link) => !link.adminOnly || user?.role === 'admin')
            .map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <strong>{user?.full_name}</strong>
            <span>{user?.role === 'admin' ? 'Administrator' : 'Staff'}</span>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ width: '100%' }} onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
