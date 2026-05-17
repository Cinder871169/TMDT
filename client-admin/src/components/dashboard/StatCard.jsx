import { RefreshCw } from "lucide-react";

export function StatCard({ title, value, subtitle, icon: Icon, gradient, onRefresh, loading }) {
  if (loading) {
    return (
      <div className="stat-card">
        <div className="stat-icon skeleton" />
        <div className="stat-content">
          <div className="skeleton-text w-3/4" />
          <div className="skeleton-text w-1/2 mt-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="stat-card">
      <div className={`stat-icon ${gradient}`}>
        <Icon size={22} />
      </div>
      <div className="stat-content">
        <p className="stat-label">{title}</p>
        <p className="stat-value">{value}</p>
        {subtitle && (
          <p className="stat-subtitle">{subtitle}</p>
        )}
      </div>
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="stat-refresh"
          title="Làm mới"
        >
          <RefreshCw size={14} />
        </button>
      )}
    </div>
  );
}

export default StatCard;
