import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Profile() {
  const { userInfo, logout, setUserInfo } = useAuthStore();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [orders, setOrders] = useState([]);

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

    // Fetch user profile data
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          },
        );
        setName(data.name || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
        
        // Sync global state in case it's missing phone/address from an old login session
        if (data.phone !== userInfo.phone || data.address !== userInfo.address) {
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
          "http://localhost:5000/api/orders/myorders",
          {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          },
        );
        setOrders(data);
      } catch (error) {
        console.log(error);
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
    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/orders/${orderId}/cancel`,
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

    if (!phone || !address) {
      alert("Vui lòng nhập đầy đủ số điện thoại và địa chỉ");
      return;
    }

    try {
      const { data } = await axios.put(
        "http://localhost:5000/api/users/profile",
        {
          name,
          phone: phone.trim(),
          address: address.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${userInfo?.token}`,
          },
        },
      );

      setUserInfo(data);

      alert("Cập nhật thành công");
      setEditing(false);
    } catch (error) {
      console.log(error.response?.data);
      alert(error.response?.data?.message || "Lỗi cập nhật");
    }
  };

  // CHANGE PASSWORD
  const changePassword = async () => {
    if (!oldPassword || !newPassword) {
      alert("Nhập đủ mật khẩu cũ và mới");
      return;
    }

    try {
      await axios.put(
        "http://localhost:5000/api/users/change-password",
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
      console.log(error.response?.data);
      alert(error.response?.data?.message || "Lỗi đổi mật khẩu");
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-20 grid md:grid-cols-4 gap-10">
      {/* SIDEBAR */}
      <div className="bg-white shadow rounded-2xl p-6">
        <h2 className="font-bold text-lg mb-4">TRANG TÀI KHOẢN</h2>

        <p className="text-sm mb-6">
          Xin chào,{" "}
          <span className="text-orange-600 font-bold">{userInfo?.name}</span>
        </p>

        <div className="space-y-3 text-sm">
          <button className="block text-orange-600 font-bold">
            Thông tin tài khoản
          </button>

          <button
            onClick={() => navigate("/orders")}
            className="block hover:text-orange-600"
          >
            Đơn hàng
          </button>

          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="block text-red-500"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="md:col-span-3 space-y-8">
        {/* INFO */}
        <div className="bg-white shadow rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-6">Thông tin tài khoản</h2>

          <form onSubmit={updateProfile}>
            <div className="grid grid-cols-2 gap-6">
              {/* NAME */}
              <div>
                <p className="text-gray-500 text-sm">Tên</p>
                {editing ? (
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border p-2 rounded w-full"
                  />
                ) : (
                  <p className="font-bold">{userInfo?.name || ""}</p>
                )}
              </div>

              {/* EMAIL */}
              <div>
                <p className="text-gray-500 text-sm">Email</p>
                <p className="font-bold">{userInfo?.email}</p>
              </div>

              {/* PHONE */}
              <div>
                <p className="text-gray-500 text-sm">Phone</p>
                {editing ? (
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="border p-2 rounded w-full"
                  />
                ) : (
                  <p>{userInfo?.phone || "Chưa có"}</p>
                )}
              </div>

              {/* ADDRESS */}
              <div>
                <p className="text-gray-500 text-sm">Address</p>
                {editing ? (
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="border p-2 rounded w-full"
                  />
                ) : (
                  <p>{userInfo?.address || "Chưa có"}</p>
                )}
              </div>
            </div>

            {/* BUTTON */}
            <div className="mt-6">
              {!editing ? (
                <button
                  type="button"
                  onClick={() => {
                    setName(userInfo?.name || "");
                    setPhone(userInfo?.phone || "");
                    setAddress(userInfo?.address || "");
                    setEditing(true);
                  }}
                  className="px-6 py-2 bg-black text-white rounded-xl"
                >
                  Chỉnh sửa
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-500 text-white rounded-xl mr-3"
                  >
                    Lưu
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-6 py-2 border rounded-xl"
                  >
                    Hủy
                  </button>
                </>
              )}
            </div>
          </form>
        </div>

        {/* CHANGE PASSWORD */}
        <div className="bg-white shadow rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-6">Đổi mật khẩu</h2>

          <input
            type="password"
            placeholder="Mật khẩu cũ"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="border p-2 rounded w-full mb-3"
          />

          <input
            type="password"
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border p-2 rounded w-full mb-3"
          />

          <button
            onClick={changePassword}
            className="bg-orange-600 text-white px-6 py-2 rounded-xl"
          >
            Đổi mật khẩu
          </button>
        </div>

        {/* ORDERS */}
        <div className="bg-white shadow rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-6">Đơn hàng của bạn</h2>

          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th>Mã đơn</th>
                <th>Ngày</th>
                <th>Tổng</th>
                <th>Trạng thái</th>
              </tr>
            </thead>

            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    Không có đơn hàng
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="border-b text-center">
                    <td>{order._id}</td>
                    <td>
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td>{order.totalPrice}đ</td>
                    <td>
                      <div>{order.status}</div>
                      {order.status === "Chờ xử lý" && (
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => cancelOrder(order._id)}
                            className="px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors text-sm font-bold"
                          >
                            Hủy đơn
                          </button>
                        </div>
                      )}
                      <div className="mt-2">
                        <Link
                          to={`/orders/${order._id}`}
                          className="px-4 py-2 bg-black text-white rounded-xl hover:bg-orange-600 transition-colors text-sm font-bold inline-block"
                        >
                          Xem chi tiết
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
