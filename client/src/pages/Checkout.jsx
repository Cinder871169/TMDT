import { useCartStore } from "../store/useCartStore";
import { useAuthStore } from "../store/useAuthStore";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Checkout() {

    const { cart, clearCart } = useCartStore();
    const { userInfo } = useAuthStore();

    const [qrUrl, setQrUrl] = useState(null);
    const [orderId, setOrderId] = useState(null);
    const [paying, setPaying] = useState(false);
    const [address, setAddress] = useState("")
    const [phone, setPhone] = useState("")
    const [city, setCity] = useState("")

    const navigate = useNavigate();

    useEffect(() => {
        if (!userInfo) navigate("/login");
    }, [userInfo, navigate]);

    const totalPrice = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );
    const shippingFee = totalPrice > 2000000 ? 0 : 30000

    const handlePayment = async () => {

        if (!userInfo) {
            navigate("/login");
            return;
        }

        try {

            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            const { data } = await axios.post(
                "http://localhost:5000/api/orders",
                {
                    orderItems: cart.map((item) => ({
                        ...item,
                        product: item._id,
                    })),
                    totalPrice,
                    address,
                    phone,
                    city,
                },
                config
            );

            setQrUrl(data.qrCodeUrl);
            setOrderId(data.order?._id || null);

        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 py-20">

            <h1 className="text-3xl font-black mb-10">
                Thanh Toán
            </h1>
            <div>

                <h2 className="text-2xl font-black mb-6">
                    Shipping Address
                </h2>

                <div className="space-y-4">

                    <input
                        type="text"
                        placeholder="Full address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full border p-3 rounded-xl"
                    />

                    <input
                        type="text"
                        placeholder="Phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full border p-3 rounded-xl"
                    />

                    <input
                        type="text"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full border p-3 rounded-xl"
                    />

                </div>

            </div>

            <div className="bg-white p-10 rounded-3xl shadow-lg">

                {cart.map(item => (

                    <div
                        key={`${item._id}-${item.size}-${item.color}`}
                        className="flex gap-4 mb-4"
                    >

                        <img
                            src={item.image}
                            className="w-16 h-16 object-cover rounded"
                        />

                        <div>

                            <p className="font-bold">
                                {item.name}
                            </p>

                            <p className="text-xs text-gray-500">
                                Size: {item.size}
                            </p>

                            <p className="text-xs text-gray-500">
                                Color: {item.color}
                            </p>

                        </div>

                    </div>

                ))}

                <p className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{totalPrice.toLocaleString()}đ</span>
                </p>

                <p className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shippingFee.toLocaleString()}đ</span>
                </p>

                <p className="flex justify-between font-black text-lg mt-3">
                    <span>Total</span>
                    <span>{(totalPrice + shippingFee).toLocaleString()}đ</span>
                </p>

                <button
                    onClick={() => {
                        if (!address || !phone || !city) {
                            alert("Please fill in all shipping information");
                            return;
                        }
                        handlePayment();
                    }}
                    className="mt-8 w-full py-4 bg-black text-white rounded-xl hover:bg-orange-600"
                >
                    Thanh toán QR
                </button>

            </div>

            {qrUrl && (

                <div className="mt-12 text-center">

                    <h2 className="text-xl font-bold mb-4">
                        Quét mã để thanh toán
                    </h2>

                    <img
                        src={qrUrl}
                        className="mx-auto w-64 mb-6"
                    />

                    <button
                        onClick={async () => {
                            if (!orderId) {
                                alert("Không tìm thấy mã đơn hàng. Vui lòng thử lại.");
                                return;
                            }
                            if (!userInfo) {
                                navigate("/login");
                                return;
                            }

                            setPaying(true);
                            try {
                                await axios.put(
                                    `http://localhost:5000/api/orders/${orderId}/pay`,
                                    { status: "Đã thanh toán" },
                                    {
                                        headers: {
                                            Authorization: `Bearer ${userInfo.token}`,
                                        },
                                    },
                                );

                                clearCart();
                                navigate("/order-success");
                            } catch (error) {
                                console.log(error);
                                alert("Thanh toán chưa được cập nhật. Vui lòng thử lại.");
                            } finally {
                                setPaying(false);
                            }
                        }}
                        disabled={paying}
                        className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-60"
                    >

                        Tôi đã thanh toán

                    </button>

                </div>

            )}

        </div>
    );
}