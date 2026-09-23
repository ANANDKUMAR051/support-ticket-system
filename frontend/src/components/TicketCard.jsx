import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

export default function TicketCard({ ticket }) {
  return (
    <Link className="ticket-card" to={`/tickets/${ticket.id}`}>
      <div className="ticket-card-top">
        <strong>#{ticket.id} · {ticket.subject}</strong>
        <StatusBadge value={ticket.status} />
      </div>
      <p>{ticket.description.length > 140 ? `${ticket.description.slice(0, 140)}...` : ticket.description}</p>
      <div className="ticket-meta">
        <span>Priority: {ticket.priority}</span>
        <span>Customer: {ticket.customer_name}</span>
        {ticket.agent_name && <span>Agent: {ticket.agent_name}</span>}
      </div>
    </Link>
  );
}
