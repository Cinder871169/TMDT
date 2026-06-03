import { useCartStore } from "../store/useCartStore";
import { useAuthStore } from "../store/useAuthStore";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function Checkout() {
  const { cart, clearCart } = useCartStore();
  const { userInfo } = useAuthStore();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  
  // Voucher state
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState("");
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [myVouchers, setMyVouchers] = useState([]);
  const [availableVouchers, setAvailableVouchers] = useState([]);

  // Points state
  const [userPoints, setUserPoints] = useState(0);
  const [usePoints, setUsePoints] = useState(false);
  const [pointsUsed, setPointsUsed] = useState(0);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState("cod"); // Default to COD
  const [qrUrl, setQrUrl] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [paying, setPaying] = useState(false);
  const [showCopied, setShowCopied] = useState(null);

  const navigate = useNavigate();

  // Require login to access checkout
  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
    }
  }, [userInfo, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Fetch user points and vouchers
  useEffect(() => {
    const fetchUserData = async () => {
      if (userInfo?.token) {
        try {
          const res = await axios.get(`${API_BASE}/api/users/profile`, {
            headers: { Authorization: `Bearer ${userInfo.token}` }
          });
          setUserPoints(res.data.points || 0);
        } catch (err) {
          console.error("Lỗi lấy điểm", err);
        }
      }
    };
    fetchUserData();
  }, [userInfo]);

  useEffect(() => {
    if (userInfo && showVoucherModal) {
      loadVouchers();
    }
  }, [userInfo, showVoucherModal]);

  const loadVouchers = async () => {
    try {
      const [myRes, availableRes] = await Promise.all([
        axios.get(`${API_BASE}/api/vouchers/my`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }),
        axios.get(`${API_BASE}/api/vouchers/available`)
      ]);
      setMyVouchers(myRes.data);
      
      // Filter out vouchers that are already saved by the user
      const savedIds = myRes.data.map(v => v._id);
      setAvailableVouchers(availableRes.data.filter(v => !savedIds.includes(v._id)));
    } catch (err) {
      console.error("Lỗi tải mã giảm giá", err);
    }
  };

  const saveVoucher = async (voucherId) => {
    try {
      await axios.post(
        `${API_BASE}/api/vouchers/save`,
        { voucherId },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      // Reload lists
      loadVouchers();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi lưu mã");
    }
  };

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const shippingFee = subtotal > 2000000 ? 0 : 30000;
  const discountAmount = appliedVoucher ? Math.min(appliedVoucher.discountAmount, subtotal * 0.9) : 0;
  
  // Calculate max points they can use (cannot exceed subtotal + shipping - discount)
  const maxPointsCanUse = Math.min(userPoints, subtotal + shippingFee - discountAmount);
  
  useEffect(() => {
    if (usePoints) {
      setPointsUsed(maxPointsCanUse);
    } else {
      setPointsUsed(0);
    }
  }, [usePoints, maxPointsCanUse]);

  const totalPrice = subtotal + shippingFee - discountAmount - pointsUsed;

  const applyVoucher = async (codeToApply) => {
    const code = typeof codeToApply === 'string' ? codeToApply : voucherCode;
    if (!code.trim()) return;
    try {
      setVoucherError("");
      const { data } = await axios.post(
        `${API_BASE}/api/vouchers/apply`,
        { code: code.trim(), orderValue: subtotal },
        { headers: { Authorization: `Bearer ${userInfo?.token}` } }
      );
      setAppliedVoucher(data);
      setVoucherCode(data.code);
      setShowVoucherModal(false);
    } catch (err) {
      setVoucherError(err.response?.data?.message || "Mã giảm giá không hợp lệ");
      setAppliedVoucher(null);
    }
  };

  const handleCreateOrder = async () => {
    if (!name || !address || !phone) {
      setError("Vui lòng nhập đầy đủ thông tin giao hàng");
      return;
    }

    if (!/^[0-9]{10,11}$/.test(phone.replace(/\s/g, ""))) {
      setError("Số điện thoại không hợp lệ");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.post(
        `${API_BASE}/api/orders`,
        {
          orderItems: cart.map((item) => ({
            ...item,
            product: item._id,
          })),
          name,
          address,
          phone,
          note,
          paymentMethod,
          voucherCode: appliedVoucher ? appliedVoucher.code : "",
          pointsUsed,
        },
        config,
      );

      if (paymentMethod === "cod") {
        clearCart();
        navigate("/order-success", { 
          state: { 
            order: data.order,
          } 
        });
      } else if (paymentMethod === "vietqr" && data.paymentUrl) {
        clearCart();
        window.location.href = data.paymentUrl;
      } else {
        setQrUrl(data.qrCodeUrl);
        setOrderId(data.order?._id || null);
        setPaymentDetails(data.paymentDetails);
        setStep(2);
        setCountdown(300);
      }
    } catch (err) {
      console.error("Create order error:", err.response?.data || err);
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Có lỗi xảy ra. Vui lòng thử lại.";
      setError(errorMsg);

      // Check if it's a stock issue and show specific message
      if (err.response?.data?.insufficientStock) {
        setError(
          `Sản phẩm trong kho không đủ. Vui lòng giảm số lượng hoặc loại bỏ sản phẩm.`,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!orderId) {
      setError("Không tìm thấy mã đơn hàng. Vui lòng thử lại.");
      return;
    }

    setPaying(true);
    setError(null);

    try {
      await axios.put(
        `${API_BASE}/api/orders/${orderId}/pay`,
        {},
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        },
      );

      clearCart();
      navigate("/order-success");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Thanh toán chưa được cập nhật. Vui lòng thử lại.",
      );
    } finally {
      setPaying(false);
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setShowCopied(field);
    setTimeout(() => setShowCopied(null), 2000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (cart.length === 0 && step === 1) {
    return (
      <div className="max-w-7xl mx-auto py-20 px-4 text-center">
        <div className="bg-white p-12 rounded-3xl shadow-lg inline-block">
          <svg
            className="w-24 h-24 mx-auto text-gray-300 mb-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h2 className="text-xl font-bold text-gray-700 mb-4">
            Giỏ hàng trống
          </h2>
          <p className="text-gray-500 mb-6">
            Bạn chưa có sản phẩm nào trong giỏ hàng.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="px-8 py-3 bg-black text-white rounded-xl hover:bg-orange-600 transition-colors"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="flex justify-center mb-12 w-full max-w-md mx-auto relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-[25%] right-[25%] h-1 bg-gray-200 rounded-full z-0">
          <div className={`h-full rounded-full bg-orange-500 transition-all duration-300 ${step >= 2 ? "w-full" : "w-0"}`}></div>
        </div>

        {/* Steps */}
        <div className="flex justify-between w-full relative z-10 px-4">
          <div className="flex flex-col items-center gap-3 w-32">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full shadow-sm ${step >= 1 ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-500"} font-bold transition-colors`}
            >
              1
            </div>
            <span
              className={`font-bold text-sm text-center ${step >= 1 ? "text-gray-900" : "text-gray-400"}`}
            >
              Thông tin giao hàng
            </span>
          </div>

          <div className="flex flex-col items-center gap-3 w-32">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full shadow-sm ${step >= 2 ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-500"} font-bold transition-colors`}
            >
              2
            </div>
            <span
              className={`font-bold text-sm text-center ${step >= 2 ? "text-gray-900" : "text-gray-400"}`}
            >
              Thanh toán
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-3">
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Form or Payment */}
        <div className="lg:col-span-2">
          {step === 1 ? (
            <div className="bg-white p-8 rounded-3xl shadow-lg">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                  <svg
                    className="w-6 h-6 text-orange-500 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Thông tin giao hàng
                </h2>
                {userInfo && (userInfo.phone || userInfo.address || userInfo.name) && (
                  <button
                    onClick={() => {
                      if (userInfo.name) setName(userInfo.name);
                      if (userInfo.address) setAddress(userInfo.address);
                      if (userInfo.phone) setPhone(userInfo.phone);
                    }}
                    className="text-sm font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-xl transition-colors flex items-center gap-2 border border-orange-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    Dùng thông tin tài khoản
                  </button>
                )}
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên người nhận <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Nguyễn Văn A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ cụ thể <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 123 Nguyễn Trãi, Quận 1, TP.HCM"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="0xxx xxx xxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú (tùy chọn)
                    </label>
                    <input
                      type="text"
                      placeholder="Giao giờ hành chính, gọi trước khi giao..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateOrder}
                disabled={loading}
                className="w-full mt-8 py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Đang xử lý...
                  </>
                ) : paymentMethod === "cod" ? (
                  <>
                    Đặt hàng (Thanh toán khi nhận hàng)
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </>
                ) : (
                  <>
                    Tiếp tục thanh toán
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                  <svg
                    className="w-6 h-6 text-orange-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  Thanh toán
                </h2>
                {countdown > 0 && (
                  <div className="flex items-center gap-2 text-orange-500 font-medium">
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Mã thanh toán hết hạn sau: {formatTime(countdown)}
                  </div>
                )}
              </div>

              {/* QR Code Payment */}
              {paymentMethod === "vietqr" && qrUrl && (
                <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-blue-50 rounded-2xl">
                  <p className="text-sm text-gray-600 mb-4">
                    Quét mã QR bằng ứng dụng ngân hàng
                  </p>
                  <img
                    src={qrUrl}
                    alt="QR Code thanh toán"
                    className="w-64 h-64 mx-auto rounded-2xl shadow-lg bg-white p-4"
                  />
                  <div className="mt-6 p-4 bg-white rounded-xl">
                    <p className="text-sm text-gray-500">Số tiền thanh toán</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {totalPrice.toLocaleString()}đ
                    </p>
                  </div>
                </div>
              )}

              {/* Banking Details */}
              {paymentMethod === "banking" && paymentDetails && (
                <div className="p-6 bg-gradient-to-br from-orange-50 to-blue-50 rounded-2xl">
                  <p className="text-center text-sm text-gray-600 mb-6">
                    Thông tin chuyển khoản
                  </p>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-white rounded-xl">
                      <span className="text-gray-500">Ngân hàng</span>
                      <span className="font-bold text-gray-800">
                        {paymentDetails.bankName}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-white rounded-xl">
                      <span className="text-gray-500">Số tài khoản</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800 font-mono">
                          {paymentDetails.accountNumber}
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              paymentDetails.accountNumber,
                              "account",
                            )
                          }
                          className="p-1 text-gray-400 hover:text-orange-500 transition-colors"
                        >
                          {showCopied === "account" ? (
                            <svg
                              className="w-5 h-5 text-green-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
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
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-white rounded-xl">
                      <span className="text-gray-500">Tên tài khoản</span>
                      <span className="font-bold text-gray-800">
                        {paymentDetails.accountName}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-white rounded-xl">
                      <span className="text-gray-500">Số tiền</span>
                      <span className="font-bold text-2xl text-orange-600">
                        {totalPrice.toLocaleString()}đ
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl text-white">
                      <span className="font-medium">Nội dung chuyển khoản</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-lg">
                          {paymentDetails.transferContent}
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              paymentDetails.transferContent,
                              "content",
                            )
                          }
                          className="p-1 hover:bg-white/20 rounded transition-colors"
                        >
                          {showCopied === "content" ? (
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
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
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
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <div className="flex gap-3">
                      <svg
                        className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="text-sm text-yellow-800">
                        <p className="font-bold">Lưu ý quan trọng:</p>
                        <p>
                          Vui lòng chuyển khoản đúng <strong>số tiền</strong> và{" "}
                          <strong>nội dung</strong> như trên để đơn hàng được xử
                          lý tự động.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Order ID */}
              {orderId && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Mã đơn hàng</span>
                    <span className="font-mono font-bold text-gray-700">
                      #{orderId.slice(-8).toUpperCase()}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 space-y-4">
                <button
                  onClick={handleConfirmPayment}
                  disabled={paying}
                  className="w-full py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {paying ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Tôi đã thanh toán
                    </>
                  )}
                </button>

                <button
                  onClick={() => setStep(1)}
                  className="w-full py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  ← Quay lại chỉnh sửa thông tin
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl shadow-lg sticky top-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Đơn hàng của bạn
            </h3>

            <div className="space-y-4 mb-6">
              {cart.map((item) => {
                const itemImage = item.colorImages?.[0] || item.image;
                return (
                  <div
                    key={`${item._id}-${item.size}-${item.color}`}
                    className="flex gap-3"
                  >
                    <img
                      src={itemImage}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src =
                          "https://placehold.co/64x64/cccccc/666666?text=Img";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-800 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Size: {item.size} | Color: {item.color}
                      </p>
                      <p className="text-xs text-gray-500">x{item.quantity}</p>
                    </div>
                    <p className="font-bold text-sm text-gray-800">
                      {(item.price * item.quantity).toLocaleString()}đ
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Payment Method Selection */}
            <div className="border-t border-gray-100 pt-4 pb-4 space-y-3">
              <h4 className="font-bold text-gray-800">Phương thức thanh toán</h4>
              
              {/* COD Option */}
              <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                paymentMethod === "cod" 
                  ? "border-orange-500 bg-orange-50" 
                  : "border-gray-200 hover:border-gray-300"
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="hidden"
                />
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  paymentMethod === "cod" ? "bg-orange-500 text-white" : "bg-gray-100"
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-gray-800">Thanh toán khi nhận hàng (COD)</p>
                  <p className="text-xs text-gray-500">Trả tiền mặt khi nhận được hàng</p>
                </div>
                {paymentMethod === "cod" && (
                  <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </label>

              {/* VietQR Option */}
              <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                paymentMethod === "vietqr" 
                  ? "border-orange-500 bg-orange-50" 
                  : "border-gray-200 hover:border-gray-300"
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="vietqr"
                  checked={paymentMethod === "vietqr"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="hidden"
                />
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  paymentMethod === "vietqr" ? "bg-orange-500 text-white" : "bg-gray-100"
                }`}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 13h6v6H3v-6zm2 2v2h2v-2H5zm13-2h1v1h-1v-1zm-5 0h1v1h-1v-1zm2 2h1v1h-1v-1zm0 2h1v1h-1v-1zm-2 2h1v1h-1v-1zm2 0h1v1h-1v-1zm-5 0h1v1h-1v-1zm2 0h1v1h-1v-1zm2 0h1v1h-1v-1zm2 0h1v1h-1v-1z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-gray-800">Quét mã QR (VietQR)</p>
                  <p className="text-xs text-gray-500">Thanh toán qua app ngân hàng/MoMo/ZaloPay</p>
                </div>
                {paymentMethod === "vietqr" && (
                  <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </label>

              {/* Banking Option */}
              <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                paymentMethod === "banking" 
                  ? "border-orange-500 bg-orange-50" 
                  : "border-gray-200 hover:border-gray-300"
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="banking"
                  checked={paymentMethod === "banking"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="hidden"
                />
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  paymentMethod === "banking" ? "bg-orange-500 text-white" : "bg-gray-100"
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-gray-800">Chuyển khoản ngân hàng</p>
                  <p className="text-xs text-gray-500">ATM/Internet Banking</p>
                </div>
                {paymentMethod === "banking" && (
                  <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </label>
            </div>

            {/* Voucher Section */}
            <div className="border-t border-gray-100 pt-4 pb-4 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Mã giảm giá"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  disabled={step > 1 || appliedVoucher}
                  className="flex-1 border border-gray-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
                {!appliedVoucher ? (
                  <>
                    <button
                      onClick={() => applyVoucher(voucherCode)}
                      disabled={step > 1 || !voucherCode.trim()}
                      className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 disabled:opacity-50"
                    >
                      Áp dụng
                    </button>
                    <button
                      onClick={() => setShowVoucherModal(true)}
                      disabled={step > 1}
                      className="bg-orange-100 text-orange-600 px-3 py-2 rounded-lg text-sm font-bold hover:bg-orange-200 disabled:opacity-50 whitespace-nowrap"
                    >
                      Kho Voucher
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setAppliedVoucher(null);
                      setVoucherCode("");
                    }}
                    disabled={step > 1}
                    className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100 disabled:opacity-50"
                  >
                    Hủy
                  </button>
                )}
              </div>
              {voucherError && <p className="text-xs text-red-500">{voucherError}</p>}
              {appliedVoucher && <p className="text-xs text-green-600 font-medium">Đã áp dụng mã {appliedVoucher.code}</p>}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tạm tính</span>
                <span className="text-gray-800">
                  {subtotal.toLocaleString()}đ
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Phí vận chuyển</span>
                <span className="text-gray-800">
                  {shippingFee === 0 ? (
                    <span className="text-green-500 font-medium">Miễn phí</span>
                  ) : (
                    `${shippingFee.toLocaleString()}đ`
                  )}
                </span>
              </div>
              {appliedVoucher && (
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>Giảm giá ({appliedVoucher.code})</span>
                  <span>-{discountAmount.toLocaleString()}đ</span>
                </div>
              )}
              {userPoints > 0 && (
                <div className="flex items-center gap-2 border border-orange-200 bg-orange-50 p-3 rounded-lg mt-3">
                  <input
                    type="checkbox"
                    id="usePoints"
                    checked={usePoints}
                    onChange={(e) => setUsePoints(e.target.checked)}
                    disabled={step > 1}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="usePoints" className="text-sm font-medium text-orange-800 cursor-pointer flex-1">
                    Dùng {maxPointsCanUse.toLocaleString()} điểm SneakerCoin (Giảm {maxPointsCanUse.toLocaleString()}đ)
                  </label>
                </div>
              )}
              {subtotal <= 2000000 && (
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Mua thêm {(2000000 - subtotal).toLocaleString()}đ để được miễn phí ship!
                </p>
              )}
              {usePoints && pointsUsed > 0 && (
                <div className="flex justify-between text-sm text-orange-600 font-medium">
                  <span>Dùng điểm SneakerCoin</span>
                  <span>-{pointsUsed.toLocaleString()}đ</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-100">
                <span className="text-gray-800">Tổng cộng</span>
                <span className="text-orange-600">
                  {totalPrice.toLocaleString()}đ
                </span>
              </div>
              {paymentMethod === "cod" && (
                <div className="flex justify-between text-sm text-green-600 font-medium bg-green-50 p-3 rounded-lg">
                  <span>Thanh toán khi nhận hàng</span>
                </div>
              )}
            </div>

            {/* trust badges */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-center gap-4 text-gray-400">
                <div className="flex items-center gap-1 text-xs">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Bảo mật</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>An toàn</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Đổi trả</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Voucher Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">Kho Voucher</h2>
              <button
                onClick={() => setShowVoucherModal(false)}
                className="text-gray-400 hover:text-black"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {/* My Vouchers */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3">Mã của bạn ({myVouchers.length})</h3>
                {myVouchers.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Bạn chưa lưu mã giảm giá nào.</p>
                ) : (
                  <div className="space-y-3">
                    {myVouchers.map(v => (
                      <div key={v._id} className="border border-orange-200 bg-orange-50 rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <p className="font-black text-orange-600 text-lg">{v.code}</p>
                          <p className="text-sm text-gray-600">Giảm {v.discountType === 'percent' ? `${v.discountValue}%` : `${v.discountValue.toLocaleString()}đ`}</p>
                          <p className="text-xs text-gray-500 mt-1">Đơn tối thiểu {v.minOrderValue?.toLocaleString()}đ</p>
                        </div>
                        <button
                          onClick={() => applyVoucher(v.code)}
                          disabled={subtotal < v.minOrderValue}
                          className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Dùng ngay
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Available Vouchers */}
              {availableVouchers.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-800 mb-3">Mã có thể lưu ({availableVouchers.length})</h3>
                  <div className="space-y-3">
                    {availableVouchers.map(v => (
                      <div key={v._id} className="border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <p className="font-black text-gray-800 text-lg">{v.code}</p>
                          <p className="text-sm text-gray-600">Giảm {v.discountType === 'percent' ? `${v.discountValue}%` : `${v.discountValue.toLocaleString()}đ`}</p>
                          <p className="text-xs text-gray-500 mt-1">Đơn tối thiểu {v.minOrderValue?.toLocaleString()}đ</p>
                        </div>
                        <button
                          onClick={() => saveVoucher(v._id)}
                          className="border-2 border-orange-500 text-orange-500 px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-50"
                        >
                          Lưu mã
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
