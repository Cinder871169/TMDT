import React, { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { CheckCircle, AlertCircle, Calendar, CreditCard, ShoppingBag, Loader2, ArrowRight } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { userInfo } = useAuthStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("verifying"); // verifying, success, pending_payment, error
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  const verifyPayment = async () => {
    if (!orderId || !userInfo) return;
    
    setLoading(true);
    setError("");
    
    try {
      // 1. Fetch order details first
      const orderRes = await axios.get(`${API_BASE}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      setOrder(orderRes.data);

      // 2. Call the verify-payos endpoint to sync with PayOS
      const verifyRes = await axios.get(`${API_BASE}/api/orders/${orderId}/verify-payos`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });

      if (verifyRes.data.success || verifyRes.data.paymentStatus === "Đã thanh toán") {
        setStatus("success");
      } else {
        setStatus("pending_payment");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError(err.response?.data?.message || "Không thể xác minh thanh toán tại thời điểm này.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
      return;
    }
    if (!orderId) {
      navigate("/");
      return;
    }
    verifyPayment();
  }, [orderId, userInfo, navigate]);

  return (
    <div className="bg-gray-50 min-h-screen pt-32 pb-20 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden relative p-8 md:p-10">
        
        {/* Glow effect at top */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>

        {/* LOADING STATE */}
        {loading && (
          <div className="text-center py-10 space-y-6">
            <Loader2 className="h-16 w-16 text-emerald-500 animate-spin mx-auto" />
            <div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">Đang xác minh</h2>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">
                Vui lòng đợi giây lát, hệ thống đang đồng bộ trạng thái thanh toán từ PayOS...
              </p>
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {!loading && status === "success" && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex p-4 bg-emerald-50 rounded-full text-emerald-500 animate-bounce">
                <CheckCircle size={56} className="stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-full">
                  Thành công
                </span>
                <h2 className="text-3xl font-black text-gray-800 mt-3 mb-2">Cảm ơn bạn!</h2>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">
                  Giao dịch quét mã QR đã được PayOS xác minh thành công. Đơn hàng của bạn đã sẵn sàng xử lý.
                </p>
              </div>
            </div>

            {order && (
              <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100 space-y-3.5 text-sm">
                <div className="flex justify-between items-center text-gray-500">
                  <span className="flex items-center gap-2"><ShoppingBag size={16} /> Mã đơn hàng</span>
                  <span className="font-bold text-gray-800 tracking-wider">#{order._id.substring(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center text-gray-500">
                  <span className="flex items-center gap-2"><CreditCard size={16} /> Phương thức</span>
                  <span className="font-bold text-gray-800">Chuyển khoản QR (PayOS)</span>
                </div>
                <div className="flex justify-between items-center text-gray-500">
                  <span className="flex items-center gap-2"><Calendar size={16} /> Ngày đặt</span>
                  <span className="font-bold text-gray-800">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</span>
                </div>
                <div className="pt-3 border-t border-gray-200/60 flex justify-between items-center text-gray-800">
                  <span className="font-bold">Tổng thanh toán</span>
                  <span className="font-black text-orange-600 text-lg">{order.totalPrice?.toLocaleString("vi-VN")}đ</span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Link
                to={`/orders/${orderId}`}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl hover:bg-orange-600 active:scale-95 duration-200 transition-all font-bold flex items-center justify-center gap-2 shadow-lg shadow-gray-900/10 text-sm"
              >
                Xem chi tiết đơn hàng <ArrowRight size={16} />
              </Link>
              <Link
                to="/"
                className="w-full py-4 bg-gray-50 text-gray-700 rounded-2xl hover:bg-gray-100 font-bold flex items-center justify-center text-sm transition-all"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        )}

        {/* PENDING PAYMENT STATE (User returned before payment completed or webhook delayed) */}
        {!loading && status === "pending_payment" && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex p-4 bg-amber-50 rounded-full text-amber-500">
                <Loader2 size={56} className="animate-spin stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
                  Chờ thanh toán
                </span>
                <h2 className="text-2xl font-black text-gray-800 mt-3 mb-2">Thanh toán chưa khớp</h2>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">
                  PayOS chưa ghi nhận giao dịch của bạn. Nếu bạn đã hoàn thành chuyển khoản, vui lòng đợi một chút rồi nhấn nút đối soát lại.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={verifyPayment}
                className="w-full py-4 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 active:scale-95 duration-200 transition-all font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10 text-sm"
              >
                <Loader2 size={16} className="animate-spin" /> Thực hiện đối soát lại
              </button>
              <Link
                to={`/orders/${orderId}`}
                className="w-full py-4 bg-gray-50 text-gray-700 rounded-2xl hover:bg-gray-100 font-bold flex items-center justify-center text-sm transition-all"
              >
                Xem chi tiết đơn hàng
              </Link>
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && status === "error" && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex p-4 bg-red-50 rounded-full text-red-500">
                <AlertCircle size={56} className="stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-red-500 bg-red-50 px-3 py-1.5 rounded-full">
                  Lỗi hệ thống
                </span>
                <h2 className="text-2xl font-black text-gray-800 mt-3 mb-2">Xác minh thất bại</h2>
                <p className="text-red-500 text-sm max-w-sm mx-auto bg-red-50 p-4 rounded-2xl border border-red-100 mt-3">
                  {error}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={verifyPayment}
                className="w-full py-4 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 active:scale-95 duration-200 transition-all font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10 text-sm"
              >
                Thử lại đối soát
              </button>
              <Link
                to={`/orders/${orderId}`}
                className="w-full py-4 bg-gray-50 text-gray-700 rounded-2xl hover:bg-gray-100 font-bold flex items-center justify-center text-sm transition-all"
              >
                Về chi tiết đơn hàng
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
