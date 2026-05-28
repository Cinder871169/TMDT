import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
import { useNavigate, Link, useParams } from "react-router-dom";
import { Package, Truck, CheckCircle, XCircle, Clock, FileText } from "lucide-react";

export default function OrderDetail() {
  const { userInfo } = useAuthStore();
  const navigate = useNavigate();
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  const handlePayOSPayment = async () => {
    if (!order) return;
    setPaying(true);
    setPayError("");
    try {
      const { data } = await axios.post(
        `${API_BASE}/api/orders/${order._id}/payment-link`,
        {},
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        setPayError("Không thể lấy liên kết thanh toán.");
      }
    } catch (err) {
      console.error(err);
      setPayError(err.response?.data?.message || "Lỗi khi kết nối cổng thanh toán.");
    } finally {
      setPaying(false);
    }
  };

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
      return;
    }

    const fetchOrder = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${API_BASE}/api/orders/${id}`,
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          },
        );
        setOrder(data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        alert(error.response?.data?.message || "Không thể tải chi tiết đơn");
      }
    };

    fetchOrder();
  }, [id, userInfo, navigate]);

  const cancelOrder = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) return;
    try {
      const { data } = await axios.put(
        `${API_BASE}/api/orders/${id}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        },
      );
      setOrder(data);
    } catch (error) {
      alert(error.response?.data?.message || "Không thể hủy đơn");
    }
  };

  const confirmReceipt = async () => {
    if (!window.confirm("Bạn xác nhận đã nhận được sản phẩm và đơn hàng đã hoàn tất?")) return;
    try {
      const { data } = await axios.put(
        `${API_BASE}/api/orders/${id}/confirm-receipt`,
        {},
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        },
      );
      setOrder(data);
      alert("Đơn hàng đã được xác nhận hoàn thành! Cảm ơn bạn đã mua hàng.");
    } catch (error) {
      alert(error.response?.data?.message || "Không thể xác nhận nhận hàng");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-24 pb-20 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle size={64} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-gray-800">Không tìm thấy đơn hàng</h2>
          <Link to="/orders" className="mt-4 inline-block text-orange-600 font-bold">← Trở về danh sách</Link>
        </div>
      </div>
    );
  }

  const isCancelled = order.status === "Đã hủy";
  const isDelivered = order.status === "Đã giao hàng" || order.status === "Đã giao";
  const isShipping = order.status === "Đang giao hàng" || order.status === "Đang giao";

  // Calculate subtotal properly considering points and vouchers
  const subtotal = order.orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <Link
            to="/profile"
            className="text-sm font-bold flex items-center gap-2 text-gray-500 hover:text-orange-600 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm"
          >
            ← Trở về hồ sơ
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 font-medium">Mã đơn hàng:</span>
            <span className="font-black text-gray-800 tracking-wider">#{order._id.substring(0, 8).toUpperCase()}</span>
          </div>
        </div>

        {/* TIMELINE */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-black text-gray-800 mb-8">Theo dõi đơn hàng</h2>

          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0 hidden sm:block"></div>

            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 sm:gap-0">

              {/* Step 1: Placed */}
              <div className="flex sm:flex-col items-center gap-4 sm:gap-2 text-center w-full sm:w-1/4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${true ? "bg-orange-500 text-white ring-4 ring-orange-50" : "bg-gray-100 text-gray-400"
                  }`}>
                  <FileText size={20} />
                </div>
                <div className="text-left sm:text-center">
                  <p className={`font-bold text-sm ${true ? "text-gray-800" : "text-gray-400"}`}>Đã đặt hàng</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</p>
                </div>
              </div>

              {/* Step 2: Processing */}
              <div className="flex sm:flex-col items-center gap-4 sm:gap-2 text-center w-full sm:w-1/4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${!isCancelled ? "bg-orange-500 text-white ring-4 ring-orange-50" : "bg-gray-100 text-gray-400"
                  }`}>
                  <Package size={20} />
                </div>
                <div className="text-left sm:text-center">
                  <p className={`font-bold text-sm ${!isCancelled ? "text-gray-800" : "text-gray-400"}`}>Đã xác nhận</p>
                </div>
              </div>

              {/* Step 3: Shipping */}
              <div className="flex sm:flex-col items-center gap-4 sm:gap-2 text-center w-full sm:w-1/4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${isShipping || isDelivered ? "bg-blue-500 text-white ring-4 ring-blue-50" : (isCancelled ? "bg-gray-100 text-gray-400" : "bg-gray-100 text-gray-400")
                  }`}>
                  <Truck size={20} />
                </div>
                <div className="text-left sm:text-center">
                  <p className={`font-bold text-sm ${isShipping || isDelivered ? "text-gray-800" : "text-gray-400"}`}>Đang giao</p>
                </div>
              </div>

              {/* Step 4: Delivered or Cancelled */}
              <div className="flex sm:flex-col items-center gap-4 sm:gap-2 text-center w-full sm:w-1/4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${isDelivered ? "bg-green-500 text-white ring-4 ring-green-50" : (isCancelled ? "bg-red-500 text-white ring-4 ring-red-50" : "bg-gray-100 text-gray-400")
                  }`}>
                  {isCancelled ? <XCircle size={20} /> : <CheckCircle size={20} />}
                </div>
                <div className="text-left sm:text-center">
                  <p className={`font-bold text-sm ${isDelivered ? "text-green-600" : (isCancelled ? "text-red-600" : "text-gray-400")}`}>
                    {isCancelled ? "Đã hủy" : "Hoàn thành"}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ORDER INFO */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">

          <div className="md:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
              <Package className="text-orange-500" /> Sản phẩm
            </h3>

            <div className="space-y-4">
              {order.orderItems?.map((item, idx) => (
                <div
                  key={`${item.product || item._id || idx}-${item.size || ""}-${item.color || ""}`}
                  className="flex gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-2xl bg-gray-50 border border-gray-100"
                  />
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="font-bold text-gray-800 text-sm md:text-base">{item.name}</p>
                    <div className="flex gap-3 text-xs text-gray-500 mt-1 mb-2 font-medium">
                      <span className="bg-gray-100 px-2 py-1 rounded-md">Size: {item.size || "N/A"}</span>
                      <span className="bg-gray-100 px-2 py-1 rounded-md">Màu: {item.color || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <p className="text-gray-500 text-sm">SL: x{item.quantity}</p>
                      <p className="font-black text-gray-800">
                        {item.price?.toLocaleString("vi-VN")}đ
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-1 space-y-8">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-black uppercase tracking-wider text-gray-500 mb-4">Giao hàng đến</h3>
              <p className="font-bold text-gray-800 mb-1">{order.name}</p>
              <p className="text-sm text-gray-600 mb-2">{order.phone}</p>
              <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">{order.address}</p>
              {order.note && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Ghi chú</p>
                  <p className="text-sm text-gray-600 italic">{order.note}</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-black uppercase tracking-wider text-gray-500 mb-4">Thanh toán</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span className="font-bold text-gray-800">{subtotal.toLocaleString("vi-VN")}đ</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="font-bold text-gray-800">
                    {order.shippingFee ? `${order.shippingFee.toLocaleString("vi-VN")}đ` : <span className="text-green-500">Miễn phí</span>}
                  </span>
                </div>

                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Mã giảm giá {order.voucherCode ? `(${order.voucherCode})` : ""}</span>
                    <span className="font-bold">-{order.discount?.toLocaleString("vi-VN")}đ</span>
                  </div>
                )}

                {order.pointsDiscount > 0 && (
                  <div className="flex justify-between text-orange-500">
                    <span>Dùng {order.pointsUsed} SneakerCoin</span>
                    <span className="font-bold">-{order.pointsDiscount?.toLocaleString("vi-VN")}đ</span>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="font-bold text-gray-800">Tổng cộng</span>
                  <span className="font-black text-orange-600 text-xl">{order.totalPrice?.toLocaleString("vi-VN")}đ</span>
                </div>
              </div>

              {order.paymentMethod === "vietqr" && order.paymentStatus === "Chưa thanh toán" && order.status !== "Đã hủy" && (
                <div className="mt-5 pt-5 border-t border-gray-100 space-y-3">
                  <div className="flex justify-between items-center bg-orange-50/50 p-3 rounded-2xl border border-orange-100 text-xs">
                    <span className="text-orange-700 font-bold">Trạng thái thanh toán:</span>
                    <span className="bg-orange-100 text-orange-800 px-2.5 py-1 rounded-full font-black">CHƯA THANH TOÁN</span>
                  </div>
                  <button
                    type="button"
                    onClick={handlePayOSPayment}
                    disabled={paying}
                    className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10 text-sm active:scale-95 duration-200 disabled:bg-gray-400 cursor-pointer"
                  >
                    {paying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang kết nối PayOS...
                      </>
                    ) : (
                      <>
                        Thanh toán ngay qua PayOS (VietQR)
                      </>
                    )}
                  </button>
                  {payError && <p className="text-xs text-red-500 text-center mt-1">{payError}</p>}
                </div>
              )}

              {order.status === "Chờ xử lý" && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={cancelOrder}
                    className="w-full py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-bold flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} /> Hủy đơn hàng này
                  </button>
                  <p className="text-xs text-center text-gray-400 mt-3">Chỉ có thể hủy khi đơn hàng đang chờ xử lý</p>
                </div>
              )}

              {isShipping && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={confirmReceipt}
                    className="w-full py-3.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-600/10 text-sm active:scale-95 duration-200"
                  >
                    <CheckCircle size={18} /> Xác nhận đã nhận hàng
                  </button>
                  <p className="text-xs text-center text-gray-500 mt-3">
                    Bấm xác nhận khi bạn đã thực tế nhận được sản phẩm và thanh toán cho shipper (nếu là COD).
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
