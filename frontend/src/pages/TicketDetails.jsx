import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

export default function TicketDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [agents, setAgents] = useState([]);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const [ticketRes, commentsRes] = await Promise.all([
        api.get(`/tickets/${id}`),
        api.get(`/tickets/${id}/comments`)
      ]);
      setTicket(ticketRes.data);
      setComments(commentsRes.data);
      if (user.role === 'AGENT') {
        const agentsRes = await api.get('/users');
        setAgents(agentsRes.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load ticket');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function addComment(e) {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await api.post(`/tickets/${id}/comments`, { comment });
      setComment('');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add comment');
    }
  }

  async function updateTicket(patch) {
    try {
      const { data } = await api.put(`/tickets/${id}`, patch);
      setTicket(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update ticket');
    }
  }

  async function deleteTicket() {
    if (!window.confirm('Delete this ticket?')) return;
    try {
      await api.delete(`/tickets/${id}`);
      navigate(user.role === 'AGENT' ? '/agent' : '/customer');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete ticket');
    }
  }

  if (loading) return <div className="loading">Loading ticket...</div>;
  if (!ticket) return <div className="alert error">{error || 'Ticket not found'}</div>;

  return (
    <section>
      <div className="page-header">
        <div>
          <Link to={user.role === 'AGENT' ? '/agent' : '/customer'}>← Back to dashboard</Link>
          <h1>#{ticket.id} · {ticket.subject}</h1>
          <div className="inline-meta"><StatusBadge value={ticket.status} /><span>Priority: {ticket.priority}</span></div>
        </div>
        <button className="button danger" onClick={deleteTicket}>Delete</button>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="details-grid">
        <article className="card">
          <h2>Ticket</h2>
          <p className="description">{ticket.description}</p>
          <div className="detail-row"><b>Customer</b><span>{ticket.customer_name} ({ticket.customer_email})</span></div>
          <div className="detail-row"><b>Created</b><span>{new Date(ticket.created_at).toLocaleString()}</span></div>
        </article>

        <aside className="card">
          <h2>Management</h2>
          <label>Status
            <select value={ticket.status} onChange={e => updateTicket({ status: e.target.value })}>
              <option>OPEN</option><option>IN_PROGRESS</option><option>RESOLVED</option><option>CLOSED</option>
            </select>
          </label>
          <label>Priority
            <select value={ticket.priority} disabled={user.role !== 'AGENT'} onChange={e => updateTicket({ priority: e.target.value })}>
              <option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>URGENT</option>
            </select>
          </label>
          {user.role === 'AGENT' && (
            <label>Assigned agent
              <select value={ticket.assigned_to || ''} onChange={e => updateTicket({ assigned_to: e.target.value || null })}>
                <option value="">Unassigned</option>
                {agents.map(agent => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
              </select>
            </label>
          )}
        </aside>
      </div>

      <article className="card comments">
        <h2>Conversation</h2>
        <div className="comment-list">
          {comments.length ? comments.map(c => (
            <div className={`comment ${c.user_role === 'AGENT' ? 'agent-comment' : ''}`} key={c.id}>
              <div className="comment-head"><strong>{c.user_name}</strong><span>{new Date(c.created_at).toLocaleString()}</span></div>
              <p>{c.comment}</p>
            </div>
          )) : <p className="muted">No comments yet.</p>}
        </div>
        <form onSubmit={addComment} className="comment-form">
          <textarea rows="4" placeholder="Write a response..." value={comment} onChange={e => setComment(e.target.value)} />
          <button className="button">Add Comment</button>
        </form>
      </article>
    </section>
  );
}
