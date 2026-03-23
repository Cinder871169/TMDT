import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function OrderSuccess() {

    return (

        <div className="min-h-screen flex items-center justify-center bg-gray-50">

            <div className="bg-white p-12 rounded-3xl shadow-lg text-center max-w-md">

                <CheckCircle
                    size={70}
                    className="text-green-500 mx-auto mb-6"
                />

                <h1 className="text-3xl font-black mb-4">
                    Thanh toán thành công
                </h1>

                <p className="text-gray-500 mb-8">
                    Cảm ơn bạn đã mua hàng tại SneakerZone
                </p>

                <div className="flex gap-4 justify-center">

                    <Link
                        to="/"
                        className="px-6 py-3 bg-black text-white rounded-xl hover:bg-orange-600"
                    >
                        Tiếp tục mua sắm
                    </Link>

                    <Link
                        to="/orders"
                        className="px-6 py-3 border rounded-xl hover:border-black"
                    >
                        Xem đơn hàng
                    </Link>

                </div>

            </div>

        </div>

    )

}