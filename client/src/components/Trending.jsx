import { useEffect, useState } from "react";
import api from "../utils/api";
import ProductCard from "./ProductCard";

export default function Trending() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                setLoading(true);
                const { data } = await api.get("/api/products?keyword=&brand=Tất cả");
                setProducts(data.slice(0, 6));
            } catch (error) {
                console.error("Lỗi load trending:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrending();
    }, []);

    return (
        <section className="max-w-7xl mx-auto py-24">
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black">Trending Now</h2>
                <p className="text-sm text-gray-500">Sản phẩm bán chạy nhất trong tuần</p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-8">
                {loading
                    ? [...Array(3)].map((_, index) => (
                        <div
                            key={index}
                            className="bg-white p-5 rounded-3xl shadow-sm animate-pulse"
                        >
                            <div className="h-52 bg-gray-200 rounded-2xl mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>
                    ))
                    : products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
            </div>
        </section>
    );
}


