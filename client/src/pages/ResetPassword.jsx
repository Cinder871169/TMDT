import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post(`/api/users/reset-password`, {
        token,
        password,
      });
      toast.success(data.message);
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md border border-gray-100 text-center">
          <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter">
            Link Không Hợp Lệ
          </h2>
          <p className="text-gray-600 mb-6">
            Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
          </p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors"
          >
            Yêu cầu lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-black text-center mb-8 uppercase tracking-tighter">
          Đặt Lại Mật Khẩu
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Nhập mật khẩu mới cho tài khoản của bạn
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Mật khẩu mới
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-orange-500 outline-none transition-all"
              placeholder="Nhập mật khẩu mới"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-orange-500 outline-none transition-all"
              placeholder="Nhập lại mật khẩu"
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-3 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang xử lý..." : "Đặt Lại Mật Khẩu"}
          </button>
        </form>
      </div>
    </div>
  );
}
