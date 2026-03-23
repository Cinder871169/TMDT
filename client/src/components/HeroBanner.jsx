export default function Hero() {

    return (

        <section className="relative h-[520px] rounded-[3rem] overflow-hidden bg-black text-white flex items-center justify-center mb-16">

            <img
                src="/hero.jpg"
                className="absolute inset-0 w-full h-full object-cover opacity-40"
            />

            <div className="relative text-center">

                <h1 className="text-5xl font-black mb-6">
                    SneakerZone - Your Ultimate Sneaker Destination
                </h1>

                <p className="mb-8 text-lg opacity-80">
                    Discover the latest basketball shoes
                </p>

                <button className="bg-orange-600 px-8 py-4 rounded-full font-bold hover:bg-orange-500">
                    Shop Now
                </button>

            </div>

        </section>

    );

}