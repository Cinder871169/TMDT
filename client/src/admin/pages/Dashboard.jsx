import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, AlertCircle, Plus } from "lucide-react";
import useDashboard from "../hooks/useDashboard";
import {
  RevenueChart,
  OrderStatus,
  RecentOrders,
} from "../components/dashboard";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  CheckCircle,
  Truck,
  XCircle,
  Eye,
} from "lucide-react";

export default function Dashboard() {
  const {
    stats,
    recentOrders,
    chartData,
    statusBreakdown,
    totalOrdersCount,
    loading,
    error,
    loadData,
    period,
    setPeriod,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
  } = useDashboard();

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);

  const statCards = useMemo(() => {
    if (!stats) return [];
    return [
      {
        title: "Tổng doanh thu",
        value: formatCurrency(stats.totalRevenue),
        subtitle: `${formatCurrency(stats.totalRevenue / (stats.totalOrders || 1) || 0)} / đơn`,
        icon: DollarSign,
        gradient: "orange",
        changeType: "neutral",
      },
      {
        title: "Đơn hàng",
        value: (stats.totalOrders || 0).toLocaleString("vi-VN"),
        subtitle: `${statusBreakdown.find((s) => s.status === "Chờ xử lý")?.count || 0} chờ xử lý`,
        icon: ShoppingBag,
        gradient: "blue",
        changeType: "neutral",
      },
      {
        title: "Sản phẩm",
        value: (stats.totalProducts || 0).toLocaleString("vi-VN"),
        subtitle: `${stats.activeProducts || 0} đang bán`,
        icon: Package,
        gradient: "purple",
        changeType: "neutral",
      },
      {
        title: "Người dùng",
        value: (stats.totalUsers || 0).toLocaleString("vi-VN"),
        subtitle: `${stats.newUsersThisMonth || 0} tháng này`,
        icon: Users,
        gradient: "green",
        changeType: "neutral",
      },
    ];
  }, [stats, statusBreakdown]);

  const quickStats = [
    {
      label: "Đơn đã giao",
      value: statusBreakdown.find((s) => s.status === "Đã giao")?.count || 0,
      icon: CheckCircle,
      color: "green",
    },
    {
      label: "Đang giao",
      value: statusBreakdown.find((s) => s.status === "Đang giao")?.count || 0,
      icon: Truck,
      color: "blue",
    },
    {
      label: "Đã hủy",
      value: statusBreakdown.find((s) => s.status === "Đã hủy")?.count || 0,
      icon: XCircle,
      color: "red",
    },
    {
      label: "Chờ xử lý",
      value: statusBreakdown.find((s) => s.status === "Chờ xử lý")?.count || 0,
      icon: Eye,
      color: "orange",
    },
  ];

  return (
    <div className="dashboard">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Chào mừng bạn quay trở lại! Đây là tổng quan cửa hàng.
          </p>
        </div>
        <div className="page-actions">
          <button
            onClick={loadData}
            disabled={loading}
            className="btn btn-secondary"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Làm mới
          </button>
          <Link to="/admin/products/create" className="btn btn-primary">
            <Plus size={16} />
            Thêm sản phẩm
          </Link>
        </div>
      </div>

      {error && (
        <div
          className="card mb-6"
          style={{ borderLeft: "4px solid var(--danger)" }}
        >
          <div className="card-body flex items-center gap-3">
            <AlertCircle size={20} style={{ color: "var(--danger)" }} />
            <span style={{ color: "var(--danger)" }}>{error}</span>
            <button
              onClick={loadData}
              className="btn btn-sm btn-secondary"
              style={{ marginLeft: "auto" }}
            >
              Thử lại
            </button>
          </div>
        </div>
      )}

      <div className="stats-grid">
        {loading && !stats ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="stat-card">
                <div className="stat-icon skeleton" />
                <div className="stat-content">
                  <div className="skeleton-text w-3/4" style={{ height: 12 }} />
                  <div
                    className="skeleton-text w-1/2 mt-2"
                    style={{ height: 24 }}
                  />
                  <div
                    className="skeleton-text w-2/3 mt-2"
                    style={{ height: 11 }}
                  />
                </div>
              </div>
            ))}
          </>
        ) : (
          statCards.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className={`stat-icon ${stat.gradient}`}>
                <stat.icon size={22} />
              </div>
              <div className="stat-content">
                <p className="stat-label">{stat.title}</p>
                <p className="stat-value">{stat.value}</p>
                <span className={`stat-change ${stat.changeType}`}>
                  {stat.subtitle}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-2">
        <RevenueChart
          data={chartData}
          loading={loading}
          period={period}
          setPeriod={setPeriod}
          customStartDate={customStartDate}
          setCustomStartDate={setCustomStartDate}
          customEndDate={customEndDate}
          setCustomEndDate={setCustomEndDate}
        />
        <OrderStatus
          statusBreakdown={statusBreakdown}
          totalCount={totalOrdersCount}
          loading={loading}
        />
      </div>

      <div className="mb-6">
        <RecentOrders orders={recentOrders} loading={loading} />
      </div>

      <div className="grid grid-4">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card">
                <div className="card-body">
                  <div className="flex items-center gap-3">
                    <div className="stat-icon skeleton" />
                    <div>
                      <div
                        className="skeleton-text w-20"
                        style={{ height: 12 }}
                      />
                      <div
                        className="skeleton-text w-12 mt-2"
                        style={{ height: 20 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          quickStats.map((item, index) => (
            <div key={index} className="card">
              <div className="card-body">
                <div className="flex items-center gap-3">
                  <div className={`stat-icon ${item.color}`}>
                    <item.icon size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-muted">{item.label}</p>
                    <p className="text-lg font-bold">{item.value}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
