// components/Sidebar.jsx
import { Layers, Zap, Trophy, Crown, Compass } from "lucide-react";

const Sidebar = ({ brand, setBrand, priceRange, setPriceRange }) => {
  const categories = [
    { name: "Tất cả", icon: <Compass size={18} /> },
    { name: "Nike", icon: <Zap size={18} className="text-yellow-500" /> },
    { name: "Adidas", icon: <Layers size={18} className="text-blue-500" /> },
    { name: "Jordan", icon: <Crown size={18} className="text-red-500" /> },
    { name: "Puma", icon: <Trophy size={18} className="text-green-500" /> },
  ];

  return (
    <aside className="w-full lg:w-72 flex-shrink-0">
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8">
          Danh mục sản phẩm
        </h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setBrand(cat.name)}
              className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
                brand === cat.name
                  ? "bg-zinc-900 text-white shadow-xl"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        <div className="mt-12 pt-10 border-t border-gray-50">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">
            Lọc theo ngân sách
          </h3>
          <input
            type="range"
            min="0"
            max="10000000"
            step="500000"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-orange-600"
          />
          <p className="mt-4 text-xs font-black text-orange-600">
            Dưới {Number(priceRange).toLocaleString("vi-VN")}đ
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
