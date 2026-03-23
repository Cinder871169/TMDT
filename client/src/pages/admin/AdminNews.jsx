import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { X, Save } from "lucide-react";

export default function AdminNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    image: "",
    author: "Admin",
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/api/news`);
        setNews(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title,
      content: item.content,
      image: item.image || "",
      author: item.author || "Admin",
    });
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/api/news/${editing._id}`, form);
      else await api.post(`/api/news`, form);
      const { data } = await api.get(`/api/news`);
      setNews(data);
      setShowForm(false);
      setEditing(null);
      setForm({ title: "", content: "", image: "", author: "Admin" });
    } catch (err) {
      alert("Lỗi");
    }
  };

  const remove = async (id) => {
    if (!confirm("Xóa bài viết?")) return;
    try {
      await api.delete(`/api/news/${id}`);
      const { data } = await api.get(`/api/news`);
      setNews(data);
    } catch {
      alert("Lỗi xóa");
    }
  };

  if (loading) return <div className="animate-pulse">Đang tải...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black">Quản lý bài viết</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          Thêm bài viết
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {news.map((n) => (
          <div key={n._id} className="bg-white p-4 rounded-lg shadow-sm">
            <img
              src={n.image || "/images/default-news.jpg"}
              alt=""
              className="w-full h-28 object-cover rounded-md mb-3"
            />
            <h3 className="font-bold">{n.title}</h3>
            <p className="text-xs text-gray-500 mb-3">
              {n.author} • {new Date(n.createdAt).toLocaleDateString()}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => openEdit(n)}
                className="px-3 py-1 bg-blue-500 text-white rounded"
              >
                Sửa
              </button>
              <button
                onClick={() => remove(n._id)}
                className="px-3 py-1 bg-red-500 text-white rounded"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl p-6 rounded-2xl">
            <button
              onClick={() => {
                setShowForm(false);
                setEditing(null);
              }}
              className="float-right"
            >
              <X />
            </button>
            <h3 className="font-black text-xl mb-4">
              {editing ? "Sửa bài viết" : "Thêm bài viết"}
            </h3>
            <form onSubmit={submit} className="space-y-4">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Tiêu đề"
                className="w-full p-3 bg-gray-50 rounded"
                required
              />
              <input
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                placeholder="Tác giả"
                className="w-full p-3 bg-gray-50 rounded"
              />
              <input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="URL ảnh"
                className="w-full p-3 bg-gray-50 rounded"
              />
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={6}
                placeholder="Nội dung"
                className="w-full p-3 bg-gray-50 rounded"
                required
              />
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-3 rounded flex items-center gap-2"
              >
                <Save /> Lưu
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
