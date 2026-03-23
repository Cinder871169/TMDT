import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { ShoppingCart, ArrowLeft, Star } from "lucide-react";
import { useCartStore } from "../store/useCartStore";
import { toast } from "react-hot-toast";
import RelatedProducts from "../components/RelatedProduct";

export default function ProductDetail() {

  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState(null);
  const [activeImage, setActiveImage] = useState(null);

  const addToCart = useCartStore((state) => state.addToCart);
  const [selectedColor, setSelectedColor] = useState(null);
  useEffect(() => {
    const fetchProduct = async () => {

      try {

        const { data } = await axios.get(
          `http://localhost:5000/api/products/${id}`
        );

        setProduct(data);
        setActiveImage(data.image);
        setLoading(false);

      } catch (error) {
        console.error("Lỗi tải chi tiết:", error);
        setLoading(false);
      }
    };

    fetchProduct();

  }, [id]);

  if (loading)
    return (
      <div className="text-center mt-32 text-xl font-bold animate-pulse">
        Đang tải dữ liệu giày...
      </div>
    );

  if (!product)
    return (
      <div className="text-center mt-32 text-xl text-red-500">
        Không tìm thấy đôi giày này!
      </div>
    );

  return (

    <div className="max-w-7xl mx-auto px-4 py-12">

      <Link
        to="/"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-500 mb-8 font-medium transition-colors"
      >
        <ArrowLeft size={20} /> Quay lại cửa hàng
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-gray-100">

        {/* IMAGE GALLERY */}

        <div>

          <div className="bg-gray-100 rounded-2xl overflow-hidden h-[450px] mb-4">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex gap-3">

            {[product.image, product.image, product.image].map((img, i) => (

              <img
                key={i}
                src={img}
                onClick={() => setActiveImage(img)}
                className="w-20 h-20 rounded-lg object-cover cursor-pointer border hover:border-orange-500"
              />

            ))}

          </div>

        </div>

        {/* PRODUCT INFO */}

        <div className="flex flex-col justify-center">

          <span className="text-sm font-extrabold tracking-widest text-orange-500 uppercase mb-2">
            {product.brand}
          </span>

          <h1 className="text-4xl font-black text-gray-900 mb-4">
            {product.name}
          </h1>

          {/* RATING */}

          <div className="flex items-center gap-1 mb-6">

            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={18}
                className="fill-yellow-400 text-yellow-400"
              />
            ))}

            <span className="text-sm text-gray-500 ml-2">
              (128 đánh giá)
            </span>

          </div>

          <p className="text-3xl font-black text-orange-600 mb-6">
            {product.price.toLocaleString("vi-VN")}đ
          </p>

          <p className="text-gray-600 mb-8 leading-relaxed text-lg">
            {product.description}
          </p>

          {/* COLOR */}

          <div className="mb-6">

            <h3 className="font-bold mb-3">
              Màu sắc
            </h3>

            <div className="flex gap-3">

              {product.colors?.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-5 py-2 border rounded-xl
                          ${selectedColor === color
                      ? "border-black bg-black text-white"
                      : "border-gray-200 hover:border-orange-500"
                    }
 `}
                >

                  {color}

                </button>
              ))}

            </div>

          </div>

          {/* SIZE SELECTOR */}

          <div className="mb-10">

            <h3 className="font-bold text-gray-900 mb-3 uppercase text-sm tracking-wider">
              Kích cỡ
            </h3>

            <div className="flex gap-3 flex-wrap">

              {product.sizes?.map((s) => (

                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`w-12 h-12 flex items-center justify-center border-2 rounded-xl text-sm font-bold transition
                  
                  ${selectedSize === s
                      ? "border-black bg-black text-white"
                      : "border-gray-200 hover:border-orange-500 hover:text-orange-500"}
                  
                  `}
                >
                  {s}
                </button>

              ))}

            </div>

          </div>

          {/* ADD TO CART */}

          <button
            onClick={() => {

              if (!selectedSize) {
                toast.error("Vui lòng chọn size");
                return;
              }

              if (!selectedColor) {
                toast.error("Chọn màu")
                return
              }

              addToCart({
                ...product,
                size: selectedSize,
                color: selectedColor,
              });

              toast.success("Đã thêm vào giỏ hàng");

            }}

            className="bg-black hover:bg-orange-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-colors w-full sm:w-2/3 shadow-lg active:scale-95 transform"
          >

            <ShoppingCart size={22} />

            Thêm Vào Giỏ Hàng

          </button>

        </div>

      </div>
      <RelatedProducts brand={product.brand} />
    </div>

  );

}