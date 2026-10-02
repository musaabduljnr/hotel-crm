import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const emptyForm = { guest_id: '', room_id: '', check_in: '', check_out: '' };

export default function Bookings() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function loadAll() {
    setLoading(true);
    try {
      const [bookingData, guestData, roomData] = await Promise.all([
        api.get('/bookings', token),
        api.get('/guests', token),
        api.get('/bookings/rooms', token)
      ]);
      setBookings(bookingData);
      setGuests(guestData);
      setRooms(roomData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function openCreate() {
    setForm(emptyForm);
    setNotice('');
    setError('');
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const result = await api.post('/bookings', form, token);
      setNotice(`Booking confirmed — ${result.nights} night(s), total ₦${Number(result.total_amount).toLocaleString()}.`);
      setShowModal(false);
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(id, status) {
    try {
      await api.put(`/bookings/${id}/status`, { status }, token);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Bookings</h1>
          <p>Reserve rooms for guests and track reservation status.</p>
        </div>
        <button className="btn btn-accent" onClick={openCreate}>+ New booking</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {notice && <div className="alert alert-success">{notice}</div>}

      <div className="panel">
        <div className="panel-title">All reservations</div>
        {loading ? (
          <p>Loading bookings…</p>
        ) : bookings.length === 0 ? (
          <div className="empty-state">No bookings yet. Create the first one above.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Guest</th>
                <th>Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Total</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>{b.guest_name}</td>
                  <td>{b.room_number} · {b.room_type}</td>
                  <td>{b.check_in}</td>
                  <td>{b.check_out}</td>
                  <td>₦{Number(b.total_amount).toLocaleString()}</td>
                  <td><span className={`badge badge-${b.status}`}>{b.status.replace('_', ' ')}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <select
                      value={b.status}
                      onChange={(e) => handleStatusChange(b.id, e.target.value)}
                      style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 13 }}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="checked_in">Checked in</option>
                      <option value="checked_out">Checked out</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="panel">
        <div className="panel-title">Room availability</div>
        <table>
          <thead>
            <tr><th>Room</th><th>Type</th><th>Price / night</th><th>Status</th></tr>
          </thead>
          <tbody>
            {rooms.map((r) => (
              <tr key={r.id}>
                <td>{r.room_number}</td>
                <td>{r.room_type}</td>
                <td>₦{Number(r.price_per_night).toLocaleString()}</td>
                <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ margin: 0, fontSize: 18 }}>New booking</h2>
              <button className="icon-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSave}>
              <div className="field">
                <label>Guest</label>
                <select required value={form.guest_id} onChange={(e) => setForm({ ...form, guest_id: e.target.value })}>
                  <option value="">Select a guest…</option>
                  {guests.map((g) => <option key={g.id} value={g.id}>{g.full_name} — {g.phone}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Room</label>
                <select required value={form.room_id} onChange={(e) => setForm({ ...form, room_id: e.target.value })}>
                  <option value="">Select a room…</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.room_number} — {r.room_type} (₦{Number(r.price_per_night).toLocaleString()}/night)
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="field">
                  <label>Check-in</label>
                  <input type="date" required value={form.check_in} onChange={(e) => setForm({ ...form, check_in: e.target.value })} />
                </div>
                <div className="field">
                  <label>Check-out</label>
                  <input type="date" required value={form.check_out} onChange={(e) => setForm({ ...form, check_out: e.target.value })} />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Booking…' : 'Confirm booking'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
