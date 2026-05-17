import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Star, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useCartStore } from "../store/useCartStore";
import api from "../utils/api";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { userInfo } = useAuthStore();
  const { addToCart } = useCartStore();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [ratingData, setRatingData] = useState({ average: 0, total: 0 });
  const imgRef = useRef(null);

  // Initialize selected color when product loads
  useEffect(() => {
    if (product.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0]);
    }
  }, [product.colors]);

  useEffect(() => {
    if (userInfo) {
      checkWishlistStatus();
    }
    fetchRatingSummary();
  }, [userInfo, product._id]);

  // Reset image index when color changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedColor]);

  // Fetch rating summary
  const fetchRatingSummary = async () => {
    try {
      const { data } = await api.get(`/api/reviews/${product._id}/summary`);
      setRatingData({
        average: data.average || 0,
        total: data.total || 0
      });
    } catch (error) {
      setRatingData({ average: 0, total: 0 });
    }
  };

  // Helper function to render stars
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={12}
        className={i < Math.floor(rating) ? "fill-orange-500" : "fill-gray-200"}
      />
    ));
  };

  const checkWishlistStatus = async () => {
    if (!userInfo || !userInfo.token) return;

    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      const { data } = await api.get(`/api/users/wishlist`, config);
      const isInWishlist = data.products.some((p) => p._id === product._id);
      setIsInWishlist(isInWishlist);
    } catch (error) {
      console.error("Error checking wishlist status:", error);
      if (error.response?.status === 401) {
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
        await api.delete(`/api/users/wishlist/${product._id}`, config);
        setIsInWishlist(false);
        toast.success("Đã xóa khỏi wishlist");
      } else {
        await api.post(`/api/users/wishlist/${product._id}`, {}, config);
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

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickAdd(true);
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Vui lòng chọn size");
      return;
    }
    if (!selectedColor) {
      toast.error("Vui lòng chọn màu");
      return;
    }

    // Check stock
    if (product.countInStock === 0) {
      toast.error("Sản phẩm đã hết hàng");
      return;
    }

    // Check current quantity in cart
    const cartKey = `${product._id}-${selectedSize}-${selectedColor.name}`;
    const currentCartQty = get().cart.reduce((total, item) => {
      const itemKey = `${item._id}-${item.size}-${item.color}`;
      return itemKey === cartKey ? total + item.quantity : total;
    }, 0);

    if (currentCartQty >= product.countInStock) {
      toast.error(`Bạn đã có ${currentCartQty} sản phẩm này trong giỏ. Không thể thêm nữa.`);
      return;
    }

    addToCart({
      ...product,
      image: selectedColor.images?.[0] || product.image,
      size: selectedSize,
      color: selectedColor.name,
    });

    toast.success("Đã thêm vào giỏ hàng!");
    setShowQuickAdd(false);
    setSelectedSize(null);
  };

  // Get current image based on selected color
  const getCurrentImage = () => {
    if (selectedColor?.images && selectedColor.images.length > 0) {
      return selectedColor.images[currentImageIndex];
    }
    return product.image || 'https://placehold.co/400x400/cccccc/666666?text=Product';
  };

  return (
    <>
      <div className="group bg-white rounded-[2rem] p-4 border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
        <div className="relative overflow-hidden rounded-2xl mb-5">
          <Link to={`/product/${product._id}`}>
            {/* Skeleton loading */}
            {!imageLoaded && (
              <div className="w-full h-64 bg-gray-200 animate-pulse rounded-2xl"></div>
            )}

            <img
              ref={imgRef}
              onLoad={() => {
                setImageLoaded(true);
                setImageError(false);
              }}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
              className={`w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700 ${imageLoaded ? "opacity-100" : "opacity-0"
                }`}
              src={imageError ? 'https://placehold.co/400x400/cccccc/666666?text=No+Image' : getCurrentImage()}
              alt={product.name}
            />

            {/* Image navigation dots for multiple images */}
            {selectedColor?.images && selectedColor.images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {selectedColor.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImageIndex(idx);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${currentImageIndex === idx ? "bg-white w-4" : "bg-white/50 hover:bg-white/75"
                      }`}
                  />
                ))}
              </div>
            )}
          </Link>

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button
              onClick={handleQuickAdd}
              className="bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-orange-500 hover:text-white transition-colors duration-300 flex items-center gap-2 shadow-lg"
            >
              <Plus size={18} />
              Thêm nhanh
            </button>
          </div>

          <button
            onClick={toggleWishlist}
            disabled={loading}
            className={`absolute top-3 right-3 p-2 rounded-full shadow-lg transition-all duration-300 ${isInWishlist
              ? "bg-red-500 text-white hover:bg-red-600 scale-110"
              : "bg-white/90 hover:bg-white hover:scale-110"
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Heart size={18} className={isInWishlist ? "fill-white" : ""} />
          </button>

          {/* Stock status */}
          {product.countInStock === 0 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              Hết hàng
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
            {product.brand}
          </p>

          <Link
            to={`/product/${product._id}`}
            className="font-black text-sm line-clamp-2 hover:text-orange-600 transition-colors"
          >
            {product.name}
          </Link>

          {/* Real rating display */}
          <div className="flex items-center gap-1 text-orange-500">
            {renderStars(ratingData.average)}
            <span className="text-xs text-gray-500 ml-1">
              ({ratingData.average.toFixed(1)}) {ratingData.total > 0 && `• ${ratingData.total} đánh giá`}
            </span>
          </div>

          {/* Color swatches */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex gap-2 pt-1">
              {product.colors.map((color, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedColor(color);
                    setCurrentImageIndex(0);
                  }}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${selectedColor?.name === color.name
                    ? "border-orange-500 ring-2 ring-orange-200"
                    : "border-gray-200 hover:border-gray-400"
                    }`}
                  style={{
                    backgroundColor: getColorHex(color.name),
                  }}
                  title={color.name}
                />
              ))}
            </div>
          )}

          <div className="flex justify-between items-center pt-3">
            <div>
              {product.isOnSale && product.originalPrice ? (
                <>
                  <p className="font-black text-lg text-gray-900">
                    {product.price.toLocaleString("vi-VN")}đ
                  </p>
                  <p className="text-xs text-gray-500 line-through">
                    {product.originalPrice.toLocaleString("vi-VN")}đ
                  </p>
                  <div className="inline-block bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full mt-1">
                    -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </div>
                </>
              ) : (
                <p className="font-black text-lg text-gray-900">
                  {product.price.toLocaleString("vi-VN")}đ
                </p>
              )}
            </div>

            <button
              onClick={() => navigate(`/product/${product._id}`)}
              className="bg-black text-white p-3 rounded-xl hover:bg-orange-600 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <ShoppingCart size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <div className="flex items-center gap-4 mb-6">
              <img
                src={getCurrentImage()}
                alt={product.name}
                className="w-16 h-16 rounded-xl object-cover"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/64x64/cccccc/666666?text=Img';
                }}
              />
              <div>
                <h3 className="font-bold text-sm">{product.name}</h3>
                <p className="text-orange-600 font-black">
                  {product.price.toLocaleString("vi-VN")}đ
                </p>
              </div>
            </div>

            {/* Color Selection */}
            <div className="mb-6">
              <h4 className="font-bold mb-3">Chọn màu:</h4>
              <div className="flex flex-wrap gap-2">
                {product.colors?.map((color, index) => (
                  <div key={index} className="relative">
                    <button
                      onClick={() => {
                        setSelectedColor(color);
                        setCurrentImageIndex(0);
                      }}
                      className={`px-4 py-2 rounded-xl border-2 font-medium transition-all flex items-center gap-2 ${selectedColor?.name === color.name
                        ? "border-orange-500 bg-orange-50 text-orange-600"
                        : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: getColorHex(color.name) }}
                      />
                      {color.name}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-6">
              <h4 className="font-bold mb-3">Chọn size:</h4>
              <div className="grid grid-cols-4 gap-2">
                {product.sizes?.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`p-3 rounded-xl border-2 font-bold transition-all ${selectedSize === size
                      ? "border-orange-500 bg-orange-50 text-orange-600"
                      : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowQuickAdd(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3 bg-black text-white rounded-xl font-bold hover:bg-orange-600 transition-colors"
              >
                Thêm vào giỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Helper function to get color hex from color name
function getColorHex(colorName) {
  const colorMap = {
    'đen': '#000000',
    'black': '#000000',
    'trắng': '#FFFFFF',
    'white': '#FFFFFF',
    'đỏ': '#DC2626',
    'red': '#DC2626',
    'xanh lá': '#16A34A',
    'green': '#16A34A',
    'xanh dương': '#2563EB',
    'blue': '#2563EB',
    'vàng': '#EAB308',
    'yellow': '#EAB308',
    'cam': '#F97316',
    'orange': '#F97316',
    'tím': '#9333EA',
    'purple': '#9333EA',
    'hồng': '#EC4899',
    'pink': '#EC4899',
    'xám': '#6B7280',
    'gray': '#6B7280',
    'grey': '#6B7280',
    'nâu': '#92400E',
    'brown': '#92400E',
    'be': '#F5F5DC',
    'kem': '#FFFACD',
    'bạc': '#C0C0C0',
    'silver': '#C0C0C0',
    'vàng gold': '#FFD700',
    'gold': '#FFD700',
  };
  return colorMap[colorName.toLowerCase()] || '#9CA3AF';
}
