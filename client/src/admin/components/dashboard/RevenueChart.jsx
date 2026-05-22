import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const formatCurrency = (value) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="tooltip-label">{label}</p>
        <p className="tooltip-value">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
          }).format(payload[0].value)}
        </p>
        <p className="tooltip-orders">{payload[0].payload.orders} đơn</p>
      </div>
    );
  }
  return null;
};

export function RevenueChart({
  data,
  loading,
  period,
  setPeriod,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
}) {
  const total = data?.reduce((sum, d) => sum + d.revenue, 0) || 0;

  if (loading) {
    return (
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <div>
            <div className="skeleton-text w-40" />
            <div className="skeleton-text w-24 mt-2" style={{ height: 12 }} />
          </div>
        </div>
        <div className="chart-skeleton" />
      </div>
    );
  }

  const getTitle = () => {
    switch (period) {
      case "7days":
        return "Doanh thu 7 ngày gần đây";
      case "30days":
        return "Doanh thu 30 ngày gần đây";
      case "1year":
        return "Doanh thu 12 tháng gần đây";
      case "5years":
        return "Doanh thu 5 năm gần đây";
      case "custom":
        if (customStartDate && customEndDate) {
          return `Doanh thu từ ${new Date(customStartDate).toLocaleDateString("vi-VN")} đến ${new Date(customEndDate).toLocaleDateString("vi-VN")}`;
        }
        return "Doanh thu tùy chỉnh";
      default:
        return "Doanh thu";
    }
  };

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <div>
          <h3 className="dashboard-card-title">{getTitle()}</h3>
          <p className="dashboard-card-subtitle">
            Tổng:{" "}
            <span className="revenue-total">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
                minimumFractionDigits: 0,
              }).format(total)}
            </span>
          </p>
        </div>
        <div className="chart-legend">
          <span className="legend-dot" />
          <span className="legend-text">Doanh thu</span>
        </div>
      </div>

      {/* Period selector */}
      <div className="period-selector">
        <button
          className={`period-btn ${period === "7days" ? "active" : ""}`}
          onClick={() => setPeriod("7days")}
        >
          7 ngày
        </button>
        <button
          className={`period-btn ${period === "30days" ? "active" : ""}`}
          onClick={() => setPeriod("30days")}
        >
          30 ngày
        </button>
        <button
          className={`period-btn ${period === "1year" ? "active" : ""}`}
          onClick={() => setPeriod("1year")}
        >
          1 năm
        </button>
        <button
          className={`period-btn ${period === "5years" ? "active" : ""}`}
          onClick={() => setPeriod("5years")}
        >
          5 năm
        </button>
        <button
          className={`period-btn ${period === "custom" ? "active" : ""}`}
          onClick={() => setPeriod("custom")}
        >
          Tùy chỉnh
        </button>
      </div>

      {/* Custom date range inputs */}
      {period === "custom" && (
        <div className="custom-date-range">
          <div className="date-input-group">
            <label htmlFor="start-date">Từ ngày:</label>
            <input
              id="start-date"
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="date-input"
            />
          </div>
          <div className="date-input-group">
            <label htmlFor="end-date">Đến ngày:</label>
            <input
              id="end-date"
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="date-input"
            />
          </div>
        </div>
      )}

      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
            />
            <YAxis
              tickFormatter={formatCurrency}
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickLine={false}
              axisLine={false}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#22c55e"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default RevenueChart;
