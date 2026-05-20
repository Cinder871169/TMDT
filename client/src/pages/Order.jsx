import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
import { Package, Clock, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userInfo } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
      return;
    }

    let intervalId;
    const fetchOrders = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };
        const { data } = await axios.get(
          `${API_BASE}/api/orders/myorders`,
          config,
        );
        setOrders(data);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi tải đơn hàng:", error);
        setLoading(false);
      }
    };
    fetchOrders();

    // Auto refresh to reflect admin status updates
    intervalId = setInterval(fetchOrders, 8000);

    return () => clearInterval(intervalId);
  }, [userInfo, navigate]);

  const cancelOrder = async (orderId) => {
    try {
      const { data } = await axios.put(
        `${API_BASE}/api/orders/${orderId}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        },
      );

      setOrders((prev) => prev.map((o) => (o._id === orderId ? data : o)));
    } catch (error) {
      alert(error.response?.data?.message || "Không thể hủy đơn hàng");
    }
  };

  if (loading)
    return (
      <div className="text-center mt-20 animate-pulse font-bold">
        Đang tìm đơn hàng của bạn...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-black mb-8 flex items-center gap-3">
        <Package className="text-orange-500" size={32} /> Đơn hàng của tôi
      </h1>

      {orders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl text-center shadow-sm border border-gray-100">
          <p className="text-gray-500 mb-6">
            Bạn chưa có đơn hàng nào đâu. Mua sắm ngay nhé!
          </p>
          <Link
            to="/"
            className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-500 transition-colors"
          >
            Đi đến cửa hàng
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-wrap justify-between items-center gap-4 mb-4 border-b pb-4">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                    Mã đơn hàng
                  </p>
                  <p className="font-mono text-sm text-gray-700">{order._id}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                    Ngày đặt
                  </p>
                  <p className="text-sm font-medium">
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex -space-x-3 overflow-hidden">
                  {order.orderItems.map((item, idx) => (
                    <img
                      key={idx}
                      src={item.image}
                      alt=""
                      className="inline-block h-12 w-12 rounded-full ring-2 ring-white object-cover"
                    />
                  ))}
                  {order.orderItems.length > 3 && (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xs font-bold ring-2 ring-white">
                      +{order.orderItems.length - 3}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                      Tổng tiền
                    </p>
                    <p className="text-lg font-black text-orange-600">
                      {order.totalPrice.toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-tighter">
                    <Clock size={14} /> {order.status}
                  </div>
                </div>

                {order.status === "Chờ xử lý" && (
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => cancelOrder(order._id)}
                      className="px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors text-sm font-bold"
                    >
                      Hủy đơn
                    </button>
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <Link
                    to={`/orders/${order._id}`}
                    className="px-4 py-2 bg-black text-white rounded-xl hover:bg-orange-600 transition-colors text-sm font-bold"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
