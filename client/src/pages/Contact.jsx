import { useState } from "react";
import api from "../utils/api"; // Sử dụng instance api đã cấu hình sẵn
import toast from "react-hot-toast";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra đầu vào cơ bản
    if (!name || !email || !subject || !message) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    setLoading(true);
    try {
      // Sử dụng instance 'api' thay vì gọi axios trực tiếp để dùng chung cấu hình baseURL
      const { data } = await api.post("/api/users/contact", {
        name,
        email,
        subject,
        message,
      });

      toast.success(data.message || "Gửi liên hệ thành công!");

      // Reset form sau khi gửi thành công
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi gửi tin nhắn!",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-20 px-6 grid md:grid-cols-2 gap-16">
      {/* Cột trái: Thông tin liên hệ */}
      <div>
        <h1 className="text-4xl font-black mb-6">Liên Hệ</h1>
        <p className="text-gray-600 mb-6">
          Nếu bạn có câu hỏi về sản phẩm hoặc đơn hàng, hãy liên hệ với chúng
          tôi.
        </p>

        <div className="space-y-4">
          <div className="mt-8">
            <h3 className="font-bold mb-4">Vị trí cửa hàng</h3>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3725.21446714247!2d105.7816155759684!3d20.984034089308637!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135acce6336585d%3A0xc6c4f0f0c0f0c0f0!2zNCBOZ8O1IDU4LzY3IFRoYW5oIELDr25oLCBN4buZIExhbywgSMOgIMSQw7RuZywgSMOgIE7hu5lp!5e0!3m2!1svi!2s!4v1710000000000"
              width="100%"
              height="300"
              className="rounded-xl border"
              loading="lazy"
              title="Cửa hàng SneakerZone"
            ></iframe>
          </div>
          <p>📍 Địa chỉ: 4 ngõ 58/67 Thanh Bình, Mộ Lao, Hà Đông, Hà Nội</p>
          <p>☎ Hotline: 0988 888 888</p>
          <p>✉ Email: support@sneakerzone.online</p>
        </div>
      </div>

      {/* Cột phải: Form liên hệ */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Họ và tên"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
          disabled={loading}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
          disabled={loading}
        />

        <input
          type="text"
          placeholder="Tiêu đề"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
          disabled={loading}
        />

        <textarea
          placeholder="Tin nhắn"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border p-3 rounded-xl h-32 focus:ring-2 focus:ring-orange-500 outline-none"
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Đang gửi..." : "Gửi liên hệ"}
        </button>
      </form>
    </div>
  );
}
