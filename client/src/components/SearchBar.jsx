import React, { useState, useEffect, useRef } from "react";
import api from "../utils/api";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const timerRef = useRef();
  const containerRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (!q) {
      setResults([]);
      setOpen(false);
      return;
    }

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get(
          `/api/products?keyword=${encodeURIComponent(q)}`,
        );
        setResults(data.slice(0, 6));
        setOpen(true);
        setHighlight(0);
      } catch (err) {
        setResults([]);
        setOpen(false);
      }
    }, 250);

    return () => clearTimeout(timerRef.current);
  }, [q]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const goTo = (id) => {
    setOpen(false);
    setQ("");
    navigate(`/product/${id}`);
  };

  const onKeyDown = (e) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[highlight]) goTo(results[highlight]._id);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-64 md:w-96">
      <div className="flex items-center bg-gray-100 rounded-full px-3 py-2 gap-2">
        <Search size={16} className="text-gray-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => q && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Tìm kiếm sản phẩm..."
          className="bg-transparent outline-none w-full text-sm"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-white border rounded-2xl shadow-lg overflow-hidden z-50">
          {results.map((p, i) => (
            <button
              key={p._id}
              onClick={() => goTo(p._id)}
              onMouseEnter={() => setHighlight(i)}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 ${i === highlight ? "bg-gray-50" : ""}`}
            >
              <img
                src={p.image}
                alt=""
                className="w-12 h-12 object-cover rounded-lg"
              />
              <div className="flex-1">
                <div className="text-sm font-bold text-gray-800 truncate">
                  {p.name}
                </div>
                <div className="text-xs text-gray-500">
                  {p.brand} • {p.price.toLocaleString("vi-VN")}đ
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
