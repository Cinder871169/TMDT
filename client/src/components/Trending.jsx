import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import ProductCard from "./ProductCard";
import { TrendingUp, Flame, Trophy } from "lucide-react";

export default function Trending() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/api/products/trending?limit=6");
        setProducts(data);
      } catch (error) {
        console.error("Lỗi load trending:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  return (
    <section className="py-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div className="flex items-center gap-3">
          {/* Flame icon badge */}
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 flex-shrink-0">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-2xl font-black tracking-tight">Bán Chạy Nhất</h2>
              <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 text-xs font-bold px-2.5 py-1 rounded-full border border-orange-100">
                <TrendingUp className="w-3 h-3" /> Hot
              </span>
            </div>
            <p className="text-sm text-gray-400">Top sản phẩm được mua nhiều nhất</p>
          </div>
        </div>
        <Link
          to="/products"
          className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1.5 transition-colors group"
        >
          Xem tất cả
          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {loading
          ? [...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-3 animate-pulse">
                <div className="h-40 bg-gray-100 rounded-xl mb-3" />
                <div className="h-2.5 bg-gray-100 rounded w-1/3 mb-2" />
                <div className="h-3.5 bg-gray-100 rounded w-3/4" />
              </div>
            ))
          : products.map((product, index) => (
              <div key={product._id} className="relative">
                {/* Rank badge for top 3 */}
                {index < 3 && (
                  <div className={`absolute top-3 left-3 z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-md ${
                    index === 0 ? "bg-yellow-400 text-yellow-900" :
                    index === 1 ? "bg-gray-300 text-gray-700" :
                                  "bg-orange-300 text-orange-900"
                  }`}>
                    {index === 0 ? <Trophy className="w-3.5 h-3.5" /> : `#${index + 1}`}
                  </div>
                )}
                {/* Sold count badge */}
                {product.totalSold > 0 && (
                  <div className="absolute top-3 right-3 z-10 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
                    Đã bán {product.totalSold}
                  </div>
                )}
                <ProductCard product={product} compact />
              </div>
            ))}
      </div>
    </section>
  );
}
