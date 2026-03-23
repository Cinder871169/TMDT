import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Vui lòng nhập email!");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post(`/api/users/forgot-password`, { email });
      toast.success(data.message);
      setEmail("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-black text-center mb-8 uppercase tracking-tighter">
          Quên Mật Khẩu
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu
        </p>
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
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-3 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang gửi..." : "Gửi Hướng Dẫn"}
          </button>
        </form>
        <div className="text-center mt-6">
          <Link to="/login" className="text-orange-500 hover:text-orange-600">
            ← Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
