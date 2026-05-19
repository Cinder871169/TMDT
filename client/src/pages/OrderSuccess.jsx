import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Package } from "lucide-react";

export default function OrderSuccess() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get order data from navigation state
    const state = window.history.state?.usr;
    if (state?.order) {
      setOrder(state.order);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-center text-white">
            <CheckCircle size={70} className="mx-auto mb-4" />
            <h1 className="text-2xl font-black mb-2">
              {order?.paymentMethod === "cod"
                ? "Đặt hàng thành công!"
                : "Thanh toán thành công!"}
            </h1>
            <p className="text-green-100">
              Cảm ơn bạn đã mua hàng tại SneakerZone!
            </p>
          </div>

          {/* Order Info */}
          {order && (
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-800">Thông tin đơn hàng</h2>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Mã đơn hàng</span>
                  <span className="font-mono font-bold text-gray-800">
                    #{order._id?.slice(-8).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phương thức thanh toán</span>
                  <span className="font-medium text-gray-800">
                    {order.paymentMethod === "cod"
                      ? "Thanh toán khi nhận hàng (COD)"
                      : order.paymentMethod === "vietqr"
                        ? "Quét mã QR (VietQR)"
                        : "Chuyển khoản ngân hàng"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tổng tiền</span>
                  <span className="font-bold text-lg text-orange-600">
                    {order.totalPrice?.toLocaleString()}đ
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* COD Notice */}
          {order?.paymentMethod === "cod" && (
            <div className="p-6 bg-orange-50 border-b border-orange-100">
              <div className="flex gap-4">
                <Package className="w-8 h-8 text-orange-500 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-orange-800 mb-2">
                    Thanh toán khi nhận hàng (COD)
                  </h3>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>
                      • Bạn sẽ thanh toán{" "}
                      <strong>{order?.totalPrice?.toLocaleString()}đ</strong>{" "}
                      khi nhận được hàng
                    </li>
                    <li>• Nhân viên giao hàng sẽ liên hệ trước khi giao</li>
                    <li>• Vui lòng lưu ý điện thoại để nhận hàng</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="p-6 bg-gray-50 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 text-center"
            >
              Tiếp tục mua sắm
            </Link>

            <Link
              to="/orders"
              className="px-8 py-3 border-2 border-gray-300 font-bold rounded-xl hover:border-orange-500 hover:text-orange-500 text-center"
            >
              Xem đơn hàng của tôi
            </Link>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg
                className="w-6 h-6 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">Giao hàng nhanh</p>
          </div>
          <div className="bg-white p-4 rounded-xl text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg
                className="w-6 h-6 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">Hàng chính hãng</p>
          </div>
          <div className="bg-white p-4 rounded-xl text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg
                className="w-6 h-6 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">Đổi trả 30 ngày</p>
          </div>
        </div>
      </div>
    </div>
  );
}
