export default function FeatureHighlights() {
    const features = [
        {
            title: "Hỗ trợ 24/7",
            description: "Đội ngũ tư vấn luôn sẵn sàng khi bạn cần.",
            icon: "💬",
        },
        {
            title: "Giao hàng nhanh trong 24h",
            description: "Sẵn sàng giao toàn quốc với sản phẩm chuẩn chính hãng.",
            icon: "🚀",
        },
        {
            title: "Cam kết chính hãng",
            description: "Mua giày uy tín, đổi trả miễn phí trong 7 ngày.",
            icon: "🛡️",
        },
        {
            title: "Hot trend cập nhật",
            description: "Bộ sưu tập mới lên kệ mỗi tuần.",
            icon: "🔥",
        },
        
    ];

    return (
        <section className="max-w-7xl mx-auto py-16">
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-10">Tại sao chọn SneakerZone?</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {features.map((feature) => (
                    <div
                        key={feature.title}
                        className="p-5 rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-shadow duration-300"
                    >
                        <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-2xl mb-4">
                            {feature.icon}
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                        <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
