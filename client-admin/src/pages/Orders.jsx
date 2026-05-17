import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../services/adminApi";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import { ShoppingCart, Eye, Search, Filter } from "lucide-react";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadOrders = async () => {
    try {
      setLoading(true);
      const { data } = await adminApi.getOrders();
      setOrders(data);
    } catch (err) {
      console.error("Lỗi tải đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusBadge = (status) => {
    const badges = {
      "Chờ xử lý": "badge-pending",
      "Đang giao": "badge-processing",
      "Đã giao": "badge-delivered",
      "Đã hủy": "badge-cancelled",
    };
    return badges[status] || "badge-pending";
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone?.includes(searchTerm) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: orders.length,
    "Chờ xử lý": orders.filter((o) => o.status === "Chờ xử lý").length,
    "Đang giao": orders.filter((o) => o.status === "Đang giao").length,
    "Đã giao": orders.filter((o) => o.status === "Đã giao").length,
    "Đã hủy": orders.filter((o) => o.status === "Đã hủy").length,
  };

  const statusColors = {
    all: "blue",
    "Chờ xử lý": "orange",
    "Đang giao": "purple",
    "Đã giao": "green",
    "Đã hủy": "red",
  };

  const columns = [
    {
      key: "_id",
      label: "Mã đơn",
      render: (val) => (
        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
          #{val.slice(-8)}
        </span>
      ),
    },
    {
      key: "user",
      label: "Khách hàng",
      render: (val) => (
        <div>
          <div className="font-semibold">{val?.name || "N/A"}</div>
          <div className="text-muted text-xs">{val?.email}</div>
        </div>
      ),
    },
    {
      key: "orderItems",
      label: "Sản phẩm",
      render: (val) => (
        <div className="flex -space-x-1">
          {val.slice(0, 3).map((item, i) => (
            <img
              key={i}
              src={item.image || 'https://placehold.co/28x28/cccccc/666666?text=S'}
              alt=""
              style={{ width: "28px", height: "28px", objectFit: "cover" }}
              className="rounded-full border-2 border-white bg-slate-100"
              title={item.name}
              onError={(e) => {
                e.target.src = 'https://placehold.co/28x28/cccccc/666666?text=S';
              }}
            />
          ))}
          {val.length > 3 && (
            <span style={{ width: "28px", height: "28px" }} className="rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold">
              +{val.length - 3}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "totalPrice",
      label: "Tổng tiền",
      sortable: true,
      render: (val) => (
        <span className="font-bold">{val?.toLocaleString("vi-VN")}đ</span>
      ),
    },
    {
      key: "createdAt",
      label: "Ngày đặt",
      sortable: true,
      render: (val) => (
        <span className="text-sm">
          {new Date(val).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (val) => (
        <span className={`badge ${getStatusBadge(val)}`}>{val}</span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (_, item) => (
        <Link
          to={`/orders/${item._id}`}
          className="btn btn-secondary btn-sm"
        >
          <Eye size={14} />
        </Link>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Quản lý đơn hàng"
        subtitle={`Tổng cộng ${filteredOrders.length} đơn hàng`}
      />

      {/* Stats */}
      <div className="stats-grid mb-6">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div
            key={status}
            className="stat-card cursor-pointer hover:border-orange-200"
            onClick={() => setStatusFilter(status)}
            style={{
              borderColor: statusFilter === status ? "#f97316" : undefined,
            }}
          >
            <div className={`stat-icon ${statusColors[status]}`}>
              <ShoppingCart size={24} />
            </div>
            <div>
              <p className="stat-label">
                {status === "all" ? "Tổng đơn" : status}
              </p>
              <p className="stat-value">{count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="card mb-6">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              className="form-input pl-11"
              placeholder="Tìm kiếm đơn hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="form-input w-auto"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Chờ xử lý">Chờ xử lý</option>
            <option value="Đang giao">Đang giao</option>
            <option value="Đã giao">Đã giao</option>
            <option value="Đã hủy">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <DataTable
        columns={columns}
        data={filteredOrders}
        loading={loading}
        emptyTitle="Không có đơn hàng nào"
        emptyText={
          searchTerm || statusFilter !== "all"
            ? "Không tìm thấy đơn hàng phù hợp"
            : "Chưa có đơn hàng nào được tạo"
        }
        pageSize={10}
      />
    </div>
  );
}
