import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Vui lòng nhập email!");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/users/newsletter",
        { email },
      );
      toast.success(data.message);
      setEmail("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="my-24 bg-orange-500 rounded-[4rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-orange-100">
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      <div className="relative z-10 max-w-2xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter uppercase italic leading-none">
          Đừng bỏ lỡ <br /> <span className="text-black">Kèo Thơm!</span>
        </h2>
        <p className="text-white/80 font-medium mb-10">
          Đăng ký nhận bản tin để được giảm giá 10% cho đơn hàng đầu tiên.
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email của bạn..."
            className="flex-1 bg-white/20 border-2 border-white/20 rounded-2xl px-6 py-4 text-white placeholder:text-white/60 outline-none focus:bg-white focus:text-black transition-all"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;
