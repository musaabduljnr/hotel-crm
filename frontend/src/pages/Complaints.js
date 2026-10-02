import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const emptyForm = { guest_id: '', subject: '', description: '' };

export default function Complaints() {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [respondingId, setRespondingId] = useState(null);
  const [responseText, setResponseText] = useState('');

  async function loadAll() {
    setLoading(true);
    try {
      const [complaintData, guestData] = await Promise.all([
        api.get('/complaints', token),
        api.get('/guests', token)
      ]);
      setComplaints(complaintData);
      setGuests(guestData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmitComplaint(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/complaints', form, token);
      setShowModal(false);
      setForm(emptyForm);
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function openRespond(c) {
    setRespondingId(c.id);
    setResponseText(c.admin_response || '');
  }

  async function handleRespond(id, status) {
    try {
      await api.put(`/complaints/${id}/respond`, { admin_response: responseText, status }, token);
      setRespondingId(null);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Complaints</h1>
          <p>Log guest issues and track them through to resolution.</p>
        </div>
        <button className="btn btn-accent" onClick={() => { setShowModal(true); setError(''); }}>+ Log complaint</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="panel">
        {loading ? (
          <p>Loading complaints…</p>
        ) : complaints.length === 0 ? (
          <div className="empty-state">No complaints logged. Great sign — or nobody's checked yet.</div>
        ) : (
          <table>
            <thead>
              <tr><th>Guest</th><th>Subject</th><th>Status</th><th>Response</th><th></th></tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c.id}>
                  <td>{c.guest_name}</td>
                  <td>
                    <strong>{c.subject}</strong>
                    <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>{c.description}</div>
                  </td>
                  <td><span className={`badge badge-${c.status}`}>{c.status.replace('_', ' ')}</span></td>
                  <td style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{c.admin_response || '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openRespond(c)}>Respond</button>
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
              <h2 style={{ margin: 0, fontSize: 18 }}>Log a complaint</h2>
              <button className="icon-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmitComplaint}>
              <div className="field">
                <label>Guest</label>
                <select required value={form.guest_id} onChange={(e) => setForm({ ...form, guest_id: e.target.value })}>
                  <option value="">Select a guest…</option>
                  {guests.map((g) => <option key={g.id} value={g.id}>{g.full_name} — {g.phone}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Subject</label>
                <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Noisy air conditioning" />
              </div>
              <div className="field">
                <label>Details</label>
                <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue…" />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Submitting…' : 'Submit complaint'}</button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {respondingId && (
        <div className="modal-overlay" onClick={() => setRespondingId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ margin: 0, fontSize: 18 }}>Respond to complaint</h2>
              <button className="icon-btn" onClick={() => setRespondingId(null)}>×</button>
            </div>
            <div className="field">
              <label>Response</label>
              <textarea value={responseText} onChange={(e) => setResponseText(e.target.value)} placeholder="Let the guest know how this was resolved…" />
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" onClick={() => handleRespond(respondingId, 'in_progress')}>Save as in progress</button>
              <button className="btn btn-accent" onClick={() => handleRespond(respondingId, 'resolved')}>Mark resolved</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
