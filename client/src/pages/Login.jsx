import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function Login() {
  const [loginMethod, setLoginMethod] = useState("password"); // "password" or "otp"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userStr = params.get("user");
    const errorParam = params.get("error");

    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    } else if (token && userStr) {
      try {
        const data = JSON.parse(decodeURIComponent(userStr));
        localStorage.setItem("userInfo", JSON.stringify(data));
        login(data);
        if (data.isAdmin === true) {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      } catch (err) {
        setError("Lỗi xử lý dữ liệu đăng nhập mạng xã hội");
      }
    }
  }, [navigate, login]);

  const handleSocialLogin = (provider) => {
    window.location.href = `${API_BASE}/api/users/auth/${provider}`;
  };

  // Login with password
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }

      localStorage.setItem("userInfo", JSON.stringify(data));
      login(data);

      if (data.isAdmin === true) {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Đã có lỗi xảy ra");
      setLoading(false);
    }
  };

  // Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/users/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "login" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể gửi mã OTP");
      }

      setMessage("Mã OTP đã được gửi đến email của bạn");
      setLoginMethod("otp_verify");
    } catch (err) {
      setError(err.message || "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and login
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/users/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, type: "login" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Xác thực thất bại");
      }

      localStorage.setItem("userInfo", JSON.stringify(data));
      login(data);

      if (data.isAdmin === true) {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Đã có lỗi xảy ra");
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setMessage("");
    await handleSendOTP({ preventDefault: () => {} });
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-2xl font-black">SZ</span>
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">
            {loginMethod === "otp_verify" ? "Nhập mã OTP" : "Đăng nhập"}
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            {loginMethod === "otp_verify"
              ? `Mã đã được gửi đến ${email}`
              : "Chào mừng bạn quay lại"}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 text-green-600 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {message}
          </div>
        )}

        {/* Login with Password */}
        {loginMethod === "password" && (
          <form onSubmit={handlePasswordLogin} className="space-y-6">
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
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-orange-500/30 disabled:opacity-50"
            >
              {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
            </button>
          </form>
        )}

        {/* Login with OTP - Step 1: Send OTP */}
        {loginMethod === "otp" && (
          <form onSubmit={handleSendOTP} className="space-y-6">
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
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-orange-500/30 disabled:opacity-50"
            >
              {loading ? "Đang gửi..." : "Gửi mã xác thực"}
            </button>
          </form>
        )}

        {/* Login with OTP - Step 2: Verify OTP */}
        {loginMethod === "otp_verify" && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Mã xác thực (OTP)
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-orange-500 outline-none transition-all text-center text-2xl tracking-[1em] font-bold"
                placeholder="● ● ● ● ● ●"
                maxLength={6}
                required
                autoFocus
              />
              <p className="text-xs text-gray-400 mt-2 text-center">
                Mã có hiệu lực trong 5 phút
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-orange-500/30 disabled:opacity-50"
            >
              {loading ? "Đang xác thực..." : "Xác thực & Đăng nhập"}
            </button>
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod("password");
                  setOtp("");
                  setMessage("");
                }}
                className="text-gray-500 hover:text-orange-600 flex items-center gap-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Đăng nhập bằng mật khẩu
              </button>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Gửi lại mã
              </button>
            </div>
          </form>
        )}

        {/* Toggle Login Method */}
        {loginMethod !== "otp_verify" && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-center mb-4">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="px-4 text-sm text-gray-400">hoặc</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {loginMethod === "password" ? (
              <button
                type="button"
                onClick={() => setLoginMethod("otp")}
                className="w-full py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-all flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Đăng nhập bằng OTP qua email
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setLoginMethod("password")}
                className="w-full py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-all flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
                Đăng nhập bằng mật khẩu
              </button>
            )}
            
            {/* Social Login Buttons */}
            <div className="flex gap-4 mt-4">
              <button
                type="button"
                onClick={() => handleSocialLogin("google")}
                className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  <path fill="none" d="M0 0h48v48H0z" />
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin("facebook")}
                className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>
          </div>
        )}

        {/* Links */}
        <div className="mt-6 text-center space-y-2">
          {loginMethod === "password" && (
            <Link
              to="/forgot-password"
              className="block text-orange-600 hover:text-orange-700 text-sm"
            >
              Quên mật khẩu?
            </Link>
          )}
          <p className="text-gray-500 text-sm">
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
    </div>
  );
}
