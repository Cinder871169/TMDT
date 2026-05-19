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

export default function SearchBar() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [recent, setRecent] = useState(getRecent);
  const timerRef = useRef();
  const containerRef = useRef();
  const inputRef = useRef();
  const navigate = useNavigate();

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
    setOpen(false);
    setQ("");
    navigate(`/product/${id}`);
  }, [navigate]);

  const goToSearch = useCallback((term) => {
    if (!term.trim()) return;
    saveRecent(term);
    setOpen(false);
    setQ("");
    navigate(`/products?keyword=${encodeURIComponent(term.trim())}`);
  }, [navigate]);

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

  return (
    <div ref={containerRef} className="relative w-64 md:w-96">
      {/* Input */}
      <div className={`flex items-center gap-2 rounded-full px-4 py-2.5 transition-all duration-200 ${
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
        {/* Loading spinner */}
        {loading && (
          <div className="w-3.5 h-3.5 border-2 border-orange-500/40 border-t-orange-500 rounded-full animate-spin flex-shrink-0" />
        )}
        {/* Clear button */}
        {q && !loading && (
          <button onClick={handleClear} className="flex-shrink-0 w-4 h-4 bg-gray-300 hover:bg-gray-400 rounded-full flex items-center justify-center transition-colors">
            <X size={10} className="text-white" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl shadow-black/10 border border-gray-100 overflow-hidden z-50">

          {/* Recent searches */}
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

          {/* Empty state with no query */}
          {!q.trim() && recent.length === 0 && (
            <div className="px-4 py-6 text-center">
              <TrendingUp size={22} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Nhập tên sản phẩm để tìm kiếm</p>
            </div>
          )}

          {/* Search results */}
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
                    {/* Product image */}
                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                      {img ? (
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Search size={14} />
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">{p.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <span>{p.brand}</span>
                        {p.countInStock === 0 && (
                          <span className="text-red-400 font-medium">• Hết hàng</span>
                        )}
                      </div>
                    </div>
                    {/* Price */}
                    <div className="text-sm font-black text-orange-500 flex-shrink-0">
                      {p.price.toLocaleString("vi-VN")}đ
                    </div>
                  </button>
                );
              })}
              {/* View all results link */}
              <button
                onClick={() => goToSearch(q)}
                className="w-full mt-1 px-3 py-2.5 text-sm text-gray-500 hover:text-orange-600 font-semibold hover:bg-orange-50/50 rounded-xl transition-colors flex items-center justify-center gap-1.5 border-t border-gray-50"
              >
                Xem tất cả kết quả cho <span className="text-orange-600">"{q}"</span> <ArrowRight size={13} />
              </button>
            </div>
          )}

          {/* No results */}
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
  );
}
