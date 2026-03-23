import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";

export default function Products() {

    const [products, setProducts] = useState([]);

    const [keyword, setKeyword] = useState("");
    const [category, setCategory] = useState("All");
    const [brand, setBrand] = useState("All");
    const [sort, setSort] = useState("");
    const [price, setPrice] = useState(10000000);

    useEffect(() => {

        const fetchProducts = async () => {

            try {

                const { data } = await axios.get(
                    "http://localhost:5000/api/products"
                )

                setProducts(data)

            } catch (error) {
                console.log(error)
            }

        }

        fetchProducts()

    }, [])


    // SEARCH

    let filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(keyword.toLowerCase())
    )


    // CATEGORY FILTER

    if (category !== "All") {

        filteredProducts = filteredProducts.filter(
            p => p.category === category
        )

    }


    // BRAND FILTER

    if (brand !== "All") {

        filteredProducts = filteredProducts.filter(
            p => p.brand === brand
        )

    }


    // PRICE FILTER

    filteredProducts = filteredProducts.filter(
        p => p.price <= price
    )


    // SORT

    if (sort === "low") {
        filteredProducts.sort((a, b) => a.price - b.price)
    }

    if (sort === "high") {
        filteredProducts.sort((a, b) => b.price - a.price)
    }



    return (

        <div className="max-w-7xl mx-auto px-6 py-16">


            {/* BREADCRUMB */}

            <div className="text-sm text-gray-500 mb-8">

                Trang chủ / Cửa hàng /

                <span className="font-bold">
                    Sản phẩm
                </span>

            </div>



            <div className="grid md:grid-cols-4 gap-12">



                {/* SIDEBAR */}

                <div className="space-y-10">

                    <h2 className="text-xl font-black">
                        Danh mục sản phẩm
                    </h2>


                    {/* SEARCH */}

                    <input
                        type="text"
                        placeholder="Tìm sản phẩm..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="w-full border p-3 rounded-xl"
                    />


                    {/* CATEGORY */}

                    <div>

                        <h3 className="font-bold mb-3">
                            Category
                        </h3>

                        <div className="space-y-2 text-sm">

                            <button
                                onClick={() => setCategory("All")}
                                className="block hover:text-orange-600"
                            >
                                Tất cả
                            </button>

                            <button
                                onClick={() => setCategory("Basketball")}
                                className="block hover:text-orange-600"
                            >
                                Giày bóng rổ
                            </button>

                            <button
                                onClick={() => setCategory("Women")}
                                className="block hover:text-orange-600"
                            >
                                Giày bóng rổ nữ
                            </button>

                            <button
                                onClick={() => setCategory("Kids")}
                                className="block hover:text-orange-600"
                            >
                                Giày trẻ em
                            </button>

                            <button
                                onClick={() => setCategory("Accessories")}
                                className="block hover:text-orange-600"
                            >
                                Phụ kiện
                            </button>

                        </div>

                    </div>


                    {/* BRAND */}

                    <div>

                        <h3 className="font-bold mb-3">
                            Brand
                        </h3>

                        <div className="space-y-2 text-sm">

                            <button onClick={() => setBrand("All")}
                                className="block hover:text-orange-600"
                            >

                                All
                            </button>

                            <button onClick={() => setBrand("Nike")}
                                className="block hover:text-orange-600"
                            >
                                Nike
                            </button>

                            <button onClick={() => setBrand("Adidas")}
                                className="block hover:text-orange-600"
                            >
                                Adidas
                            </button>

                            <button onClick={() => setBrand("Puma")}
                                className="block hover:text-orange-600"
                            >
                                Puma
                            </button>

                        </div>

                    </div>


                    {/* PRICE FILTER */}

                    <div>

                        <h3 className="font-bold mb-3">
                            Price
                        </h3>

                        <input
                            type="range"
                            min="0"
                            max="10000000"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full"
                        />

                        <p className="text-sm mt-2">
                            Up to {price.toLocaleString()}đ
                        </p>

                    </div>

                </div>



                {/* PRODUCT AREA */}

                <div className="md:col-span-3">


                    {/* TOOLBAR */}

                    <div className="flex justify-between items-center mb-10">

                        <p className="text-gray-500">

                            Hiển thị tất cả {filteredProducts.length} kết quả

                        </p>


                        <select
                            onChange={(e) => setSort(e.target.value)}
                            className="border p-2 rounded-lg"
                        >

                            <option value="">
                                Độ liên quan
                            </option>

                            <option value="low">
                                Giá thấp → cao
                            </option>

                            <option value="high">
                                Giá cao → thấp
                            </option>

                        </select>

                    </div>



                    {/* PRODUCT GRID */}

                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10">

                        {filteredProducts.map(product => (

                            <ProductCard
                                key={product._id}
                                product={product}
                            />

                        ))}

                    </div>


                </div>

            </div>

        </div>

    )

}