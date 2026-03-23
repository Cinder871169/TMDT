import { useEffect, useState } from "react"
import axios from "axios"
import ProductCard from "./ProductCard"

export default function RelatedProducts({ brand }) {

    const [products, setProducts] = useState([])

    useEffect(() => {

        const fetchRelated = async () => {

            const { data } = await axios.get(
                `http://localhost:5000/api/products?brand=${brand}`
            )

            setProducts(data.slice(0, 4))

        }

        fetchRelated()

    }, [brand])

    return (

        <section className="mt-24">

            <h2 className="text-2xl font-black mb-8">
                You may also like
            </h2>

            <div className="grid md:grid-cols-4 gap-8">

                {products.map(p => (
                    <ProductCard key={p._id} product={p} />
                ))}

            </div>

        </section>

    )

}