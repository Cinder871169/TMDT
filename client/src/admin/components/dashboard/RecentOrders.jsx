import { Link } from "react-router-dom";
import { Clock, Truck, CheckCircle, XCircle, ArrowRight } from "lucide-react";

const statusConfig = {
  "Chờ xử lý": { icon: Clock, color: "#f59e0b", bgColor: "#fef3c7" },
  "Đang giao": { icon: Truck, color: "#3b82f6", bgColor: "#dbeafe" },
  "Đã giao": { icon: CheckCircle, color: "#22c55e", bgColor: "#dcfce7" },
  "Đã hủy": { icon: XCircle, color: "#ef4444", bgColor: "#fee2e2" },
};

export function RecentOrders({ orders, loading }) {
  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <div className="skeleton-text w-32" />
        </div>
        <div className="order-list">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="order-item">
              <div className="order-avatar skeleton" />
              <div className="order-info">
                <div className="skeleton-text w-16" style={{ height: 12 }} />
                <div className="skeleton-text w-24 mt-2" style={{ height: 11 }} />
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
        <h3 className="dashboard-card-title">Đơn hàng gần đây</h3>
        <Link to="/orders" className="view-all-link">
          Xem tất cả <ArrowRight size={14} />
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3 className="empty-state-title">Chưa có đơn hàng nào</h3>
          <p className="empty-state-text">Đơn hàng sẽ xuất hiện ở đây khi có khách đặt</p>
        </div>
      ) : (
        <div className="order-list">
          {orders.map((order) => {
            const config = statusConfig[order.status] || statusConfig["Chờ xử lý"];
            const Icon = config.icon;

            return (
              <div key={order._id} className="order-item">
                <div
                  className="order-avatar"
                  style={{ background: config.bgColor, color: config.color }}
                >
                  {order.user?.name?.charAt(0)?.toUpperCase() || "G"}
                </div>
                <div className="order-info">
                  <span className="order-id">
                    #{order._id.slice(-6).toUpperCase()}
                  </span>
                  <span className="order-customer">
                    {order.user?.name || "Khách vãng lai"}
                  </span>
                </div>
                <div className="order-meta">
                  <span className="order-amount">{formatCurrency(order.totalPrice)}</span>
                  <span className="order-date">{formatDate(order.createdAt)}</span>
                </div>
                <span
                  className="order-status-badge"
                  style={{ background: config.bgColor, color: config.color }}
                >
                  <Icon size={10} />
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RecentOrders;
