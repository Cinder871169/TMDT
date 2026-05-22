import { useState, useEffect, useCallback, useMemo } from "react";
import { adminApi } from "../services/adminApi";

const getLocalDateString = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export function useDashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("7days");
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return getLocalDateString(d);
  });
  const [customEndDate, setCustomEndDate] = useState(() => {
    return getLocalDateString(new Date());
  });

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      // Prepare params for dashboard stats
      const statsParams = {};
      if (period === "custom" && customStartDate && customEndDate) {
        statsParams.startDate = customStartDate;
        statsParams.endDate = customEndDate;
      }

      const [statsRes, ordersRes] = await Promise.all([
        adminApi.getDashboardStats(statsParams),
        adminApi.getOrders({ limit: 10, sort: "-createdAt" }),
      ]);

      // Stats API trả về object trực tiếp
      setStats(statsRes.data);

      // Orders API trả về mảng hoặc có thể là object với property data
      const ordersData = ordersRes.data;
      setOrders(
        Array.isArray(ordersData) ? ordersData : ordersData?.data || [],
      );
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(
        err.response?.data?.message || "Không thể tải dữ liệu dashboard",
      );
    } finally {
      setLoading(false);
    }
  }, [period, customStartDate, customEndDate]);

  const loadData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Auto-fetch when period changes
  useEffect(() => {
    if (
      period !== "custom" ||
      (period === "custom" && (!customStartDate || !customEndDate))
    ) {
      fetchData();
    }
  }, [period, fetchData]);

  // Auto-fetch when custom dates change
  useEffect(() => {
    if (period === "custom" && customStartDate && customEndDate) {
      fetchData();
    }
  }, [customStartDate, customEndDate, fetchData]);

  // Computed values - trả về trực tiếp không phải callbacks
  const recentOrders = useMemo(() => {
    return orders.slice(0, 6);
  }, [orders]);

  // Transform ordersByStatus thành object để dễ truy cập
  const ordersByStatus = useMemo(() => {
    if (!stats?.ordersByStatus) return {};
    return stats.ordersByStatus.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
  }, [stats?.ordersByStatus]);

  // Chart data based on period
  const chartData = useMemo(() => {
    if (!stats) return [];

    if (period === "7days" && stats.dailyRevenue) {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = getLocalDateString(date);
        const dayData = stats.dailyRevenue.find((d) => d._id === dateStr);
        days.push({
          date: dateStr,
          label: date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
          }),
          revenue: dayData?.revenue || 0,
          orders: dayData?.orders || 0,
        });
      }
      return days;
    }

    if (period === "30days" && stats.dailyRevenue) {
      const days = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = getLocalDateString(date);
        const dayData = stats.dailyRevenue.find((d) => d._id === dateStr);
        days.push({
          date: dateStr,
          label: date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
          }),
          revenue: dayData?.revenue || 0,
          orders: dayData?.orders || 0,
        });
      }
      return days;
    }

    if (period === "1year" && stats.monthlyRevenue) {
      return stats.monthlyRevenue.map((item) => ({
        date: item._id,
        label: item._id,
        revenue: item.revenue,
        orders: item.orders,
      }));
    }

    if (period === "5years" && stats.yearlyRevenue) {
      return stats.yearlyRevenue.map((item) => ({
        date: item._id,
        label: item._id,
        revenue: item.revenue,
        orders: item.orders,
      }));
    }

    if (period === "custom" && stats.customRevenue) {
      if (customStartDate && customEndDate) {
        const startParts = customStartDate.split("-");
        const endParts = customEndDate.split("-");
        if (startParts.length === 3 && endParts.length === 3) {
          const start = new Date(Number(startParts[0]), Number(startParts[1]) - 1, Number(startParts[2]));
          const end = new Date(Number(endParts[0]), Number(endParts[1]) - 1, Number(endParts[2]));
          const days = [];
          const current = new Date(start);
          while (current <= end) {
            const yyyy = current.getFullYear();
            const mm = String(current.getMonth() + 1).padStart(2, "0");
            const dd = String(current.getDate()).padStart(2, "0");
            const dateStr = `${yyyy}-${mm}-${dd}`;
            const dayData = stats.customRevenue.find((d) => d._id === dateStr);
            days.push({
              date: dateStr,
              label: `${dd}/${mm}/${yyyy}`,
              revenue: dayData?.revenue || 0,
              orders: dayData?.orders || 0,
            });
            current.setDate(current.getDate() + 1);
          }
          return days;
        }
      }

      // Fallback in case custom dates are not set yet
      return stats.customRevenue.map((item) => {
        const parts = item._id.split("-");
        const label = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : item._id;
        return {
          date: item._id,
          label: label,
          revenue: item.revenue,
          orders: item.orders,
        };
      });
    }

    return [];
  }, [stats, period, customStartDate, customEndDate]);

  // Status breakdown cho UI
  const statusBreakdown = useMemo(() => {
    const statusObj = ordersByStatus;
    return [
      {
        status: "Chờ xử lý",
        count: statusObj["Chờ xử lý"] || 0,
        color: "#f59e0b",
      },
      {
        status: "Đang giao",
        count: statusObj["Đang giao"] || 0,
        color: "#3b82f6",
      },
      { status: "Đã giao", count: statusObj["Đã giao"] || 0, color: "#22c55e" },
      { status: "Đã hủy", count: statusObj["Đã hủy"] || 0, color: "#ef4444" },
    ];
  }, [ordersByStatus]);

  const totalOrdersCount = useMemo(() => {
    return Object.values(ordersByStatus).reduce((a, b) => a + b, 0);
  }, [ordersByStatus]);

  return {
    stats,
    orders,
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
  };
}

export default useDashboard;
