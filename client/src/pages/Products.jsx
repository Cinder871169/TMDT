import { useEffect, useMemo, useState } from "react";
import api from "../utils/api";
import ProductCard from "../components/ProductCard";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("All");
  const [brand, setBrand] = useState("All");
  const [sort, setSort] = useState("");
  const [price, setPrice] = useState(10000000);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/api/products");
        setProducts(data);
      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const tags = new Set();
    products.forEach((p) => p.category && tags.add(p.category));
    return ["All", ...Array.from(tags)];
  }, [products]);

  const brands = useMemo(() => {
    const tags = new Set();
    products.forEach((p) => p.brand && tags.add(p.brand));
    return ["All", ...Array.from(tags)];
  }, [products]);

  // Filter products
  let filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(keyword.toLowerCase())
  );

  if (category !== "All") {
    filteredProducts = filteredProducts.filter((p) => p.category === category);
  }

  if (brand !== "All") {
    filteredProducts = filteredProducts.filter((p) => p.brand === brand);
  }

  filteredProducts = filteredProducts.filter((p) => p.price <= price);

  if (sort === "low") {
    filteredProducts.sort((a, b) => a.price - b.price);
  }
  if (sort === "high") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  const resetFilters = () => {
    setKeyword("");
    setCategory("All");
    setBrand("All");
    setSort("");
    setPrice(10000000);
  };

  const hasActiveFilters = keyword || category !== "All" || brand !== "All" || sort || price < 10000000;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-black text-gray-900">Sản phẩm</h1>
          <p className="text-gray-500 mt-2">
            Khám phá {products.length} sản phẩm giày chính hãng
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Filters */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Bộ lọc</h2>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-sm text-orange-500 hover:text-orange-600 font-medium"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm sản phẩm..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full border border-gray-200 p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Category */}
              {categories.length > 1 && (
                <div className="mb-6">
                  <h3 className="font-bold text-sm text-gray-700 mb-3 uppercase tracking-wide">
                    Danh mục
                  </h3>
                  <div className="space-y-1">
                    {categories.map((item) => (
                      <button
                        key={item}
                        onClick={() => setCategory(item)}
                        className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                          category === item
                            ? "bg-orange-500 text-white font-medium"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Brand */}
              {brands.length > 1 && (
                <div className="mb-6">
                  <h3 className="font-bold text-sm text-gray-700 mb-3 uppercase tracking-wide">
                    Thương hiệu
                  </h3>
                  <div className="space-y-1">
                    {brands.map((item) => (
                      <button
                        key={item}
                        onClick={() => setBrand(item)}
                        className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                          brand === item
                            ? "bg-orange-500 text-white font-medium"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div className="mb-2">
                <h3 className="font-bold text-sm text-gray-700 mb-3 uppercase tracking-wide">
                  Giá tối đa
                </h3>
                <input
                  type="range"
                  min="0"
                  max="10000000"
                  step="100000"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>0đ</span>
                  <span className="font-medium text-orange-600">
                    {price.toLocaleString()}đ
                  </span>
                  <span>10.000.000đ</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Active Filters Tags */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-gray-500">
                  {filteredProducts.length} sản phẩm
                </span>
                {keyword && (
                  <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                    "{keyword}"
                    <button onClick={() => setKeyword("")} className="hover:text-orange-900">
                      ×
                    </button>
                  </span>
                )}
                {category !== "All" && (
                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                    {category}
                    <button onClick={() => setCategory("All")} className="hover:text-blue-900">
                      ×
                    </button>
                  </span>
                )}
                {brand !== "All" && (
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    {brand}
                    <button onClick={() => setBrand("All")} className="hover:text-green-900">
                      ×
                    </button>
                  </span>
                )}
                {price < 10000000 && (
                  <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                    ≤ {price.toLocaleString()}đ
                    <button onClick={() => setPrice(10000000)} className="hover:text-purple-900">
                      ×
                    </button>
                  </span>
                )}
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sắp xếp:</span>
                <select
                  onChange={(e) => setSort(e.target.value)}
                  value={sort}
                  className="border border-gray-200 px-4 py-2 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                >
                  <option value="">Mặc định</option>
                  <option value="low">Giá thấp → cao</option>
                  <option value="high">Giá cao → thấp</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse bg-white rounded-2xl p-4 shadow-sm"
                  >
                    <div className="h-64 bg-gray-200 rounded-2xl mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-gray-500 mb-6">
                  Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
                </p>
                <button
                  onClick={resetFilters}
                  className="bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
