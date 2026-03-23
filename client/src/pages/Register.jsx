import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return alert("Mật khẩu xác nhận không khớp!");
    }

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/users/register",
        {
          name,
          email,
          password,
        },
      );
      login(data);
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Đã có lỗi xảy ra khi đăng ký");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-black text-center mb-8 uppercase tracking-tighter">
          Tham gia SneakerZone
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Họ và Tên
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-orange-500 outline-none transition-all"
              placeholder="Nguyễn Văn A"
              required
            />
          </div>
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
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-orange-500 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black hover:bg-orange-600 text-white py-4 rounded-xl font-bold transition-colors shadow-lg shadow-gray-200 mt-4"
          >
            Đăng Ký Tài Khoản
          </button>
        </form>
        <p className="mt-8 text-center text-gray-500">
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            className="text-orange-600 font-bold hover:underline"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
