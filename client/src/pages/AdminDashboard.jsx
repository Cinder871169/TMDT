import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuthStore } from "../store/useAuthStore";
import {
  Settings,
  Plus,
  X,
  Save,
  PackageCheck,
  TrendingUp,
  Users,
  ShoppingBag,
} from "lucide-react";

export default function AdminDashboard() {
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showNewsForm, setShowNewsForm] = useState(false);
  const { userInfo } = useAuthStore();

  // State cho Form thêm giày mới
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image: "",
    brand: "",
    description: "",
    sizes: "40, 41, 42",
    colors: "Trắng, Đen",
  });

  // State cho Form thêm bài viết
  const [newNews, setNewNews] = useState({
    title: "",
    content: "",
    image: "",
    author: userInfo?.name || "Admin",
  });

  // State cho edit mode
  const [editingNews, setEditingNews] = useState(null);

  // State cho danh sách bài viết
  const [news, setNews] = useState([]);

  // Lấy danh sách tất cả đơn hàng từ hệ thống
  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        const { data } = await api.get(`/api/orders`);
        setAllOrders(data);
        setLoading(false);
      } catch (err) {
        console.error("Lỗi tải đơn hàng:", err);
        setLoading(false);
      }
    };

    const fetchNews = async () => {
      try {
        const { data } = await api.get(`/api/news`);
        setNews(data);
      } catch (err) {
        console.error("Lỗi tải bài viết:", err);
      }
    };

    if (userInfo) {
      fetchAllOrders();
      fetchNews();
    }
  }, [userInfo]);

  // Xử lý gửi Form thêm giày
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("price", newProduct.price);
    formData.append("brand", newProduct.brand);
    formData.append("description", newProduct.description);
    formData.append("sizes", newProduct.sizes);
    formData.append("colors", newProduct.colors);
    formData.append("image", newProduct.imageFile); // Gửi file thực tế

    try {
      await api.post(`/api/products`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Thêm giày thành công!");
      setShowForm(false);
    } catch {
      alert("Lỗi tải ảnh");
    }
  };

  // Xử lý gửi Form thêm bài viết
  const handleNewsSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingNews) {
        await api.put(`/api/news/${editingNews._id}`, newNews);
        alert("Cập nhật bài viết thành công!");
      } else {
        await api.post(`/api/news`, newNews);
        alert("Thêm bài viết thành công!");
      }

      setShowNewsForm(false);
      setEditingNews(null);
      setNewNews({
        title: "",
        content: "",
        image: "",
        author: userInfo?.name || "Admin",
      });
      const { data } = await api.get(`/api/news`);
      setNews(data);
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.message || "Unknown error"));
    }
  };

  // Xử lý edit bài viết
  const handleEditNews = (article) => {
    setEditingNews(article);
    setNewNews({
      title: article.title,
      content: article.content,
      image: article.image || "",
      author: article.author,
    });
    setShowNewsForm(true);
  };

  // Xử lý xóa bài viết
  const handleDeleteNews = async (newsId) => {
    if (!confirm("Bạn có chắc muốn xóa bài viết này?")) return;

    try {
      await api.delete(`/api/news/${newsId}`);
      alert("Xóa bài viết thành công!");
      // Refresh news list
      const { data } = await api.get(`/api/news`);
      setNews(data);
    } catch (error) {
      alert(
        "Lỗi xóa bài viết: " +
          (error.response?.data?.message || "Unknown error"),
      );
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/api/orders/${orderId}/status`, { status: newStatus });

      // Cập nhật lại giao diện ngay lập tức
      setAllOrders(
        allOrders.map((o) =>
          o._id === orderId ? { ...o, status: newStatus } : o,
        ),
      );
    } catch {
      alert("Không thể cập nhật trạng thái đơn hàng");
    }
  };

  // Protect route: only admin users
  const navigate = useNavigate();
  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
    } else if (!userInfo.isAdmin) {
      navigate("/");
    }
  }, [userInfo, navigate]);

  // Tính toán số liệu thống kê
  const totalRevenue = allOrders.reduce(
    (acc, order) => acc + order.totalPrice,
    0,
  );
  const totalCustomers = [...new Set(allOrders.map((o) => o.user?._id))].length;

  if (loading)
    return (
      <div className="text-center mt-20 font-bold animate-pulse">
        Đang tải dữ liệu quản trị...
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black flex items-center gap-3 tracking-tighter uppercase">
            <Settings className="text-blue-600" size={38} />
            Admin <span className="text-blue-600">Control</span>
          </h1>
          <p className="text-gray-400 font-medium mt-1">
            Chào mừng quay trở lại, Chủ shop!
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
        >
          <Plus size={24} /> THÊM SẢN PHẨM MỚI
        </button>
        <button
          onClick={() => setShowNewsForm(true)}
          className="bg-green-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-green-700 transition-all shadow-xl shadow-green-100 active:scale-95"
        >
          <Plus size={24} /> THÊM BÀI VIẾT MỚI
        </button>
      </div>

      {/* --- THỐNG KÊ NHANH --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="bg-orange-100 text-orange-600 p-4 rounded-2xl">
            <TrendingUp size={32} />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Doanh thu
            </p>
            <p className="text-2xl font-black">
              {totalRevenue.toLocaleString("vi-VN")}đ
            </p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="bg-blue-100 text-blue-600 p-4 rounded-2xl">
            <ShoppingBag size={32} />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Đơn hàng
            </p>
            <p className="text-2xl font-black">{allOrders.length}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="bg-green-100 text-green-600 p-4 rounded-2xl">
            <Users size={32} />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Khách hàng
            </p>
            <p className="text-2xl font-black">{totalCustomers}</p>
          </div>
        </div>
      </div>

      {/* --- QUẢN LÝ BÀI VIẾT --- */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
        <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
          <PackageCheck className="text-green-500" size={28} /> QUẢN LÝ BÀI VIẾT
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((article) => (
            <div
              key={article._id}
              className="bg-gray-50 rounded-2xl p-6 border border-gray-100"
            >
              <img
                src={article.image || "/images/default-news.jpg"}
                alt={article.title}
                className="w-full h-32 object-cover rounded-xl mb-4"
              />
              <h3 className="font-bold text-lg mb-2 line-clamp-2">
                {article.title}
              </h3>
              <p className="text-sm text-gray-500 mb-2">
                Tác giả: {article.author} •{" "}
                {new Date(article.createdAt).toLocaleDateString("vi-VN")}
              </p>
              <p className="text-sm text-gray-600 line-clamp-3">
                {article.content.replace(/<[^>]*>/g, "").substring(0, 100)}...
              </p>
              <div className="flex gap-2 mt-4">
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    article.published
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {article.published ? "Đã xuất bản" : "Nháp"}
                </span>
                <button
                  onClick={() => handleEditNews(article)}
                  className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDeleteNews(article._id)}
                  className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
        {news.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            Chưa có bài viết nào.
          </p>
        )}
      </div>

      {/* --- DANH SÁCH ĐƠN HÀNG --- */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
          <PackageCheck className="text-orange-500" size={28} /> ĐƠN HÀNG TOÀN
          HỆ THỐNG
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                <th className="pb-5">Khách hàng</th>
                <th className="pb-5">Thông tin đơn</th>
                <th className="pb-5">Tổng cộng</th>
                <th className="pb-5">Ngày đặt</th>
                <th className="pb-5 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allOrders.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-6">
                    <p className="font-bold text-gray-900">
                      {order.user?.name || "N/A"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {order.user?.email || "Khách vãng lai"}
                    </p>
                  </td>
                  <td className="py-6">
                    <p className="text-xs font-medium text-gray-600">
                      {order.orderItems.length} sản phẩm
                    </p>
                    <div className="flex -space-x-2 mt-2">
                      {order.orderItems.slice(0, 3).map((item, i) => (
                        <img
                          key={i}
                          src={item.image}
                          alt=""
                          className="w-8 h-8 rounded-full border-2 border-white object-cover"
                        />
                      ))}
                    </div>
                  </td>
                  <td className="py-6 font-black text-orange-600">
                    {order.totalPrice.toLocaleString("vi-VN")}đ
                  </td>
                  <td className="py-6 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase outline-none cursor-pointer"
                  >
                    <option value="Chờ xử lý">Chờ xử lý</option>
                    <option value="Đang giao">Đang giao</option>
                    <option value="Đã giao">Đã giao</option>
                    <option value="Đã hủy">Đã hủy</option>
                  </select>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL FORM THÊM GIÀY --- */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-[2rem] p-10 w-full max-w-2xl shadow-2xl relative my-auto animate-in zoom-in-95">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-8 right-8 text-gray-400 hover:text-black transition-colors"
            >
              <X size={28} />
            </button>

            <h2 className="text-3xl font-black mb-2 uppercase tracking-tight">
              Thêm Giày Mới
            </h2>
            <p className="text-gray-400 text-sm mb-8 font-medium">
              Điền thông tin để đưa sản phẩm lên trang chủ.
            </p>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  Tên giày
                </label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-2 focus:ring-2 ring-blue-500 transition-all outline-none"
                  placeholder="Nike Air Jordan 1 High..."
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  Hãng (Brand)
                </label>
                <input
                  type="text"
                  required
                  value={newProduct.brand}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, brand: e.target.value })
                  }
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-2 outline-none"
                  placeholder="Nike"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  Giá (VNĐ)
                </label>
                <input
                  type="number"
                  required
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, price: e.target.value })
                  }
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-2 outline-none"
                  placeholder="2500000"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  Ảnh sản phẩm (Tải từ máy)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      imageFile: e.target.files[0],
                    })
                  }
                  className="w-full bg-gray-50 border-dashed border-2 border-gray-200 rounded-2xl p-4 mt-2"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  Mô tả chi tiết
                </label>
                <textarea
                  rows="3"
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-2 outline-none"
                  placeholder="Nhập mô tả sản phẩm tại đây..."
                ></textarea>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  Size (cách nhau bởi dấu phẩy)
                </label>
                <input
                  type="text"
                  value={newProduct.sizes}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, sizes: e.target.value })
                  }
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-2 outline-none"
                  placeholder="40, 41, 42"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  Màu (cách nhau bởi dấu phẩy)
                </label>
                <input
                  type="text"
                  value={newProduct.colors}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, colors: e.target.value })
                  }
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-2 outline-none"
                  placeholder="Trắng, Đen"
                />
              </div>

              <button
                type="submit"
                className="col-span-2 bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 mt-4 hover:bg-black transition-all shadow-xl shadow-blue-100 active:scale-95"
              >
                <Save size={20} /> LƯU VÀ XUẤT BẢN
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL FORM THÊM BÀI VIẾT --- */}
      {showNewsForm && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-[2rem] p-10 w-full max-w-4xl shadow-2xl relative my-auto animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowNewsForm(false);
                setEditingNews(null);
                setNewNews({
                  title: "",
                  content: "",
                  image: "",
                  author: userInfo?.name || "Admin",
                });
              }}
              className="absolute top-8 right-8 text-gray-400 hover:text-black transition-colors"
            >
              <X size={28} />
            </button>

            <h2 className="text-3xl font-black mb-2 uppercase tracking-tight">
              {editingNews ? "Chỉnh Sửa Bài Viết" : "Thêm Bài Viết Mới"}
            </h2>
            <p className="text-gray-400 text-sm mb-8 font-medium">
              {editingNews
                ? "Cập nhật thông tin bài viết."
                : "Viết bài viết mới cho blog SneakerZone."}
            </p>

            <form onSubmit={handleNewsSubmit} className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  Tiêu đề bài viết
                </label>
                <input
                  type="text"
                  required
                  value={newNews.title}
                  onChange={(e) =>
                    setNewNews({ ...newNews, title: e.target.value })
                  }
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-2 focus:ring-2 ring-green-500 transition-all outline-none"
                  placeholder="Nhập tiêu đề bài viết..."
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  Tác giả
                </label>
                <input
                  type="text"
                  value={newNews.author}
                  onChange={(e) =>
                    setNewNews({ ...newNews, author: e.target.value })
                  }
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-2 outline-none"
                  placeholder="Tên tác giả"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  URL hình ảnh (tùy chọn)
                </label>
                <input
                  type="url"
                  value={newNews.image}
                  onChange={(e) =>
                    setNewNews({ ...newNews, image: e.target.value })
                  }
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-2 outline-none"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  Nội dung bài viết
                </label>
                <textarea
                  required
                  value={newNews.content}
                  onChange={(e) =>
                    setNewNews({ ...newNews, content: e.target.value })
                  }
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-2 outline-none h-64 resize-none"
                  placeholder="Viết nội dung bài viết ở đây... (có thể dùng HTML)"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 mt-4 hover:bg-green-700 transition-all shadow-xl shadow-green-100 active:scale-95"
              >
                <Save size={20} />{" "}
                {editingNews ? "CẬP NHẬT BÀI VIẾT" : "XUẤT BẢN BÀI VIẾT"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
