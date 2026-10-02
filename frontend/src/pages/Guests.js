import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const emptyForm = { full_name: '', email: '', phone: '', address: '', id_type: '', id_number: '', preferences: '' };

export default function Guests() {
  const { token } = useAuth();
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function loadGuests() {
    setLoading(true);
    try {
      const data = await api.get('/guests', token);
      setGuests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadGuests(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(guest) {
    setEditingId(guest.id);
    setForm({
      full_name: guest.full_name || '',
      email: guest.email || '',
      phone: guest.phone || '',
      address: guest.address || '',
      id_type: guest.id_type || '',
      id_number: guest.id_number || '',
      preferences: guest.preferences || ''
    });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await api.put(`/guests/${editingId}`, form, token);
      } else {
        await api.post('/guests', form, token);
      }
      setShowModal(false);
      await loadGuests();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this guest record? This cannot be undone.')) return;
    try {
      await api.del(`/guests/${id}`, token);
      await loadGuests();
    } catch (err) {
      setError(err.message);
    }
  }

  const filtered = guests.filter((g) =>
    g.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (g.phone || '').includes(search) ||
    (g.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Guests</h1>
          <p>Register new guests and keep contact details up to date.</p>
        </div>
        <button className="btn btn-accent" onClick={openCreate}>+ Register guest</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="panel">
        <div className="toolbar">
          <input
            className="search-input"
            placeholder="Search by name, phone, or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p>Loading guests…</p>
        ) : filtered.length === 0 ? (
          <div className="empty-state">No guests match your search yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>ID</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((g) => (
                <tr key={g.id}>
                  <td>{g.full_name}</td>
                  <td>{g.phone}</td>
                  <td>{g.email || '—'}</td>
                  <td>{g.id_type ? `${g.id_type} · ${g.id_number || 'n/a'}` : '—'}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(g)}>Edit</button>{' '}
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(g.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ margin: 0, fontSize: 18 }}>{editingId ? 'Edit guest' : 'Register guest'}</h2>
              <button className="icon-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="field">
                <label>Full name</label>
                <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="field">
                  <label>Phone</label>
                  <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="field">
                <label>Address</label>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="field">
                  <label>ID type</label>
                  <input placeholder="Passport, National ID…" value={form.id_type} onChange={(e) => setForm({ ...form, id_type: e.target.value })} />
                </div>
                <div className="field">
                  <label>ID number</label>
                  <input value={form.id_number} onChange={(e) => setForm({ ...form, id_number: e.target.value })} />
                </div>
              </div>
              <div className="field">
                <label>Preferences / notes</label>
                <textarea
                  placeholder="e.g. High floor, allergic to feathers, prefers late check-out"
                  value={form.preferences}
                  onChange={(e) => setForm({ ...form, preferences: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save guest'}
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
