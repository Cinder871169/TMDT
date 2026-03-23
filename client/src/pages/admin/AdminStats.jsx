import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { TrendingUp, ShoppingBag, Users } from "lucide-react";

export default function AdminStats() {
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

  if (loading) return <div className="animate-pulse">Đang tải...</div>;

  const totalRevenue = orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);
  const totalOrders = orders.length;
  const totalCustomers = [...new Set(orders.map((o) => o.user?._id))].length;

  return (
    <div>
      <h2 className="text-2xl font-black mb-6">Thống kê nhanh</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
              <TrendingUp />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase">Doanh thu</p>
              <p className="text-2xl font-black">
                {totalRevenue.toLocaleString("vi-VN")}đ
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <ShoppingBag />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase">Đơn hàng</p>
              <p className="text-2xl font-black">{totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
              <Users />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase">Khách hàng</p>
              <p className="text-2xl font-black">{totalCustomers}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
