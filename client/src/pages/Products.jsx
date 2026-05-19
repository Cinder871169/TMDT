import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../utils/api";
import ProductCard from "../components/ProductCard";
import { SlidersHorizontal, X, ChevronDown, LayoutGrid, List } from "lucide-react";

// ─── Dual Range Slider ────────────────────────────────────────────────────────
function DualRangeSlider({ min, max, step, valueMin, valueMax, onChange }) {
  const rangeRef = useRef(null);

  const getPercent = useCallback(
    (val) => Math.round(((val - min) / (max - min)) * 100),
    [min, max]
  );

  const pMin = getPercent(valueMin);
  const pMax = getPercent(valueMax);

  return (
    <div className="relative pt-1 pb-1">
      {/* Track */}
      <div className="relative h-1.5 rounded-full bg-gray-200">
        {/* Active range */}
        <div
          className="absolute h-full rounded-full bg-orange-500"
          style={{ left: `${pMin}%`, width: `${pMax - pMin}%` }}
        />
      </div>

      {/* Min thumb */}
      <input
        ref={rangeRef}
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMin}
        onChange={(e) => {
          const val = Math.min(Number(e.target.value), valueMax - step);
          onChange(val, valueMax);
        }}
        className="absolute inset-0 w-full opacity-0 cursor-pointer h-1.5"
        style={{ zIndex: valueMin > max - step ? 5 : 3 }}
      />

      {/* Max thumb */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMax}
        onChange={(e) => {
          const val = Math.max(Number(e.target.value), valueMin + step);
          onChange(valueMin, val);
        }}
        className="absolute inset-0 w-full opacity-0 cursor-pointer h-1.5"
        style={{ zIndex: 4 }}
      />

      {/* Thumb visuals */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-orange-500 rounded-full shadow-md pointer-events-none transition-transform hover:scale-110"
        style={{ left: `calc(${pMin}% - 8px)` }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-orange-500 rounded-full shadow-md pointer-events-none transition-transform hover:scale-110"
        style={{ left: `calc(${pMax}% - 8px)` }}
      />
    </div>
  );
}

// ─── Collapsible Filter Section ───────────────────────────────────────────────
function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-3.5 mb-3.5 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between mb-2 group"
      >
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          {title}
        </span>
        <ChevronDown
          size={12}
          className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

// ─── Main Products Page ───────────────────────────────────────────────────────
const PRICE_MAX = 10000000;
const PRICE_STEP = 100000;

const ALL_SIZES = [36, 37, 38, 39, 40, 41, 42, 43, 44];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter state — sync with URL params
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [brand, setBrand] = useState(searchParams.get("brand") || "All");
  const [sort, setSort] = useState(searchParams.get("sort") || "");
  const [priceMin, setPriceMin] = useState(Number(searchParams.get("pmin")) || 0);
  const [priceMax, setPriceMax] = useState(Number(searchParams.get("pmax")) || PRICE_MAX);
  const [selectedSizes, setSelectedSizes] = useState(
    searchParams.get("sizes") ? searchParams.get("sizes").split(",").map(Number) : []
  );
  const [inStockOnly, setInStockOnly] = useState(searchParams.get("instock") === "1");

  // Sync URL when filters change
  useEffect(() => {
    const params = {};
    if (keyword) params.keyword = keyword;
    if (brand !== "All") params.brand = brand;
    if (sort) params.sort = sort;
    if (priceMin > 0) params.pmin = priceMin;
    if (priceMax < PRICE_MAX) params.pmax = priceMax;
    if (selectedSizes.length) params.sizes = selectedSizes.join(",");
    if (inStockOnly) params.instock = "1";
    setSearchParams(params, { replace: true });
  }, [keyword, brand, sort, priceMin, priceMax, selectedSizes, inStockOnly]);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/api/products");
        setProducts(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const brands = useMemo(() => {
    const s = new Set();
    products.forEach((p) => p.brand && s.add(p.brand));
    return ["All", ...Array.from(s).sort()];
  }, [products]);

  // Filter + sort
  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => {
      if (keyword && !p.name.toLowerCase().includes(keyword.toLowerCase()) &&
          !p.brand?.toLowerCase().includes(keyword.toLowerCase())) return false;
      if (brand !== "All" && p.brand !== brand) return false;
      if (p.price < priceMin || p.price > priceMax) return false;
      if (inStockOnly && p.countInStock === 0) return false;
      if (selectedSizes.length > 0 && !selectedSizes.some(s => p.sizes?.includes(s))) return false;
      return true;
    });

    if (sort === "low") list.sort((a, b) => a.price - b.price);
    if (sort === "high") list.sort((a, b) => b.price - a.price);
    if (sort === "new") list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return list;
  }, [products, keyword, brand, priceMin, priceMax, selectedSizes, inStockOnly, sort]);

  const activeCount = [
    keyword, brand !== "All",
    priceMin > 0 || priceMax < PRICE_MAX,
    selectedSizes.length > 0, inStockOnly, sort
  ].filter(Boolean).length;

  const resetFilters = () => {
    setKeyword(""); setBrand("All"); setSort("");
    setPriceMin(0); setPriceMax(PRICE_MAX);
    setSelectedSizes([]); setInStockOnly(false);
  };

  const toggleSize = (s) =>
    setSelectedSizes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  // ─── Sidebar ───────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col max-h-[calc(100vh-9rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal size={14} className="text-orange-500" />
          <span className="font-bold text-gray-800 text-sm">Bộ lọc</span>
          {activeCount > 0 && (
            <span className="bg-orange-500 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-[11px] text-orange-500 hover:text-orange-600 font-bold flex items-center gap-0.5 transition-colors"
          >
            <X size={10} /> Xóa hết
          </button>
        )}
      </div>

      {/* Scrollable Container */}
      <div className="overflow-y-auto pr-1 space-y-4 flex-1 scrollbar-thin">
        {/* Keyword */}
        <FilterSection title="Tìm kiếm">
          <div className="relative">
            <input
              type="text"
              placeholder="Tên sản phẩm..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full border border-gray-200 py-1.5 pl-8 pr-3 rounded-lg text-xs outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all placeholder-gray-400"
            />
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {keyword && (
              <button onClick={() => setKeyword("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={12} />
              </button>
            )}
          </div>
        </FilterSection>

        {/* Brand */}
        {brands.length > 2 && (
          <FilterSection title="Thương hiệu">
            <div className="max-h-24 overflow-y-auto pr-1 space-y-1 scrollbar-thin">
              {brands.map((b) => (
                <button
                  key={b}
                  onClick={() => setBrand(b)}
                  className={`w-full text-left px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all border flex items-center justify-between ${
                    brand === b
                      ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                      : "bg-white text-gray-600 border-gray-100 hover:border-orange-300 hover:text-orange-600"
                  }`}
                >
                  <span>{b === "All" ? "Tất cả" : b}</span>
                  {brand === b && <span className="w-1 h-1 rounded-full bg-white flex-shrink-0 ml-1" />}
                </button>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Price Range */}
        <FilterSection title="Khoảng giá">
          <DualRangeSlider
            min={0}
            max={PRICE_MAX}
            step={PRICE_STEP}
            valueMin={priceMin}
            valueMax={priceMax}
            onChange={(mn, mx) => { setPriceMin(mn); setPriceMax(mx); }}
          />
          <div className="flex items-center justify-between mt-3 gap-1.5">
            <div className="flex-1 bg-gray-50 rounded-lg px-2 py-1 text-[10px] text-center border border-gray-100">
              <div className="text-gray-400 text-[9px] mb-0.5">Từ</div>
              <div className="font-bold text-gray-800">{priceMin.toLocaleString("vi-VN")}đ</div>
            </div>
            <div className="w-2 h-px bg-gray-300 flex-shrink-0" />
            <div className="flex-1 bg-orange-50/50 rounded-lg px-2 py-1 text-[10px] text-center border border-orange-100/30">
              <div className="text-orange-400 text-[9px] mb-0.5">Đến</div>
              <div className="font-bold text-orange-600">{priceMax.toLocaleString("vi-VN")}đ</div>
            </div>
          </div>
        </FilterSection>

        {/* Size */}
        <FilterSection title="Size">
          <div className="grid grid-cols-4 gap-1">
            {ALL_SIZES.map((s) => (
              <button
                key={s}
                onClick={() => toggleSize(s)}
                className={`py-1 rounded-md text-[11px] font-bold transition-all border ${
                  selectedSizes.includes(s)
                    ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* In Stock */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chỉ còn hàng</span>
          <button
            onClick={() => setInStockOnly((v) => !v)}
            className={`relative w-8 h-4 rounded-full transition-colors duration-200 focus:outline-none flex items-center ${
              inStockOnly ? "bg-orange-500" : "bg-gray-200"
            }`}
          >
            <span className={`absolute w-3 h-3 bg-white rounded-full shadow transition-transform duration-200 ${
              inStockOnly ? "translate-x-4.5" : "translate-x-0.5"
            }`} />
          </button>
        </div>
      </div>
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-black text-gray-900">Sản phẩm</h1>
          <p className="text-gray-400 mt-1 text-sm">Khám phá {products.length} sản phẩm giày chính hãng</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24 self-start">
            <Sidebar />
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {/* Mobile filter button */}
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-sm text-gray-600 hover:border-orange-400 hover:text-orange-600 transition-colors"
                >
                  <SlidersHorizontal size={14} />
                  Bộ lọc
                  {activeCount > 0 && (
                    <span className="bg-orange-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {activeCount}
                    </span>
                  )}
                </button>

                <span className="text-sm text-gray-500 font-medium">
                  <span className="text-gray-900 font-bold">{filteredProducts.length}</span> sản phẩm
                </span>

                {/* Active filter chips */}
                {keyword && (
                  <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 border border-orange-100 px-2.5 py-1 rounded-full text-xs font-semibold">
                    "{keyword}" <button onClick={() => setKeyword("")}><X size={11} /></button>
                  </span>
                )}
                {brand !== "All" && (
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full text-xs font-semibold">
                    {brand} <button onClick={() => setBrand("All")}><X size={11} /></button>
                  </span>
                )}
                {selectedSizes.map(s => (
                  <span key={s} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                    Size {s} <button onClick={() => toggleSize(s)}><X size={11} /></button>
                  </span>
                ))}
                {(priceMin > 0 || priceMax < PRICE_MAX) && (
                  <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-100 px-2.5 py-1 rounded-full text-xs font-semibold">
                    {priceMin > 0 ? `${priceMin.toLocaleString("vi-VN")}` : "0"}–{priceMax.toLocaleString("vi-VN")}đ
                    <button onClick={() => { setPriceMin(0); setPriceMax(PRICE_MAX); }}><X size={11} /></button>
                  </span>
                )}
                {inStockOnly && (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full text-xs font-semibold">
                    Còn hàng <button onClick={() => setInStockOnly(false)}><X size={11} /></button>
                  </span>
                )}
              </div>

              {/* Sort */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="border border-gray-200 px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 outline-none bg-white cursor-pointer"
              >
                <option value="">Mặc định</option>
                <option value="new">Mới nhất</option>
                <option value="low">Giá thấp → cao</option>
                <option value="high">Giá cao → thấp</option>
              </select>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-2xl p-4 border border-gray-100">
                    <div className="h-56 bg-gray-100 rounded-xl mb-4" />
                    <div className="h-3 bg-gray-100 rounded w-1/3 mb-2" />
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-400 text-sm mb-6">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
                <button
                  onClick={resetFilters}
                  className="bg-orange-500 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-orange-600 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFilterOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <span className="font-bold text-gray-900">Bộ lọc</span>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <Sidebar />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
