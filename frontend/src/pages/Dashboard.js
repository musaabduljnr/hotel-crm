import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/stats', token).then(setStats).catch((err) => setError(err.message));
  }, [token]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.full_name.split(' ')[0]}. Here's how things are running.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {stats && (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Total guests</div>
              <div className="stat-value">{stats.guest_count}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Active bookings</div>
              <div className="stat-value">{stats.active_bookings}</div>
            </div>
            <div className="stat-card warn">
              <div className="stat-label">Open complaints</div>
              <div className="stat-value">{stats.open_complaints}</div>
            </div>
            <div className="stat-card accent">
              <div className="stat-label">Avg. guest rating</div>
              <div className="stat-value">{stats.average_rating || '—'} / 5</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total revenue</div>
              <div className="stat-value">₦{Number(stats.total_revenue).toLocaleString()}</div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-title">Room status</div>
            <table>
              <thead><tr><th>Status</th><th>Rooms</th></tr></thead>
              <tbody>
                {stats.room_status.map((r) => (
                  <tr key={r.status}>
                    <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                    <td>{r.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="panel">
            <div className="panel-title">Recent bookings</div>
            {stats.recent_bookings.length === 0 ? (
              <div className="empty-state">No bookings yet.</div>
            ) : (
              <table>
                <thead><tr><th>Guest</th><th>Room</th><th>Check-in</th><th>Check-out</th><th>Status</th></tr></thead>
                <tbody>
                  {stats.recent_bookings.map((b) => (
                    <tr key={b.id}>
                      <td>{b.guest_name}</td>
                      <td>{b.room_number}</td>
                      <td>{b.check_in}</td>
                      <td>{b.check_out}</td>
                      <td><span className={`badge badge-${b.status}`}>{b.status.replace('_', ' ')}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
