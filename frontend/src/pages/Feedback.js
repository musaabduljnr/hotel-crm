import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Feedback() {
  const { token } = useAuth();
  const [feedback, setFeedback] = useState([]);
  const [summary, setSummary] = useState({ total: 0, average_rating: 0 });
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ guest_id: '', rating: 5, comment: '' });
  const [saving, setSaving] = useState(false);

  async function loadAll() {
    setLoading(true);
    try {
      const [feedbackData, summaryData, guestData] = await Promise.all([
        api.get('/feedback', token),
        api.get('/feedback/summary', token),
        api.get('/guests', token)
      ]);
      setFeedback(feedbackData);
      setSummary(summaryData);
      setGuests(guestData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/feedback', form, token);
      setShowModal(false);
      setForm({ guest_id: '', rating: 5, comment: '' });
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Feedback</h1>
          <p>See how guests rate their stay and record new feedback.</p>
        </div>
        <button className="btn btn-accent" onClick={() => { setShowModal(true); setError(''); }}>+ Record feedback</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stat-grid">
        <div className="stat-card accent">
          <div className="stat-label">Average rating</div>
          <div className="stat-value">{summary.average_rating || '—'} / 5</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total responses</div>
          <div className="stat-value">{summary.total || 0}</div>
        </div>
      </div>

      <div className="panel">
        {loading ? (
          <p>Loading feedback…</p>
        ) : feedback.length === 0 ? (
          <div className="empty-state">No feedback recorded yet.</div>
        ) : (
          <table>
            <thead>
              <tr><th>Guest</th><th>Rating</th><th>Comment</th><th>Date</th></tr>
            </thead>
            <tbody>
              {feedback.map((f) => (
                <tr key={f.id}>
                  <td>{f.guest_name}</td>
                  <td>{'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}</td>
                  <td style={{ color: 'var(--ink-soft)' }}>{f.comment || '—'}</td>
                  <td>{new Date(f.created_at).toLocaleDateString()}</td>
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
              <h2 style={{ margin: 0, fontSize: 18 }}>Record feedback</h2>
              <button className="icon-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="field">
                <label>Guest</label>
                <select required value={form.guest_id} onChange={(e) => setForm({ ...form, guest_id: e.target.value })}>
                  <option value="">Select a guest…</option>
                  {guests.map((g) => <option key={g.id} value={g.id}>{g.full_name}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Rating</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className={`star${n <= form.rating ? ' filled' : ''}`}
                      onClick={() => setForm({ ...form, rating: n })}
                    >★</span>
                  ))}
                </div>
              </div>
              <div className="field">
                <label>Comment</label>
                <textarea value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} placeholder="What did the guest say?" />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save feedback'}</button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
