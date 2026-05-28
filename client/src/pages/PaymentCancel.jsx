import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { AlertTriangle, ArrowRight, RefreshCw, ShoppingBag, Home, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function PaymentCancel() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { userInfo } = useAuthStore();
  
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState("");

  const handleRetryPayment = async () => {
    if (!orderId || !userInfo) return;
    
    setRetrying(true);
    setError("");
    
    try {
      const { data } = await axios.post(
        `${API_BASE}/api/orders/${orderId}/payment-link`,
        {},
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        setError("Không nhận được liên kết thanh toán mới. Vui lòng vào trang đơn hàng.");
      }
    } catch (err) {
      console.error("Retry payment error:", err);
      setError(err.response?.data?.message || "Không thể khởi tạo lại thanh toán lúc này.");
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-32 pb-20 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden relative p-8 md:p-10 text-center">
        
        {/* Top border decor */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-400 to-orange-500"></div>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="inline-flex p-4 bg-red-50 rounded-full text-red-500">
              <AlertTriangle size={56} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-red-500 bg-red-50 px-3 py-1.5 rounded-full">
                Thanh toán bị hủy
              </span>
              <h2 className="text-2xl font-black text-gray-800 mt-3 mb-2">Chưa hoàn tất thanh toán</h2>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">
                Giao dịch của bạn đã bị hủy hoặc chưa hoàn tất thành công. Đừng lo lắng, đơn hàng của bạn vẫn được lưu lại ở trạng thái **Chờ xử lý**.
              </p>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-xs bg-red-50 p-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {orderId && (
              <button
                onClick={handleRetryPayment}
                disabled={retrying}
                className="w-full py-4 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 active:scale-95 duration-200 transition-all font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10 text-sm disabled:bg-gray-400"
              >
                {retrying ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Đang chuẩn bị...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} /> Thử lại thanh toán ngay
                  </>
                )}
              </button>
            )}
            
            <Link
              to={orderId ? `/orders/${orderId}` : "/orders"}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 active:scale-95 duration-200 transition-all font-bold flex items-center justify-center gap-2 text-sm shadow-md"
            >
              <ShoppingBag size={16} /> Xem đơn hàng của tôi
            </Link>

            <Link
              to="/"
              className="w-full py-4 bg-gray-50 text-gray-700 rounded-2xl hover:bg-gray-100 font-bold flex items-center justify-center gap-2 text-sm transition-all"
            >
              <Home size={16} /> Tiếp tục mua sắm
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
