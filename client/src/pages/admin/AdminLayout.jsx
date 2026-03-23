import React, { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Settings, Package, FileText, Box, Users } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

export default function AdminLayout() {
  const { userInfo } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo) navigate("/login");
    else if (!userInfo.isAdmin) navigate("/");
  }, [userInfo, navigate]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex gap-8">
        <aside className="w-64 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-black uppercase mb-6 flex items-center gap-3">
            <Settings size={20} /> Admin
          </h3>
          <nav className="flex flex-col gap-2">
            <NavLink
              to=""
              end
              className={({ isActive }) =>
                `px-4 py-3 rounded-lg ${isActive ? "bg-blue-50 text-blue-600 font-bold" : "text-gray-700"}`
              }
            >
              <Package size={16} className="inline mr-2" /> Thống kê
            </NavLink>
            <NavLink
              to="orders"
              className={({ isActive }) =>
                `px-4 py-3 rounded-lg ${isActive ? "bg-blue-50 text-blue-600 font-bold" : "text-gray-700"}`
              }
            >
              <Box size={16} className="inline mr-2" /> Đơn hàng
            </NavLink>
            <NavLink
              to="products"
              className={({ isActive }) =>
                `px-4 py-3 rounded-lg ${isActive ? "bg-blue-50 text-blue-600 font-bold" : "text-gray-700"}`
              }
            >
              <FileText size={16} className="inline mr-2" /> Sản phẩm
            </NavLink>
            <NavLink
              to="news"
              className={({ isActive }) =>
                `px-4 py-3 rounded-lg ${isActive ? "bg-blue-50 text-blue-600 font-bold" : "text-gray-700"}`
              }
            >
              <Users size={16} className="inline mr-2" /> Bài viết
            </NavLink>
          </nav>
        </aside>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
