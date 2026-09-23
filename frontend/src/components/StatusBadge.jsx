export default function StatusBadge({ value }) {
  return <span className={`badge badge-${value.toLowerCase()}`}>{value.replace('_', ' ')}</span>;
}
