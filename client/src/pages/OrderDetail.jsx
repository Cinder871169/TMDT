import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate, Link, useParams } from "react-router-dom";

export default function OrderDetail() {
  const { userInfo } = useAuthStore();
  const navigate = useNavigate();
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
      return;
    }

    const fetchOrder = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/orders/${id}`,
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
    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/orders/${id}/cancel`,
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center font-bold animate-pulse">
        Đang tải chi tiết đơn...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center text-red-500 font-bold">
        Không tìm thấy đơn hàng
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8 gap-4">
        <Link
          to="/orders"
          className="text-sm font-black uppercase tracking-widest hover:text-orange-600"
        >
          ← Quay lại đơn hàng
        </Link>
        <div className="flex items-center gap-3 bg-orange-50 text-orange-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-tighter">
          Trạng thái: {order.status}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-black mb-6">Chi tiết đơn {order._id}</h2>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
              Thông tin nhận hàng
            </p>
            <p className="mt-2 text-sm font-bold">{order.name}</p>
            <p className="mt-1 text-sm font-semibold">{order.phone}</p>
            <p className="text-sm text-gray-600 mt-1">{order.address}</p>
            {order.note && <p className="text-sm text-gray-500 italic mt-1">Ghi chú: {order.note}</p>}
          </div>
          <div className="md:col-span-2">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
              Tóm tắt
            </p>
            <div className="mt-3 flex justify-between text-sm">
              <span>Tổng tiền</span>
              <span className="font-black text-orange-600">
                {order.totalPrice?.toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {order.orderItems?.map((item, idx) => (
            <div
              key={`${item.product || item._id || idx}-${item.size || ""}-${item.color || ""}`}
              className="flex gap-4 border border-gray-50 rounded-2xl p-4"
            >
              <img
                src={item.image}
                alt=""
                className="w-20 h-20 object-cover rounded-xl border border-gray-100"
              />
              <div className="flex-1">
                <p className="font-bold">{item.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Size: {typeof item.size !== "undefined" ? item.size : "N/A"}
                </p>
                <p className="text-xs text-gray-500">
                  Color: {item.color || "N/A"}
                </p>
                <div className="mt-3 flex justify-between items-center">
                  <p className="text-sm font-black">
                    {item.price?.toLocaleString("vi-VN")}đ x {item.quantity}
                  </p>
                  <p className="text-sm font-black text-orange-600">
                    {(item.price * item.quantity)?.toLocaleString("vi-VN")}đ
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {order.status === "Chờ xử lý" && (
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={cancelOrder}
              className="px-5 py-3 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-bold"
            >
              Hủy đơn
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

