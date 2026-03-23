import { Link } from "react-router-dom";

export default function Categories() {

    const categories = [
        {
            name: "Basketball",
            image: "/public/basketball.jpg"
        },
        {
            name: "Running",
            image: "/public/running.jpg"
        },
        {
            name: "Lifestyle",
            image: "/public/lifestyle.jpg"
        }
    ]

    return (

        <section className="max-w-7xl mx-auto py-20">

            <h2 className="text-3xl font-black mb-10">
                Shop by Category
            </h2>

            <div className="grid md:grid-cols-3 gap-8">

                {categories.map((cat) => (
                    <Link
                        key={cat.name}
                        className="relative h-64 rounded-3xl overflow-hidden group"
                    >

                        <img
                            src={cat.image}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                        />

                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">

                            <h3 className="text-white text-2xl font-black">
                                {cat.name}
                            </h3>

                        </div>

                    </Link>
                ))}

            </div>

        </section>

    )

}