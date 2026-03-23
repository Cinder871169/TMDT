import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";

export default function Trending() {

    const [products, setProducts] = useState([]);

    useEffect(() => {

        const fetchTrending = async () => {

            const { data } = await axios.get(
                "http://localhost:5000/api/products"
            )

            setProducts(data.slice(0, 4));

        }

        fetchTrending();

    }, [])

    return (

        <section className="max-w-7xl mx-auto py-24">

            <div className="flex justify-between items-center mb-10">

                <h2 className="text-3xl font-black">
                    Trending Now
                </h2>

            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">

                {products.map((product) => (
                    <ProductCard
                        key={product._id}
                        product={product}
                    />
                ))}

            </div>

        </section>

    )

}