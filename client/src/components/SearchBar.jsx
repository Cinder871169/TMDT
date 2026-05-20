import React, { useState, useEffect, useRef, useCallback } from "react";
import api from "../utils/api";
import { Search, X, TrendingUp, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RECENT_KEY = "sz_recent_searches";
const MAX_RECENT = 5;

function getRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); }
  catch { return []; }
}
function saveRecent(term) {
  if (!term.trim()) return;
  const prev = getRecent().filter(t => t !== term);
  localStorage.setItem(RECENT_KEY, JSON.stringify([term, ...prev].slice(0, MAX_RECENT)));
}
function removeRecent(term) {
  const prev = getRecent().filter(t => t !== term);
  localStorage.setItem(RECENT_KEY, JSON.stringify(prev));
}

export default function SearchBar({ isMobileSearchOpen, onCloseMobileSearch, onOpenMobileSearch, variant = "full" }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [recent, setRecent] = useState(getRecent);
  const timerRef = useRef();
  const containerRef = useRef();
  const inputRef = useRef();
  const mobileInputRef = useRef();
  const navigate = useNavigate();

  // Check if should show mobile button only
  const isMobileOnly = variant === "mobile-only";
  // Check if should show desktop only
  const isDesktopOnly = variant === "desktop-only";

  // Focus mobile input when modal opens
  useEffect(() => {
    if (isMobileSearchOpen) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        mobileInputRef.current?.focus();
      }, 100);
      return () => {
        document.body.style.overflow = '';
        clearTimeout(timer);
      };
    }
  }, [isMobileSearchOpen]);

  // Debounced search
  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get(`/api/products/search?q=${encodeURIComponent(q.trim())}`);
        setResults(data);
        setHighlight(-1);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [q]);

  // Click outside to close
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleFocus = () => {
    setOpen(true);
    setRecent(getRecent());
  };

  const goTo = useCallback((id, term) => {
    if (term) saveRecent(term);
    onCloseMobileSearch();
    setQ("");
    setOpen(false);
    navigate(`/product/${id}`);
  }, [navigate, onCloseMobileSearch]);

  const goToSearch = useCallback((term) => {
    if (!term.trim()) return;
    saveRecent(term);
    onCloseMobileSearch();
    setQ("");
    setOpen(false);
    navigate(`/products?keyword=${encodeURIComponent(term.trim())}`);
  }, [navigate, onCloseMobileSearch]);

  const handleDeleteRecent = (e, term) => {
    e.stopPropagation();
    removeRecent(term);
    setRecent(getRecent());
  };

  const handleClear = () => {
    setQ("");
    setResults([]);
    inputRef.current?.focus();
  };

  const onKeyDown = (e) => {
    const items = q.trim() ? results : recent;
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight(h => Math.min(h + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight(h => Math.max(h - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (q.trim() && highlight === -1) {
        goToSearch(q.trim());
      } else if (q.trim() && results[highlight]) {
        goTo(results[highlight]._id, results[highlight].name);
      } else if (!q.trim() && recent[highlight]) {
        goToSearch(recent[highlight]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const showDropdown = open;
  const showResults = q.trim() && results.length > 0;
  const showRecent = !q.trim() && recent.length > 0;
  const showNoResult = q.trim() && !loading && results.length === 0;

  // Get product image from colors array
  const getImg = (p) => {
    if (p.colors && p.colors.length > 0 && p.colors[0].images && p.colors[0].images.length > 0) {
      return p.colors[0].images[0];
    }
    return null;
  };

  const closeMobileSearch = () => {
    onCloseMobileSearch();
    setQ("");
    setOpen(false);
  };

  return (
    <>
      {/* Desktop Search Bar */}
      {!isMobileOnly && (
        <div ref={containerRef} className="relative">
          {/* Input */}
          <div className={`flex items-center gap-2 rounded-full px-4 py-2.5 transition-all duration-200 min-w-[300px] md:min-w-[400px] lg:min-w-[500px] ${
            open
              ? "bg-white ring-2 ring-orange-500/30 shadow-lg shadow-orange-500/10"
              : "bg-gray-100 hover:bg-gray-200/80"
          }`}>
            <Search size={16} className={`flex-shrink-0 transition-colors ${open ? "text-orange-500" : "text-gray-400"}`} />
            <input
              ref={inputRef}
              value={q}
              onChange={e => setQ(e.target.value)}
              onFocus={handleFocus}
              onKeyDown={onKeyDown}
              placeholder="Tìm sản phẩm, thương hiệu..."
              className="bg-transparent outline-none w-full text-sm text-gray-800 placeholder-gray-400"
              autoComplete="off"
            />
            {loading && (
              <div className="w-3.5 h-3.5 border-2 border-orange-500/40 border-t-orange-500 rounded-full animate-spin flex-shrink-0" />
            )}
            {q && !loading && (
              <button onClick={handleClear} className="flex-shrink-0 w-4 h-4 bg-gray-300 hover:bg-gray-400 rounded-full flex items-center justify-center transition-colors">
                <X size={10} className="text-white" />
              </button>
            )}
          </div>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl shadow-black/10 border border-gray-100 overflow-hidden z-50"
              style={{ maxHeight: "60vh", overflowY: "auto" }}>

              {showRecent && (
                <div className="p-2">
                  <div className="flex items-center justify-between px-3 py-1.5">
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-1.5">
                      <Clock size={10} /> Tìm kiếm gần đây
                    </span>
                  </div>
                  {recent.map((term, i) => (
                    <button
                      key={term}
                      onClick={() => goToSearch(term)}
                      onMouseEnter={() => setHighlight(i)}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between group transition-colors ${
                        i === highlight ? "bg-gray-50" : "hover:bg-gray-50/80"
                      }`}
                    >
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        <Clock size={12} className="text-gray-300" />
                        {term}
                      </span>
                      <button
                        onClick={(e) => handleDeleteRecent(e, term)}
                        className="opacity-0 group-hover:opacity-100 w-4 h-4 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-all"
                      >
                        <X size={8} className="text-gray-500" />
                      </button>
                    </button>
                  ))}
                </div>
              )}

              {!q.trim() && recent.length === 0 && (
                <div className="px-4 py-6 text-center">
                  <TrendingUp size={22} className="text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Nhập tên sản phẩm để tìm kiếm</p>
                </div>
              )}

              {showResults && (
                <div className="p-2">
                  <div className="px-3 py-1.5">
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-1.5">
                      <Search size={10} /> Kết quả
                    </span>
                  </div>
                  {results.map((p, i) => {
                    const img = getImg(p);
                    return (
                      <button
                        key={p._id}
                        onClick={() => goTo(p._id, p.name)}
                        onMouseEnter={() => setHighlight(i)}
                        className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-3 transition-colors ${
                          i === highlight ? "bg-gray-50" : "hover:bg-gray-50/80"
                        }`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                          {img ? (
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Search size={14} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-800 truncate">{p.name}</div>
                          <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                            <span>{p.brand}</span>
                            {p.countInStock === 0 && (
                              <span className="text-red-400 font-medium">• Hết hàng</span>
                            )}
                          </div>
                        </div>
                        <div className="text-sm font-black text-orange-500 flex-shrink-0">
                          {p.price.toLocaleString("vi-VN")}đ
                        </div>
                      </button>
                    );
                  })}
                  <button
                    onClick={() => goToSearch(q)}
                    className="w-full mt-1 px-3 py-2.5 text-sm text-gray-500 hover:text-orange-600 font-semibold hover:bg-orange-50/50 rounded-xl transition-colors flex items-center justify-center gap-1.5 border-t border-gray-50"
                  >
                    Xem tất cả kết quả cho <span className="text-orange-600">"{q}"</span> <ArrowRight size={13} />
                  </button>
                </div>
              )}

              {showNoResult && (
                <div className="px-4 py-7 text-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <Search size={18} className="text-gray-300" />
                  </div>
                  <p className="text-sm font-semibold text-gray-500">Không tìm thấy kết quả</p>
                  <p className="text-xs text-gray-400 mt-1">Thử tìm bằng tên thương hiệu hoặc loại giày</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mobile Search Button - only show if not desktop-only */}
      {!isDesktopOnly && (
        <button
          onClick={onOpenMobileSearch}
          className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Tìm kiếm"
        >
          <Search size={22} className="text-gray-600" />
        </button>
      )}

      {/* Mobile Full-Screen Search Modal */}
      {isMobileSearchOpen && (
        <div
          className="fixed inset-0 z-[100] bg-white flex flex-col md:hidden animate-slide-up overflow-hidden"
          style={{
            height: '100dvh',
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)'
          }}
        >
          {/* Header - cố định không cuộn */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 shrink-0 bg-white z-10">
            {/* Search Input Container */}
            <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-3">
              <Search size={20} className="text-gray-400 flex-shrink-0" />
              <input
                ref={mobileInputRef}
                value={q}
                onChange={e => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && q.trim()) {
                    goToSearch(q.trim());
                  }
                }}
                placeholder="Tìm sản phẩm, thương hiệu..."
                className="bg-transparent outline-none w-full text-base text-gray-800 placeholder-gray-400"
                autoComplete="off"
                autoFocus
              />
              {loading && (
                <div className="w-5 h-5 border-2 border-orange-500/40 border-t-orange-500 rounded-full animate-spin flex-shrink-0" />
              )}
              {q && !loading && (
                <button
                  onClick={handleClear}
                  className="flex-shrink-0 w-6 h-6 bg-gray-300 hover:bg-gray-400 rounded-full flex items-center justify-center transition-colors"
                >
                  <X size={12} className="text-white" />
                </button>
              )}
            </div>
            {/* Cancel Button */}
            <button
              onClick={closeMobileSearch}
              className="text-sm font-semibold text-gray-500 hover:text-orange-600 px-2 py-2 shrink-0"
            >
              Hủy
            </button>
          </div>

          {/* Results Container - scrollable với chiều cao linh hoạt */}
          <div 
            className="flex-1 overflow-y-auto overscroll-contain" 
            style={{ 
              WebkitOverflowScrolling: 'touch',
              height: 'calc(100dvh - 80px - env(safe-area-inset-bottom, 0px))'
            }}
          >
            {/* Recent Searches */}
            {showRecent && (
              <div className="px-4 pt-4 pb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Clock size={12} /> Tìm kiếm gần đây
                  </span>
                  <button
                    onClick={() => {
                      localStorage.removeItem(RECENT_KEY);
                      setRecent([]);
                    }}
                    className="text-xs text-orange-500 font-semibold px-3 py-1.5 hover:bg-orange-50 rounded-full transition-colors"
                  >
                    Xóa hết
                  </button>
                </div>
                <div className="space-y-2">
                  {recent.map((term) => (
                    <button
                      key={term}
                      onClick={() => goToSearch(term)}
                      className="w-full text-left px-4 py-3.5 rounded-xl flex items-center gap-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <Clock size={16} className="text-gray-300 flex-shrink-0" />
                      <span className="text-sm text-gray-600 flex-1">{term}</span>
                      <ArrowRight size={14} className="text-gray-300 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!q.trim() && recent.length === 0 && (
              <div className="px-4 pt-8 pb-8">
                <TrendingUp size={40} className="text-gray-200 mx-auto mb-4 block" />
                <p className="text-sm text-gray-400 font-medium text-center">Nhập tên sản phẩm để tìm kiếm</p>
                {/* Suggestions */}
                <div className="mt-6">
                  <span className="text-xs text-gray-400 block text-center mb-3">Gợi ý tìm kiếm</span>
                  <div className="flex flex-wrap justify-center gap-2">
                    {["Nike Air Max", "Adidas Ultraboost", "Jordan 1", "Puma RS-X"].map(suggestion => (
                      <button
                        key={suggestion}
                        onClick={() => setQ(suggestion)}
                        className="text-sm px-4 py-2 bg-gray-100 text-gray-600 rounded-full hover:bg-orange-50 hover:text-orange-600 font-medium transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Search Results */}
            {showResults && (
              <div className="px-4 pt-4 pb-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  {results.length} kết quả cho "{q}"
                </p>
                <div className="space-y-3">
                  {results.map((p) => {
                    const img = getImg(p);
                    return (
                      <button
                        key={p._id}
                        onClick={() => goTo(p._id, p.name)}
                        className="w-full flex items-center gap-4 p-3 bg-gray-50 hover:bg-orange-50/50 rounded-2xl transition-colors active:scale-[0.98]"
                      >
                        <div className="w-16 h-16 rounded-xl bg-white overflow-hidden border border-gray-100 shrink-0">
                          {img ? (
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Search size={20} className="text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="text-sm font-semibold text-gray-800 line-clamp-2">{p.name}</div>
                          <div className="text-xs text-gray-400 mt-1">{p.brand}</div>
                          <div className="text-base font-black text-orange-500 mt-1">
                            {p.price.toLocaleString("vi-VN")}đ
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => goToSearch(q)}
                  className="w-full mt-4 py-3.5 text-sm font-bold text-white text-center bg-orange-500 rounded-2xl shadow-lg shadow-orange-500/30 active:scale-[0.98] transition-transform"
                >
                  Xem tất cả kết quả cho "{q}"
                </button>
              </div>
            )}

            {/* No Results */}
            {showNoResult && (
              <div className="px-4 pt-12 pb-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Search size={28} className="text-gray-300" />
                </div>
                <p className="text-base font-semibold text-gray-600 text-center">Không tìm thấy "{q}"</p>
                <p className="text-sm text-gray-400 mt-2 text-center">Thử tìm bằng tên thương hiệu khác</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
