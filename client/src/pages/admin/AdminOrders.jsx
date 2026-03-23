import React, { useEffect, useState } from "react";
import api from "../../utils/api";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/api/orders`);
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/api/orders/${id}/status`, { status });
      setOrders(orders.map((o) => (o._id === id ? { ...o, status } : o)));
    } catch (err) {
      alert("Không thể cập nhật trạng thái");
    }
  };

  if (loading) return <div className="animate-pulse">Đang tải đơn hàng...</div>;

  return (
    <div>
      <h2 className="text-2xl font-black mb-6">Đơn hàng</h2>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs text-gray-400 uppercase">
              <th>Khách hàng</th>
              <th>Thông tin</th>
              <th>Tổng</th>
              <th>Ngày</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="py-4">
                  <div className="font-bold">{order.user?.name || "N/A"}</div>
                  <div className="text-xs text-gray-400">
                    {order.user?.email || "Khách"}
                  </div>
                </td>
                <td className="py-4">{order.orderItems.length} sản phẩm</td>
                <td className="py-4 font-black text-orange-600">
                  {(order.totalPrice || 0).toLocaleString("vi-VN")}đ
                </td>
                <td className="py-4 text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                </td>
                <td className="py-4">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    className="px-3 py-1 rounded-lg"
                  >
                    <option>Chờ xử lý</option>
                    <option>Đang giao</option>
                    <option>Đã giao</option>
                    <option>Đã hủy</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
