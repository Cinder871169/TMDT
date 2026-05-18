import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { adminApi } from "../services/adminApi";
import PageHeader from "../components/PageHeader";
import { ArrowLeft, Package, Truck, CheckCircle, XCircle } from "lucide-react";

const statusSteps = [
  { key: "Chờ xử lý", icon: Package, color: "orange" },
  { key: "Đã xác nhận", icon: Package, color: "blue" },
  { key: "Đang giao hàng", icon: Truck, color: "blue" },
  { key: "Đã giao", icon: CheckCircle, color: "green" },
];

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const { data } = await adminApi.getOrder(id);
      setOrder(data);
    } catch (err) {
      console.error("Lỗi tải đơn hàng:", err);
      alert("Không thể tải thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!confirm(`Cập nhật trạng thái đơn hàng thành "${newStatus}"?`)) return;

    try {
      setUpdating(true);
      await adminApi.updateOrderStatus(id, newStatus);
      alert("Cập nhật trạng thái thành công!");
      loadOrder();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi cập nhật trạng thái");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      "Chờ xử lý": "badge-pending",
      "Đã xác nhận": "badge-processing",
      "Đang giao hàng": "badge-processing",
      "Đang giao": "badge-processing",
      "Đã giao": "badge-delivered",
      "Đã hủy": "badge-cancelled",
    };
    return badges[status] || "badge-pending";
  };

  const getCurrentStep = (status) => {
    const index = statusSteps.findIndex((s) => s.key === status);
    return index >= 0 ? index : 0;
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="card">
        <div className="empty-state">
          <h3 className="empty-state-title">Không tìm thấy đơn hàng</h3>
          <Link to="/orders" className="btn btn-primary mt-4">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Đơn hàng #${order._id.slice(-8)}`}
        breadcrumbs={["Đơn hàng", "Chi tiết"]}
        actions={
          <Link to="/orders" className="btn btn-secondary">
            <ArrowLeft size={18} /> Quay lại
          </Link>
        }
      />

      <div className="grid-2 gap-6">
        {/* Order Info */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Thông tin đơn hàng</h2>
            <span className={`badge ${getStatusBadge(order.status)}`}>
              {order.status}
            </span>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b">
                <span className="text-muted">Mã đơn hàng</span>
                <span className="font-mono font-semibold">
                  #{order._id.slice(-8)}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-muted">Ngày đặt</span>
                <span className="font-semibold">
                  {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-muted">Tổng tiền</span>
                <span className="font-bold text-orange-600 text-lg">
                  {order.totalPrice?.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-muted">Phương thức thanh toán</span>
                <span className="font-semibold">
                  {order.paymentMethod === "cod" ? "Thanh toán khi nhận hàng (COD)" :
                   order.paymentMethod === "vietqr" ? "Quét mã QR (VietQR)" :
                   order.paymentMethod === "banking" ? "Chuyển khoản ngân hàng" :
                   order.paymentMethod || "COD"}
                </span>
              </div>
              {order.paymentStatus && (
                <div className="flex justify-between py-3 border-b">
                  <span className="text-muted">Trạng thái thanh toán</span>
                  <span className={`font-semibold ${order.paymentStatus === "Đã thanh toán" ? "text-green-600" : "text-yellow-600"}`}>
                    {order.paymentStatus}
                  </span>
                </div>
              )}
              {order.address && (
                <div className="flex justify-between py-3 border-b">
                  <span className="text-muted shrink-0 mr-4">Giao hàng đến</span>
                  <div className="text-right max-w-xs">
                    <div className="font-bold">{order.name}</div>
                    <div className="font-semibold">{order.phone}</div>
                    <div className="text-sm mt-1">{order.address}</div>
                    {order.note && (
                      <div className="text-sm text-gray-500 italic mt-1">Ghi chú: {order.note}</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Status Timeline */}
            {order.status !== "Đã hủy" && (
              <div className="mt-6">
                <h3 className="font-semibold mb-4">Cập nhật trạng thái</h3>
                <div className="flex gap-2">
                  {statusSteps.map((step, index) => {
                    const currentStep = getCurrentStep(order.status);
                    const isActive = index <= currentStep;
                    const isCurrent = index === currentStep;

                    return (
                      <button
                        key={step.key}
                        onClick={() => handleStatusUpdate(step.key)}
                        disabled={updating || isCurrent}
                        className={`flex-1 p-3 rounded-xl border-2 transition-all ${isActive
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 bg-gray-50"
                          } ${!isCurrent && isActive ? "cursor-pointer hover:border-orange-300" : ""}`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive
                              ? "bg-orange-500 text-white"
                              : "bg-gray-200 text-gray-400"
                              }`}
                          >
                            <step.icon size={20} />
                          </div>
                          <span className="text-xs font-semibold">{step.key}</span>
                        </div>
                      </button>
                    );
                  })}
                  {order.status !== "Đã giao" && (
                    <button
                      onClick={() => handleStatusUpdate("Đã hủy")}
                      disabled={updating}
                      className="p-3 rounded-xl border-2 border-red-200 bg-red-50 hover:border-red-400 transition-all"
                      title="Hủy đơn hàng"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-500 text-white">
                          <XCircle size={20} />
                        </div>
                        <span className="text-xs font-semibold text-red-600">
                          Hủy
                        </span>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Customer Info */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Thông tin khách hàng</h2>
            {order.isGuestOrder && (
              <span className="badge badge-pending">Khách vãng lai</span>
            )}
          </div>
          <div className="card-body">
            {/* Hiển thị thông tin từ User nếu có, ngược lại hiển thị thông tin từ Order */}
            {order.user ? (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 shrink-0 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-xl font-bold">
                    {order.user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <div className="font-semibold text-lg">
                      {order.user.name || "N/A"}
                    </div>
                    <div className="text-muted">{order.user.email}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {order.user.phone && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted">Số điện thoại</span>
                      <span className="font-semibold">{order.user.phone}</span>
                    </div>
                  )}
                  {order.user.address && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted">Địa chỉ</span>
                      <span className="font-semibold text-right max-w-xs">
                        {order.user.address}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted">Ngày đăng ký</span>
                    <span className="font-semibold">
                      {order.user.createdAt
                        ? new Date(order.user.createdAt).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Guest Order - hiển thị thông tin từ order */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 shrink-0 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-xl font-bold">
                    {order.name?.charAt(0)?.toUpperCase() || "G"}
                  </div>
                  <div>
                    <div className="font-semibold text-lg">
                      {order.name || "Khách vãng lai"}
                    </div>
                    <div className="text-muted">
                      {order.guestEmail || "Không có email"}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted">Số điện thoại</span>
                    <span className="font-semibold">{order.phone}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted">Địa chỉ giao hàng</span>
                    <span className="font-semibold text-right max-w-xs">
                      {order.address}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted">Loại đơn hàng</span>
                    <span className="font-semibold">
                      <span className="badge badge-pending">Khách vãng lai (Guest)</span>
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="card mt-6">
        <div className="card-header">
          <h2 className="card-title">Sản phẩm đã đặt</h2>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {order.orderItems?.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{item.name}</div>
                  <div className="text-sm text-muted truncate">
                    Size: {item.size} | Màu: {item.color}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">
                    {item.price?.toLocaleString("vi-VN")}đ
                  </div>
                  <div className="text-sm text-muted">x{item.quantity}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="mt-6 pt-6 border-t">
            <div className="space-y-2 max-w-sm ml-auto">
              <div className="flex justify-between">
                <span className="text-muted">Tạm tính</span>
                <span>
                  {(
                    order.totalPrice -
                    (order.shippingFee || 0) +
                    (order.discount || 0)
                  )?.toLocaleString("vi-VN")}
                  đ
                </span>
              </div>
              {order.shippingFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted">Phí vận chuyển</span>
                  <span>{order.shippingFee?.toLocaleString("vi-VN")}đ</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá</span>
                  <span>-{order.discount?.toLocaleString("vi-VN")}đ</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Tổng cộng</span>
                <span className="text-orange-600">
                  {order.totalPrice?.toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
