// components/Sidebar.jsx
import { useState } from "react";
import {
    Layers,
    Zap,
    Trophy,
    Crown,
    Compass,
    ChevronDown,
    ChevronUp,
    X,
    Filter,
    SlidersHorizontal
} from "lucide-react";

const Sidebar = ({
    brand,
    setBrand,
    priceRange,
    setPriceRange,
    selectedSizes = [],
    setSelectedSizes,
    selectedColors = [],
    setSelectedColors
}) => {
    const [expandedSections, setExpandedSections] = useState({
        brand: true,
        price: true,
        size: false,
        color: false
    });

    const categories = [
        { name: "Tất cả", icon: <Compass size={18} />},
        { name: "Nike", icon: <Zap size={18} className="text-yellow-500" /> },
        { name: "Adidas", icon: <Layers size={18} className="text-blue-500" /> },
        { name: "Jordan", icon: <Crown size={18} className="text-red-500" /> },
        { name: "Puma", icon: <Trophy size={18} className="text-green-500" /> },
    ];

    const sizes = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45];
    const colors = ["Đen", "Trắng", "Xanh", "Đỏ", "Xám", "Đen/Trắng", "Xanh navy"];

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const clearAllFilters = () => {
        setBrand("Tất cả");
        setPriceRange(10000000);
        setSelectedSizes([]);
        setSelectedColors([]);
    };

    const hasActiveFilters = brand !== "Tất cả" || priceRange < 10000000 || selectedSizes.length > 0 || selectedColors.length > 0;

    return (
        <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-gray-50 sticky top-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <SlidersHorizontal className="w-5 h-5 text-gray-400" />
                        <h3 className="text-sm font-black uppercase tracking-wider text-gray-600">
                            Bộ lọc sản phẩm
                        </h3>
                    </div>
                    {hasActiveFilters && (
                        <button
                            onClick={clearAllFilters}
                            className="text-xs text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 hover:bg-orange-50 px-3 py-1 rounded-full transition-colors"
                        >
                            <X size={14} />
                            Xóa tất cả
                        </button>
                    )}
                </div>

                {/* Brand Filter */}
                <div className="mb-8">
                    <button
                        onClick={() => toggleSection('brand')}
                        className="flex items-center justify-between w-full text-sm font-black uppercase tracking-wider text-gray-600 mb-4 hover:text-gray-800 transition-colors"
                    >
                        <span className="flex items-center gap-2">
                            <Filter size={16} />
                            Thương hiệu
                        </span>
                        {expandedSections.brand ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {expandedSections.brand && (
                        <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                            {categories.map((cat) => (
                                <button
                                    key={cat.name}
                                    onClick={() => setBrand(cat.name)}
                                    className={`flex items-center justify-between gap-4 w-full px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${
                                        brand === cat.name
                                            ? "bg-orange-500 text-white shadow-lg scale-105"
                                            : "text-gray-600 hover:bg-gray-50 hover:scale-102"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {cat.icon}
                                        <span>{cat.name}</span>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                        brand === cat.name
                                            ? "bg-white/20 text-white"
                                            : "bg-gray-100 text-gray-500"
                                    }`}>
                                        {cat.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Price Filter */}
                <div className="mb-8">
                    <button
                        onClick={() => toggleSection('price')}
                        className="flex items-center justify-between w-full text-sm font-black uppercase tracking-wider text-gray-600 mb-4 hover:text-gray-800 transition-colors"
                    >
                        <span>Khoảng giá</span>
                        {expandedSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {expandedSections.price && (
                        <div className="animate-in slide-in-from-top-2 duration-300">
                            <div className="px-2">
                                <input
                                    type="range"
                                    min="500000"
                                    max="10000000"
                                    step="100000"
                                    value={priceRange}
                                    onChange={(e) => setPriceRange(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-orange-500 slider"
                                />
                                <div className="flex justify-between items-center mt-3">
                                    <span className="text-xs text-gray-500">500k</span>
                                    <span className="text-sm font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                                        ≤ {Number(priceRange).toLocaleString("vi-VN")}đ
                                    </span>
                                    <span className="text-xs text-gray-500">10M</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Size Filter */}
                <div className="mb-8">
                    <button
                        onClick={() => toggleSection('size')}
                        className="flex items-center justify-between w-full text-sm font-black uppercase tracking-wider text-gray-600 mb-4 hover:text-gray-800 transition-colors"
                    >
                        <span>Kích cỡ</span>
                        {expandedSections.size ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {expandedSections.size && (
                        <div className="animate-in slide-in-from-top-2 duration-300">
                            <div className="grid grid-cols-5 gap-2">
                                {sizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => {
                                            setSelectedSizes(prev =>
                                                prev.includes(size)
                                                    ? prev.filter(s => s !== size)
                                                    : [...prev, size]
                                            );
                                        }}
                                        className={`p-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                                            selectedSizes.includes(size)
                                                ? "bg-orange-500 text-white scale-105 shadow-lg"
                                                : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:scale-105"
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Color Filter */}
                <div className="mb-8">
                    <button
                        onClick={() => toggleSection('color')}
                        className="flex items-center justify-between w-full text-sm font-black uppercase tracking-wider text-gray-600 mb-4 hover:text-gray-800 transition-colors"
                    >
                        <span>Màu sắc</span>
                        {expandedSections.color ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {expandedSections.color && (
                        <div className="animate-in slide-in-from-top-2 duration-300">
                            <div className="space-y-2">
                                {colors.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => {
                                            setSelectedColors(prev =>
                                                prev.includes(color)
                                                    ? prev.filter(c => c !== color)
                                                    : [...prev, color]
                                            );
                                        }}
                                        className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                                            selectedColors.includes(color)
                                                ? "bg-orange-500 text-white shadow-lg"
                                                : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                    >
                                        <div className={`w-4 h-4 rounded-full border-2 ${
                                            selectedColors.includes(color)
                                                ? "border-white"
                                                : "border-gray-300"
                                        }`} style={{
                                            backgroundColor: color.toLowerCase().includes('đen') ? '#000' :
                                                           color.toLowerCase().includes('trắng') ? '#fff' :
                                                           color.toLowerCase().includes('xanh navy') ? '#1e3a8a' :
                                                           color.toLowerCase().includes('xanh') ? '#3b82f6' :
                                                           color.toLowerCase().includes('đỏ') ? '#ef4444' :
                                                           color.toLowerCase().includes('xám') ? '#6b7280' : '#f3f4f6'
                                        }}></div>
                                        <span>{color}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Active Filters Summary */}
                {hasActiveFilters && (
                    <div className="pt-6 border-t border-gray-100">
                        <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-3">
                            Bộ lọc đang áp dụng:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {brand !== "Tất cả" && (
                                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
                                    {brand}
                                </span>
                            )}
                            {priceRange < 10000000 && (
                                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
                                    ≤ {Number(priceRange).toLocaleString("vi-VN")}đ
                                </span>
                            )}
                            {selectedSizes.map(size => (
                                <span key={size} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
                                    Size {size}
                                </span>
                            ))}
                            {selectedColors.map(color => (
                                <span key={color} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
                                    {color}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: #f97316;
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(249, 115, 22, 0.3);
                }
                .slider::-moz-range-thumb {
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: #f97316;
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 2px 6px rgba(249, 115, 22, 0.3);
                }
            `}</style>
        </aside>
    );
};

export default Sidebar;
