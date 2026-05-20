import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Phone, MapPin, Key, Package, LogOut, Edit3, Save, X, Coins, ShieldCheck, ShoppingBag } from "lucide-react";

export default function Profile() {
  const { userInfo, logout, setUserInfo } = useAuthStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile"); // profile, security, orders
  const [editing, setEditing] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [points, setPoints] = useState(0);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🚫 Không cho admin vào
  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
      return;
    }

    if (userInfo?.isAdmin) {
      navigate("/");
    }
  }, [userInfo, navigate]);

  // LOAD DATA
  useEffect(() => {
    if (!userInfo) return; // 🔥 tránh null

    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(
          `${API_BASE}/api/users/profile`,
          {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          },
        );
        setName(data.name || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
        setPoints(data.points || 0);
        
        if (data.phone !== userInfo.phone || data.address !== userInfo.address || data.name !== userInfo.name) {
          setUserInfo({ ...userInfo, ...data });
        }
      } catch (error) {
        console.log("Error fetching profile:", error);
      }
    };

    fetchProfile();

    let intervalId;
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get(
          `${API_BASE}/api/orders/myorders`,
          {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          },
        );
        setOrders(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    if (userInfo.token) {
      fetchOrders();
      intervalId = setInterval(fetchOrders, 8000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [userInfo]);

  const cancelOrder = async (orderId) => {
    if(!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) return;
    try {
      const { data } = await axios.put(
        `${API_BASE}/api/orders/${orderId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        },
      );

      setOrders((prev) => prev.map((o) => (o._id === orderId ? data : o)));
    } catch (error) {
      alert(error.response?.data?.message || "Không thể hủy đơn hàng");
    }
  };

  // UPDATE PROFILE
  const updateProfile = async (e) => {
    if (e) e.preventDefault();

    if (!name.trim()) {
      alert("Vui lòng nhập họ và tên");
      return;
    }

    try {
      const { data } = await axios.put(
        `${API_BASE}/api/users/profile`,
        {
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${userInfo?.token}`,
          },
        },
      );

      setUserInfo({ ...userInfo, ...data });
      alert("Cập nhật thành công");
      setEditing(false);
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi cập nhật");
    }
  };

  // CHANGE PASSWORD
  const changePassword = async (e) => {
    if (e) e.preventDefault();
    if (!oldPassword || !newPassword) {
      alert("Nhập đủ mật khẩu cũ và mới");
      return;
    }

    try {
      await axios.put(
        `${API_BASE}/api/users/change-password`,
        {
          oldPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${userInfo?.token}`,
          },
        },
      );

      alert("Đổi mật khẩu thành công");
      setOldPassword("");
      setNewPassword("");
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi đổi mật khẩu");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8">
        
        {/* SIDEBAR */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-28">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-3xl font-black mb-4 shadow-lg shadow-orange-500/20">
                {userInfo?.name?.charAt(0)?.toUpperCase()}
              </div>
              <h2 className="font-black text-xl text-gray-800">{userInfo?.name}</h2>
              <p className="text-gray-500 text-sm mt-1">{userInfo?.email}</p>
              
              <div className="mt-4 inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-sm font-bold border border-orange-100">
                <Coins size={16} />
                {points.toLocaleString()} SneakerCoin
              </div>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-colors ${
                  activeTab === "profile" ? "bg-black text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <User size={18} /> Hồ sơ cá nhân
              </button>
              
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-colors ${
                  activeTab === "orders" ? "bg-black text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Package size={18} /> Đơn hàng của tôi
              </button>

              <button
                onClick={() => setActiveTab("security")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-colors ${
                  activeTab === "security" ? "bg-black text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <ShieldCheck size={18} /> Bảo mật
              </button>

              <div className="h-px bg-gray-100 my-4"></div>

              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut size={18} /> Đăng xuất
              </button>
            </nav>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="md:col-span-3">
          
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black text-gray-800">Hồ sơ cá nhân</h2>
                  <p className="text-gray-500 text-sm mt-1">Quản lý thông tin cá nhân để bảo mật tài khoản</p>
                </div>
                {!editing && (
                  <button
                    onClick={() => {
                      setName(userInfo?.name || "");
                      setPhone(userInfo?.phone || "");
                      setAddress(userInfo?.address || "");
                      setEditing(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-xl font-bold hover:bg-orange-100 transition-colors"
                  >
                    <Edit3 size={16} /> Chỉnh sửa
                  </button>
                )}
              </div>

              <form onSubmit={updateProfile} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                      <User size={16} className="text-gray-400" /> Họ và tên
                    </label>
                    {editing ? (
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                        placeholder="Nhập họ tên của bạn"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-gray-800 font-medium">
                        {userInfo?.name}
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                      <Mail size={16} className="text-gray-400" /> Địa chỉ Email
                    </label>
                    <div className="px-4 py-3 bg-gray-100 border border-transparent rounded-xl text-gray-500 font-medium cursor-not-allowed">
                      {userInfo?.email}
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                      <Phone size={16} className="text-gray-400" /> Số điện thoại
                    </label>
                    {editing ? (
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                        placeholder="Thêm số điện thoại"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-gray-800 font-medium">
                        {userInfo?.phone || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                      <MapPin size={16} className="text-gray-400" /> Địa chỉ giao hàng
                    </label>
                    {editing ? (
                      <input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                        placeholder="Thêm địa chỉ giao hàng"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-gray-800 font-medium">
                        {userInfo?.address || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                      </div>
                    )}
                  </div>
                </div>

                {editing && (
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-orange-600 transition-colors"
                    >
                      <Save size={18} /> Lưu thay đổi
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                    >
                      <X size={18} /> Hủy
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-gray-800">Đổi mật khẩu</h2>
                <p className="text-gray-500 text-sm mt-1">Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</p>
              </div>

              <form onSubmit={changePassword} className="max-w-md space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <Key size={16} className="text-gray-400" /> Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <ShieldCheck size={16} className="text-gray-400" /> Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                    placeholder="Nhập mật khẩu mới"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-orange-600 transition-colors"
                  >
                    Cập nhật mật khẩu
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="mb-8 flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-black text-gray-800">Lịch sử đơn hàng</h2>
                  <p className="text-gray-500 text-sm mt-1">Theo dõi và quản lý các đơn hàng của bạn</p>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-10 animate-pulse font-bold text-gray-400">Đang tải lịch sử đơn hàng...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-gray-300">
                    <ShoppingBag size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Chưa có đơn hàng nào</h3>
                  <p className="text-gray-500 mb-6">Bạn chưa thực hiện đơn hàng nào trên hệ thống.</p>
                  <Link to="/products" className="inline-flex px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-orange-600 transition-colors">
                    Khám phá sản phẩm
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow bg-gray-50/50">
                      <div className="flex flex-wrap justify-between items-start gap-4 mb-4 pb-4 border-b border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Mã đơn hàng</p>
                          <p className="font-black text-gray-800">#{order._id.substring(0, 8).toUpperCase()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 text-right">Ngày đặt</p>
                          <p className="font-medium text-gray-800 text-right">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Tổng tiền</p>
                            <p className="font-black text-orange-600 text-lg">{order.totalPrice.toLocaleString()}đ</p>
                          </div>
                          <div className="h-10 w-px bg-gray-200"></div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Trạng thái</p>
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                              order.status === 'Chờ xử lý' ? 'bg-yellow-100 text-yellow-700' :
                              order.status === 'Đang giao hàng' || order.status === 'Đang giao' ? 'bg-blue-100 text-blue-700' :
                              order.status === 'Đã giao hàng' || order.status === 'Đã giao' ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {order.status === "Chờ xử lý" && (
                            <button
                              type="button"
                              onClick={() => cancelOrder(order._id)}
                              className="px-4 py-2 border border-red-200 text-red-600 bg-white rounded-xl hover:bg-red-50 hover:border-red-300 transition-colors text-sm font-bold"
                            >
                              Hủy đơn
                            </button>
                          )}
                          <Link
                            to={`/orders/${order._id}`}
                            className="px-5 py-2 bg-black text-white rounded-xl hover:bg-orange-600 transition-colors text-sm font-bold"
                          >
                            Xem chi tiết
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
