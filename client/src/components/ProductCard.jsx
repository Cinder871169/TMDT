import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import api from "../utils/api";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { userInfo } = useAuthStore();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userInfo) {
      checkWishlistStatus();
    }
  }, [userInfo, product._id]);

  const checkWishlistStatus = async () => {
    if (!userInfo || !userInfo.token) return;

    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      const { data } = await api.get(`/api/users/wishlist`);
      const isInWishlist = data.products.some((p) => p._id === product._id);
      setIsInWishlist(isInWishlist);
    } catch (error) {
      console.error("Error checking wishlist status:", error);
      if (error.response?.status === 401) {
        // Token expired, user needs to login again
        setIsInWishlist(false);
      }
    }
  };

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userInfo) {
      toast.error("Vui lòng đăng nhập để thêm vào wishlist");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };

      if (isInWishlist) {
        await api.delete(`/api/users/wishlist/${product._id}`);
        setIsInWishlist(false);
        toast.success("Đã xóa khỏi wishlist");
      } else {
        await api.post(`/api/users/wishlist/${product._id}`);
        setIsInWishlist(true);
        toast.success("Đã thêm vào wishlist");
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        navigate("/login");
      } else {
        toast.error("Lỗi khi cập nhật wishlist");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group bg-white rounded-[2rem] p-4 border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
      <div className="relative overflow-hidden rounded-2xl mb-5">
        <Link to={`/product/${product._id}`}>
          <img
            src={product.image}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
            alt={product.name}
          />
        </Link>

        <button
          onClick={toggleWishlist}
          disabled={loading}
          className={`absolute top-3 right-3 p-2 rounded-full shadow transition-colors ${
            isInWishlist
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-white hover:bg-orange-50"
          }`}
        >
          <Heart size={18} className={isInWishlist ? "fill-white" : ""} />
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-gray-400 uppercase font-bold">
          {product.brand}
        </p>

        <Link
          to={`/product/${product._id}`}
          className="font-black text-sm line-clamp-2 hover:text-orange-600"
        >
          {product.name}
        </Link>

        <div className="flex items-center gap-1 text-orange-500">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} />
          ))}
        </div>

        <div className="flex justify-between items-center pt-3">
          <p className="font-black text-lg">
            {product.price.toLocaleString("vi-VN")}đ
          </p>

          {/* CART BUTTON */}
          <button
            onClick={() => {
              toast("Please select size first");
              navigate(`/product/${product._id}`);
            }}
            className="bg-black text-white p-3 rounded-xl hover:bg-orange-600 transition"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
