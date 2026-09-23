import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function CreateTicket() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ subject: '', description: '', priority: 'MEDIUM' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/tickets', form);
      navigate(`/tickets/${data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create ticket');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <div className="page-header">
        <div><h1>Create Ticket</h1><p className="muted">Tell the support team what you need help with.</p></div>
      </div>
      <form className="card form-card" onSubmit={submit}>
        {error && <div className="alert error">{error}</div>}
        <label>Subject<input required maxLength="255" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} /></label>
        <label>Description<textarea required rows="7" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></label>
        <label>Priority
          <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
            <option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>URGENT</option>
          </select>
        </label>
        <div className="actions"><button className="button" disabled={loading}>{loading ? 'Creating...' : 'Create Ticket'}</button></div>
      </form>
    </section>
  );
}
