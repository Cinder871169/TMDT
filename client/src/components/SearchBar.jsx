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

  // Check variant states
  const isMobileOnly = variant === "mobile-only";
  const isDesktopOnly = variant === "desktop-only";

  // Bind Ctrl+K shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isMobileOnly) {
          onOpenMobileSearch();
        } else {
          inputRef.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOnly, onOpenMobileSearch]);

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

  // Debounced search API request
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

  // Click outside to close the desktop dropdown
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

  const showDropdown = open && (q.trim() || recent.length > 0);
  const showResults = q.trim() && results.length > 0;
  const showRecent = !q.trim() && recent.length > 0;
  const showNoResult = q.trim() && !loading && results.length === 0;

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
        <div ref={containerRef} className="relative group/search z-50">
          {/* Input Box */}
          <div className={`flex items-center gap-3 rounded-full px-5 py-3 transition-all duration-300 min-w-[320px] md:min-w-[420px] lg:min-w-[520px] border ${
            open
              ? "bg-white border-orange-500 shadow-[0_10px_30px_-5px_rgba(249,115,22,0.15)] ring-4 ring-orange-500/10 scale-[1.01]"
              : "bg-gray-50/80 border-gray-100 hover:bg-gray-100/70 hover:border-gray-200/50 hover:shadow-sm"
          }`}>
            <Search 
              size={18} 
              className={`flex-shrink-0 transition-all duration-300 ${
                open ? "text-orange-500 rotate-90 scale-110" : "text-gray-400 group-hover/search:text-gray-600"
              }`} 
            />
            <input
              ref={inputRef}
              value={q}
              onChange={e => setQ(e.target.value)}
              onFocus={handleFocus}
              onKeyDown={onKeyDown}
              placeholder="Tìm sản phẩm, thương hiệu sneaker..."
              className="bg-transparent outline-none w-full text-sm font-medium text-gray-800 placeholder-gray-400"
              autoComplete="off"
            />
            
            {/* Ctrl + K Shortcut badge */}
            {!q && !open && (
              <div className="hidden sm:flex items-center gap-0.5 px-2 py-1 rounded bg-gray-200/50 border border-gray-300/10 text-[9px] font-black text-gray-400 font-mono select-none shrink-0 tracking-wider">
                <span>CTRL</span>
                <span>K</span>
              </div>
            )}

            {loading && (
              <div className="w-4 h-4 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin flex-shrink-0" />
            )}
            
            {q && !loading && (
              <button 
                onClick={handleClear} 
                className="flex-shrink-0 w-5 h-5 bg-gray-200 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition-all duration-200"
              >
                <X size={11} className="text-gray-500 hover:text-white transition-colors" />
              </button>
            )}
          </div>

          {/* Premium Dropdown */}
          {showDropdown && (
            <div 
              className="absolute left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-gray-100/80 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300"
              style={{ maxHeight: "65vh", overflowY: "auto" }}
            >
              {/* Recent Searches */}
              {showRecent && (
                <div className="p-3">
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2">
                      <Clock size={11} className="text-gray-400" /> Lịch sử tìm kiếm
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {recent.map((term, i) => (
                      <button
                        key={term}
                        onClick={() => goToSearch(term)}
                        onMouseEnter={() => setHighlight(i)}
                        className={`w-full text-left px-3 py-2.5 rounded-2xl flex items-center justify-between group transition-all duration-200 ${
                          i === highlight ? "bg-gray-50 text-orange-600" : "hover:bg-gray-50/50 text-gray-600"
                        }`}
                      >
                        <span className="text-sm font-semibold flex items-center gap-2.5">
                          <Clock size={13} className="text-gray-300 group-hover:text-orange-500 transition-colors" />
                          {term}
                        </span>
                        <button
                          onClick={(e) => handleDeleteRecent(e, term)}
                          className="opacity-0 group-hover:opacity-100 w-5 h-5 bg-gray-100 hover:bg-red-50 hover:text-red-500 rounded-full flex items-center justify-center transition-all shrink-0"
                        >
                          <X size={10} />
                        </button>
                      </button>
                    ))}
                  </div>
                </div>
              )}


              {/* Active Search Results */}
              {showResults && (
                <div className="p-3">
                  <div className="px-3 py-2 mb-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2">
                      <Search size={11} /> Kết quả tìm thấy
                    </span>
                  </div>
                  <div className="space-y-1">
                    {results.map((p, i) => {
                      const img = getImg(p);
                      return (
                        <button
                          key={p._id}
                          onClick={() => goTo(p._id, p.name)}
                          onMouseEnter={() => setHighlight(i)}
                          className={`w-full text-left p-2.5 rounded-2xl flex items-center gap-4 transition-all duration-300 border border-transparent ${
                            i === highlight 
                              ? "bg-gradient-to-r from-orange-50/80 to-transparent border-orange-100 shadow-sm" 
                              : "hover:bg-gray-50/50"
                          }`}
                        >
                          {/* Image Box */}
                          <div className="w-12 h-12 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100/80 shadow-inner">
                            {img ? (
                              <img src={img} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100">
                                <Search size={16} />
                              </div>
                            )}
                          </div>
                          {/* Text Detail */}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-gray-800 truncate transition-colors">{p.name}</div>
                            <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-2">
                              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold uppercase text-[9px] tracking-wider">{p.brand}</span>
                              {p.countInStock === 0 ? (
                                <span className="text-red-500 font-semibold text-[10px] bg-red-50 px-2 py-0.5 rounded-full">Hết hàng</span>
                              ) : (
                                <span className="text-emerald-600 font-semibold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full">Còn hàng</span>
                              )}
                            </div>
                          </div>
                          {/* Price */}
                          <div className="text-sm font-black bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent flex-shrink-0">
                            {p.price.toLocaleString("vi-VN")}đ
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* View All Button */}
                  <button
                    onClick={() => goToSearch(q)}
                    className="w-[calc(100%-8px)] mx-1 mt-3 py-3.5 px-4 text-xs text-white font-black bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-[0.98]"
                  >
                    XEM TẤT CẢ KẾT QUẢ CHO "{q.toUpperCase()}" <ArrowRight size={13} className="animate-pulse" />
                  </button>
                </div>
              )}

              {/* No Results found */}
              {showNoResult && (
                <div className="px-5 py-10 text-center bg-gray-50/50">
                  <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 border border-red-100">
                    <Search size={22} className="text-red-400" />
                  </div>
                  <p className="text-sm font-black text-gray-800">Không tìm thấy sản phẩm phù hợp</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-[80%] mx-auto">Thử tìm kiếm bằng tên thương hiệu (Nike, Adidas, Jordan) hoặc dòng sản phẩm khác</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mobile Search Trigger Icon */}
      {!isDesktopOnly && (
        <button
          onClick={onOpenMobileSearch}
          className="md:hidden p-2.5 hover:bg-gray-50 active:bg-gray-100 rounded-full transition-all border border-transparent active:border-gray-100 shadow-sm"
          aria-label="Tìm kiếm"
        >
          <Search size={22} className="text-gray-700" />
        </button>
      )}

      {/* Mobile Full-Screen Search Modal */}
      {isMobileSearchOpen && (
        <div
          className="fixed inset-0 z-[100] bg-white flex flex-col md:hidden animate-in slide-in-from-bottom duration-300 overflow-hidden"
          style={{
            height: '100dvh',
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)'
          }}
        >
          {/* Header Section */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 shrink-0 bg-white shadow-sm">
            {/* Input Container */}
            <div className="flex-1 flex items-center gap-2.5 bg-gray-50 border border-gray-100 rounded-full px-4 py-3 focus-within:bg-white focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/10 transition-all">
              <Search size={18} className="text-gray-400 flex-shrink-0" />
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
                className="bg-transparent outline-none w-full text-base font-semibold text-gray-800 placeholder-gray-400"
                autoComplete="off"
              />
              {loading && (
                <div className="w-5 h-5 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin flex-shrink-0" />
              )}
              {q && !loading && (
                <button
                  onClick={handleClear}
                  className="flex-shrink-0 w-6 h-6 bg-gray-200/80 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            {/* Cancel Button */}
            <button
              onClick={closeMobileSearch}
              className="text-sm font-black text-gray-500 hover:text-orange-600 px-2 py-2 shrink-0 transition-colors"
            >
              Hủy
            </button>
          </div>

          {/* Body Section */}
          <div 
            className="flex-1 overflow-y-auto overscroll-contain bg-white" 
            style={{ 
              WebkitOverflowScrolling: 'touch',
              height: 'calc(100dvh - 80px - env(safe-area-inset-bottom, 0px))'
            }}
          >
            {/* Recent Searches */}
            {showRecent && (
              <div className="px-5 pt-5 pb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Clock size={12} /> Tìm kiếm gần đây
                  </span>
                  <button
                    onClick={() => {
                      localStorage.removeItem(RECENT_KEY);
                      setRecent([]);
                    }}
                    className="text-xs text-orange-500 font-bold px-3 py-1.5 hover:bg-orange-50 rounded-full transition-colors"
                  >
                    Xóa hết
                  </button>
                </div>
                <div className="space-y-2">
                  {recent.map((term) => (
                    <button
                      key={term}
                      onClick={() => goToSearch(term)}
                      className="w-full text-left px-4 py-3.5 rounded-2xl flex items-center gap-3 bg-gray-50 hover:bg-orange-50/30 transition-all border border-gray-100/50"
                    >
                      <Clock size={15} className="text-gray-400 flex-shrink-0" />
                      <span className="text-sm font-semibold text-gray-700 flex-1 truncate">{term}</span>
                      <ArrowRight size={14} className="text-gray-300 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State suggestions */}
            {!q.trim() && recent.length === 0 && (
              <div className="px-5 pt-16 pb-8 text-center opacity-60">
                <Search size={36} className="text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-400">Nhập từ khóa để tìm kiếm sản phẩm</p>
              </div>
            )}

            {/* Active search results */}
            {showResults && (
              <div className="px-4 pt-4 pb-6">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">
                  Có {results.length} sản phẩm tương ứng cho "{q}"
                </p>
                <div className="space-y-2">
                  {results.map((p) => {
                    const img = getImg(p);
                    return (
                      <button
                        key={p._id}
                        onClick={() => goTo(p._id, p.name)}
                        className="w-full flex items-center gap-4 p-3 bg-gray-50 border border-gray-100/50 hover:bg-orange-50/30 rounded-2xl transition-colors active:scale-[0.98]"
                      >
                        <div className="w-16 h-16 rounded-xl bg-white overflow-hidden border border-gray-100 shrink-0">
                          {img ? (
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <Search size={20} className="text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="text-sm font-bold text-gray-800 line-clamp-2">{p.name}</div>
                          <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1.5">
                            <span className="font-semibold">{p.brand}</span>
                            <span>•</span>
                            {p.countInStock === 0 ? (
                              <span className="text-red-500 font-bold">Hết hàng</span>
                            ) : (
                              <span className="text-emerald-600 font-bold">Còn hàng</span>
                            )}
                          </div>
                          <div className="text-sm font-black bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mt-1.5">
                            {p.price.toLocaleString("vi-VN")}đ
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => goToSearch(q)}
                  className="w-full mt-5 py-4 text-sm font-black text-white text-center bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                >
                  XEM TẤT CẢ KẾT QUẢ CHO "{q.toUpperCase()}" <ArrowRight size={15} />
                </button>
              </div>
            )}

            {/* Empty state for search failure */}
            {showNoResult && (
              <div className="px-5 pt-12 pb-12 text-center bg-gray-50/50">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 border border-red-100 animate-bounce">
                  <Search size={24} className="text-red-400" />
                </div>
                <p className="text-base font-black text-gray-800">Không tìm thấy "{q}"</p>
                <p className="text-xs text-gray-400 mt-1 max-w-[80%] mx-auto">Thử kiểm tra lỗi chính tả hoặc tìm theo từ khóa chung (ví dụ: Nike, Jordan, Adidas, Puma)</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
