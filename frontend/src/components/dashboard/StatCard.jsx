export default function StatCard({ title, value, subtitle, accent = 'blue', trend }) {
  return (
    <div className={`dashboard-card stat-card stat-card-${accent} h-100`}>
      <div className="dashboard-card-body d-flex flex-column justify-content-between h-100">
        <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
          <div>
            <p className="stat-card-title mb-2">{title}</p>
            <h3 className="stat-card-value mb-1">{value}</h3>
          </div>
          <span className="stat-card-dot" />
        </div>
        <div>
          <small className="stat-card-subtitle d-block">{subtitle}</small>
          {trend ? <span className="stat-card-trend mt-3 d-inline-flex">{trend}</span> : null}
        </div>
      </div>
    </div>
  );
}
