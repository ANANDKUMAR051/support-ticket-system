import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import TicketFilters from '../components/TicketFilters';
import TicketCard from '../components/TicketCard';

const initialFilters = { search: '', status: '', priority: '', sort: 'newest' };

export default function AgentDashboard() {
  const [tickets, setTickets] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const [ticketResponse, agentResponse] = await Promise.all([
        api.get('/tickets', { params }),
        api.get('/users')
      ]);
      setTickets(ticketResponse.data);
      setAgents(agentResponse.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load dashboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filters]);

  const stats = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter(t => t.status === 'OPEN').length,
    progress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED').length
  }), [tickets]);

  return (
    <section>
      <div className="page-header">
        <div><h1>Agent Dashboard</h1><p className="muted">Manage and respond to customer tickets.</p></div>
      </div>

      <div className="stats">
        <div className="stat card"><span>Total</span><strong>{stats.total}</strong></div>
        <div className="stat card"><span>Open</span><strong>{stats.open}</strong></div>
        <div className="stat card"><span>In progress</span><strong>{stats.progress}</strong></div>
        <div className="stat card"><span>Resolved</span><strong>{stats.resolved}</strong></div>
      </div>

      <TicketFilters filters={filters} setFilters={setFilters} agent />
      {error && <div className="alert error">{error}</div>}
      {loading ? <div className="loading">Loading tickets...</div> :
        tickets.length ? <div className="ticket-list">{tickets.map(t => <TicketCard key={t.id} ticket={t} />)}</div> :
        <div className="empty card">No tickets match your filters.</div>}
    </section>
  );
}
