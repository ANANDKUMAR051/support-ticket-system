export default function TicketFilters({ filters, setFilters, agent = false }) {
  function update(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }));
  }

  return (
    <div className="filters card">
      <input
        value={filters.search}
        onChange={e => update('search', e.target.value)}
        placeholder="Search subject or description..."
      />

      <select value={filters.status} onChange={e => update('status', e.target.value)}>
        <option value="">All statuses</option>
        <option value="OPEN">Open</option>
        <option value="IN_PROGRESS">In progress</option>
        <option value="RESOLVED">Resolved</option>
        <option value="CLOSED">Closed</option>
      </select>

      <select value={filters.priority} onChange={e => update('priority', e.target.value)}>
        <option value="">All priorities</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
        <option value="URGENT">Urgent</option>
      </select>

      {agent && (
        <select value={filters.sort} onChange={e => update('sort', e.target.value)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="updated">Recently updated</option>
          <option value="priority">Priority</option>
        </select>
      )}
    </div>
  );
}
