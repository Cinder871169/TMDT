import { Link } from "react-router-dom";
import { useState } from "react";
import {
    Activity,
    Zap,
    Crown,
    Gamepad2,
    Shirt,
    Dumbbell,
    Footprints,
    Sparkles
} from "lucide-react";

export default function Categories() {
    const [hoveredCategory, setHoveredCategory] = useState(null);

    const categories = [
        {
            name: "Basketball",
            image: "/basketball.jpg",
            icon: Activity,
            description: "Giày bóng rổ chuyên nghiệp",
            color: "from-orange-500 to-red-500"
        },
        {
            name: "Running",
            image: "/running.jpg",
            icon: Zap,
            description: "Giày chạy bộ performance",
            color: "from-blue-500 to-cyan-500"
        },
        {
            name: "Lifestyle",
            image: "/lifestyle.jpg",
            icon: Crown,
            description: "Giày sneaker hàng ngày",
            color: "from-purple-500 to-pink-500"
        },
    ];

    return (
        <section className="max-w-7xl mx-auto py-20 px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-black mb-4">
                    Khám phá theo danh mục
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Tìm kiếm giày phù hợp với phong cách và nhu cầu của bạn từ các danh mục hot nhất
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {categories.map((cat, index) => {
                    const IconComponent = cat.icon;
                    return (
                        <Link
                            key={cat.name}
                            to={`/products?brand=${encodeURIComponent(cat.name)}`}
                            className="group relative h-64 sm:h-72 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                            onMouseEnter={() => setHoveredCategory(index)}
                            onMouseLeave={() => setHoveredCategory(null)}
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0">
                                <img
                                    src={cat.image}
                                    alt={cat.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                {/* Gradient Overlay */}
                                <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-60 group-hover:opacity-40 transition-opacity duration-500`}></div>
                            </div>

                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                                {/* Icon */}
                                <div className={`mb-4 transition-all duration-500 ${hoveredCategory === index ? 'scale-110 rotate-12' : 'scale-100'
                                    }`}>
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                        <IconComponent className="w-6 h-6" />
                                    </div>
                                </div>

                                {/* Text Content */}
                                <div className={`transition-all duration-500 ${hoveredCategory === index ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-90'
                                    }`}>
                                    <h3 className="text-xl sm:text-2xl font-black mb-2 group-hover:text-yellow-200 transition-colors">
                                        {cat.name}
                                    </h3>
                                    <p className="text-sm sm:text-base text-white/90 mb-4">
                                        {cat.description}
                                    </p>

                                    {/* CTA Button */}
                                    <div className={`inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ${hoveredCategory === index ? 'bg-white text-black scale-105' : ''
                                        }`}>
                                        <span>Khám phá</span>
                                        <Sparkles className={`w-4 h-4 transition-transform ${hoveredCategory === index ? 'rotate-12' : ''
                                            }`} />
                                    </div>
                                </div>
                            </div>

                            {/* Hover Effect Border */}
                            <div className={`absolute inset-0 border-2 border-white/0 rounded-3xl transition-all duration-500 ${hoveredCategory === index ? 'border-white/50 scale-105' : ''
                                }`}></div>
                        </Link>
                    );
                })}
            </div>

            {/* View All Button */}
            <div className="text-center mt-12">
                <Link
                    to="/products"
                    className="inline-flex items-center gap-3 bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-orange-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                    <Footprints className="w-5 h-5" />
                    Xem tất cả sản phẩm
                    <Sparkles className="w-5 h-5" />
                </Link>
            </div>
        </section>
    );
}