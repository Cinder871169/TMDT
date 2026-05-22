import { Clock, Truck, CheckCircle, XCircle } from "lucide-react";

const statusConfig = {
  "Chờ xử lý": { icon: Clock, color: "#f59e0b", bgColor: "#fef3c7" },
  "Đang giao": { icon: Truck, color: "#3b82f6", bgColor: "#dbeafe" },
  "Đã giao": { icon: CheckCircle, color: "#22c55e", bgColor: "#dcfce7" },
  "Đã hủy": { icon: XCircle, color: "#ef4444", bgColor: "#fee2e2" },
};

export function OrderStatus({ statusBreakdown, totalCount, loading }) {
  if (loading) {
    return (
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <div className="skeleton-text w-32" />
        </div>
        <div className="status-list">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="status-item">
              <div className="skeleton-text w-1/2" style={{ height: 12 }} />
              <div className="status-progress">
                <div className="skeleton-progress" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <h3 className="dashboard-card-title">Trạng thái đơn hàng</h3>
      </div>

      <div className="status-list">
        {statusBreakdown.map((item) => {
          const config = statusConfig[item.status] || statusConfig["Chờ xử lý"];
          const percentage = totalCount > 0 ? (item.count / totalCount) * 100 : 0;

          return (
            <div key={item.status} className="status-item">
              <div className="status-item-header">
                <div className="status-item-label">
                  <span
                    className="status-dot"
                    style={{ backgroundColor: config.color }}
                  />
                  <span>{item.status}</span>
                </div>
                <span className="status-item-count">{item.count}</span>
              </div>
              <div className="status-progress">
                <div
                  className="status-progress-bar"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: config.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="status-total">
        <span>Tổng đơn hàng</span>
        <strong>{totalCount}</strong>
      </div>
    </div>
  );
}

export default OrderStatus;
