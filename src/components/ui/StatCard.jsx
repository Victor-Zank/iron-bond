import './StatCard.css';

export default function StatCard({ num, label, accent = false }) {
  return (
    <div className="stat-card">
      <div className={`stat-num${accent ? ' accent' : ''}`}>{num}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
