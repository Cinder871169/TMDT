import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuthStore } from "../store/useAuthStore";
import { Heart, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userInfo } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (userInfo) {
      fetchWishlist();
    }
  }, [userInfo]);

  const fetchWishlist = async () => {
    if (!userInfo || !userInfo.token) {
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      const { data } = await api.get(`/api/users/wishlist`);
      setWishlist(data.products);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      if (error.response?.status === 401) {
        // Token expired or invalid, redirect to login
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      await api.delete(`/api/users/wishlist/${productId}`);
      setWishlist(wishlist.filter((product) => product._id !== productId));
      toast.success("Đã xóa khỏi wishlist");
    } catch (error) {
      toast.error("Lỗi khi xóa sản phẩm");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded mb-8"></div>
          <div className="grid md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 rounded-2xl h-80"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="text-red-500" size={32} />
        <h1 className="text-3xl font-black">Danh Sách Yêu Thích</h1>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="text-gray-300 mx-auto mb-6" size={80} />
          <h2 className="text-xl font-bold text-gray-600 mb-4">
            Wishlist trống
          </h2>
          <p className="text-gray-500 mb-8">
            Bạn chưa thêm sản phẩm nào vào danh sách yêu thích
          </p>
          <Link
            to="/products"
            className="bg-orange-500 text-white px-8 py-4 rounded-xl hover:bg-orange-600 transition-colors inline-block"
          >
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <Link to={`/product/${product._id}`}>
                  <img
                    src={product.image || "/images/default-product.jpg"}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                </Link>
                <button
                  onClick={() => removeFromWishlist(product._id)}
                  className="absolute top-3 right-3 bg-white/80 hover:bg-white p-2 rounded-full shadow-sm transition-colors"
                >
                  <Heart className="text-red-500 fill-red-500" size={20} />
                </button>
              </div>

              <div className="p-4">
                <Link to={`/product/${product._id}`}>
                  <h3 className="font-bold text-lg mb-2 line-clamp-2 hover:text-orange-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>

                <p className="text-gray-600 text-sm mb-2">{product.brand}</p>

                <div className="flex items-center justify-between">
                  <span className="text-xl font-black text-orange-600">
                    {product.price.toLocaleString("vi-VN")}đ
                  </span>
                  <Link
                    to={`/product/${product._id}`}
                    className="bg-black text-white p-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <ShoppingCart size={18} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
