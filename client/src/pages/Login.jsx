import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import { useAuthStore } from "../store/useAuthStore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(`/api/users/login`, { email, password });
      login(data);
      navigate("/"); // Đăng nhập xong quay về trang chủ
    } catch (err) {
      alert(err.response?.data?.message || "Đã có lỗi xảy ra");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-black text-center mb-8 uppercase tracking-tighter">
          Chào mừng trở lại
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-orange-500 outline-none transition-all"
              placeholder="name@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-orange-500 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black hover:bg-orange-600 text-white py-4 rounded-xl font-bold transition-colors shadow-lg shadow-gray-200"
          >
            Đăng Nhập
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link
            to="/forgot-password"
            className="text-orange-600 hover:text-orange-700 text-sm"
          >
            Quên mật khẩu?
          </Link>
        </div>
        <p className="mt-4 text-center text-gray-500">
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="text-orange-600 font-bold hover:underline"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
