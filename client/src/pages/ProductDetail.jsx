import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { ShoppingCart, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useCartStore } from "../store/useCartStore";
import { toast } from "react-hot-toast";
import RelatedProducts from "../components/RelatedProduct";
import RatingSummary from "../components/review/RatingSummary";
import ReviewForm from "../components/review/ReviewForm";
import ReviewList from "../components/review/ReviewList";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const addToCart = useCartStore((state) => state.addToCart);
  const cart = useCartStore((state) => state.cart);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/products/${id}`
        );
        setProduct(data);
        
        // Set initial image and color based on new structure
        if (data.colors && data.colors.length > 0) {
          setSelectedColor(data.colors[0]);
          if (data.colors[0].images && data.colors[0].images.length > 0) {
            setActiveImage(data.colors[0].images[0]);
          } else {
            setActiveImage(data.image || null);
          }
        } else {
          setActiveImage(data.image || null);
        }
        setLoading(false);
      } catch (error) {
        console.error("Lỗi tải chi tiết:", error);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Update active image when selected color changes
  useEffect(() => {
    if (selectedColor && selectedColor.images && selectedColor.images.length > 0) {
      setActiveImage(selectedColor.images[0]);
      setActiveImageIndex(0);
    } else if (product) {
      setActiveImage(product.image || null);
    }
  }, [selectedColor]);

  const getImageSrc = (imgUrl) => {
    if (!imgUrl) return 'https://placehold.co/500x500/cccccc/666666?text=No+Image';
    return imgUrl;
  };

  // Get all images for thumbnails
  const getAllImages = () => {
    if (selectedColor?.images && selectedColor.images.length > 0) {
      return selectedColor.images;
    }
    if (product?.images && product.images.length > 0) {
      return [product.image, ...product.images];
    }
    return product?.image ? [product.image] : [];
  };

  const nextImage = () => {
    const images = getAllImages();
    if (images.length > 1) {
      const newIndex = (activeImageIndex + 1) % images.length;
      setActiveImageIndex(newIndex);
      setActiveImage(images[newIndex]);
    }
  };

  const prevImage = () => {
    const images = getAllImages();
    if (images.length > 1) {
      const newIndex = (activeImageIndex - 1 + images.length) % images.length;
      setActiveImageIndex(newIndex);
      setActiveImage(images[newIndex]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 animate-pulse">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-700">Không tìm thấy sản phẩm</h2>
          <Link to="/" className="text-orange-500 hover:underline mt-4 inline-block">
            Quay lại cửa hàng
          </Link>
        </div>
      </div>
    );
  }

  const allImages = getAllImages();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-orange-500 transition-colors">
          Trang chủ
        </Link>
        <span>/</span>
        <Link to="/products" className="hover:text-orange-500 transition-colors">
          Sản phẩm
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate">{product.name}</span>
      </nav>

      {/* Main Product Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 lg:p-8">
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-white shadow-md">
                <img
                  src={imageError ? 'https://placehold.co/500x500/cccccc/666666?text=No+Image' : getImageSrc(activeImage)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              </div>

              {/* Navigation arrows */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Sale Badge */}
              {product.isOnSale && product.originalPrice && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                  -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% GIẢM
                </div>
              )}

              {/* Out of Stock Badge */}
              {product.countInStock === 0 && (
                <div className="absolute top-4 right-4 bg-gray-800 text-white px-3 py-1.5 rounded-full text-sm font-bold">
                  Hết hàng
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {allImages.map((img, i) => (
                  <img
                    key={i}
                    src={getImageSrc(img)}
                    onClick={() => {
                      setActiveImage(img);
                      setActiveImageIndex(i);
                      setImageError(false);
                    }}
                    onError={() => {}}
                    className={`w-16 h-16 lg:w-20 lg:h-20 rounded-lg object-cover cursor-pointer border-2 transition-all flex-shrink-0 ${
                      activeImage === img
                        ? "border-orange-500 shadow-md"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Image counter */}
            {allImages.length > 1 && (
              <p className="text-center text-sm text-gray-500 mt-2">
                {activeImageIndex + 1} / {allImages.length}
              </p>
            )}
          </div>

          {/* Product Info */}
          <div className="p-6 lg:p-10 flex flex-col">
            {/* Brand */}
            <span className="inline-block bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider w-fit mb-4">
              {product.brand}
            </span>

            {/* Name */}
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 mb-4 leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mb-6">
              {product.isOnSale && product.originalPrice ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-red-500">
                    {product.price.toLocaleString("vi-VN")}đ
                  </span>
                  <span className="text-lg text-gray-400 line-through">
                    {product.originalPrice.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-black text-gray-900">
                  {product.price.toLocaleString("vi-VN")}đ
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-8 leading-relaxed">
              {product.description}
            </p>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  Màu sắc
                  {selectedColor && (
                    <span className="text-sm font-normal text-gray-500">
                      • {selectedColor.name}
                    </span>
                  )}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-xl border-2 font-medium transition-all flex items-center gap-2 ${
                        selectedColor?.name === color.name
                          ? "border-orange-500 bg-orange-50 text-orange-600"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full border border-gray-300"
                        style={{ backgroundColor: getColorHex(color.name) }}
                      />
                      {color.name}
                      {color.images && color.images.length > 0 && (
                        <span className="text-xs text-gray-400">
                          ({color.images.length})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-8">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  Kích cỡ
                  {selectedSize && (
                    <span className="text-sm font-normal text-gray-500">
                      • Size {selectedSize}
                    </span>
                  )}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 flex items-center justify-center border-2 rounded-xl text-sm font-bold transition-all ${
                        selectedSize === size
                          ? "border-orange-500 bg-orange-500 text-white"
                          : "border-gray-200 hover:border-orange-500 hover:text-orange-500"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selection */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">Số lượng</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden h-12">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold transition-colors text-xl"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val >= 1) {
                        setQuantity(Math.min(val, product.countInStock || 1));
                      } else if (e.target.value === "") {
                        setQuantity("");
                      }
                    }}
                    onBlur={() => {
                      if (!quantity || quantity < 1) setQuantity(1);
                    }}
                    className="w-16 h-full text-center font-bold text-lg text-gray-900 outline-none border-x-2 border-gray-200 focus:bg-orange-50 appearance-none m-0"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.countInStock || 1, quantity + 1))}
                    className="w-12 h-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold transition-colors text-xl"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="mt-auto space-y-3">
              <button
                onClick={() => {
                  if (!selectedSize) {
                    toast.error("Vui lòng chọn size");
                    return;
                  }
                  if (!selectedColor) {
                    toast.error("Vui lòng chọn màu sắc");
                    return;
                  }
                  if (product.countInStock === 0) {
                    toast.error("Sản phẩm đã hết hàng");
                    return;
                  }

                  // Check if already in cart
                  const cartKey = `${product._id}-${selectedSize}-${selectedColor.name}`;
                  const currentCartQty = cart.reduce((total, item) => {
                    const itemKey = `${item._id}-${item.size}-${item.color}`;
                    return itemKey === cartKey ? total + item.quantity : total;
                  }, 0);

                  const qtyToAdd = quantity || 1;

                  if (currentCartQty + qtyToAdd > product.countInStock) {
                    toast.error(`Số lượng còn lại trong kho không đủ (đã có ${currentCartQty} trong giỏ).`);
                    return;
                  }

                  addToCart({
                    ...product,
                    image: selectedColor.images?.[0] || product.image,
                    size: selectedSize,
                    color: selectedColor.name,
                    quantity: qtyToAdd,
                  });

                  toast.success("Đã thêm vào giỏ hàng!");
                }}
                disabled={product.countInStock === 0}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg ${
                  product.countInStock === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-black hover:bg-orange-500 text-white active:scale-[0.98]"
                }`}
              >
                <ShoppingCart size={22} />
                {product.countInStock === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
              </button>

              {/* Stock Info */}
              <p className="text-center text-sm text-gray-500">
                {product.countInStock > 0 ? (
                  <span className="text-green-600">
                    ✓ Còn {product.countInStock} sản phẩm
                  </span>
                ) : (
                  <span className="text-red-500">Sản phẩm tạm hết hàng</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-10">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 lg:p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Star className="text-orange-500 fill-orange-500" size={24} />
            Đánh giá sản phẩm
          </h2>

          <RatingSummary productId={id} />
          <ReviewForm productId={id} />
          <ReviewList productId={id} />
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-10">
        <RelatedProducts brand={product.brand} />
      </div>
    </div>
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
  return colorMap[colorName?.toLowerCase()] || '#9CA3AF';
}
