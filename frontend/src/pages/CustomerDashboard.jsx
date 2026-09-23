import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import TicketFilters from '../components/TicketFilters';
import TicketCard from '../components/TicketCard';

const initialFilters = { search: '', status: '', priority: '' };

export default function CustomerDashboard() {
  const [tickets, setTickets] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
        const { data } = await api.get('/tickets', { params });
        if (active) setTickets(data);
      } catch (err) {
        if (active) setError(err.response?.data?.message || 'Could not load tickets');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [filters]);

  return (
    <section>
      <div className="page-header">
        <div><h1>My Tickets</h1><p className="muted">Track your support requests and responses.</p></div>
        <Link className="button" to="/tickets/new">+ New Ticket</Link>
      </div>
      <TicketFilters filters={filters} setFilters={setFilters} />
      {error && <div className="alert error">{error}</div>}
      {loading ? <div className="loading">Loading tickets...</div> :
        tickets.length ? <div className="ticket-list">{tickets.map(t => <TicketCard key={t.id} ticket={t} />)}</div> :
        <div className="empty card">No tickets match your filters.</div>}
    </section>
  );
}
