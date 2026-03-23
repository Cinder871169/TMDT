import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { toast } from "react-hot-toast";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    price: "",
    brand: "",
    description: "",
    sizes: "40,41",
    colors: "Black",
  });
  const [imageFile, setImageFile] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get(`/api/products`);
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      price: "",
      brand: "",
      description: "",
      sizes: "40,41",
      colors: "Black",
    });
    setImageFile(null);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name || "",
      price: p.price || "",
      brand: p.brand || "",
      description: p.description || "",
      sizes: (p.sizes || []).join(","),
      colors: (p.colors || []).join(","),
    });
    setImageFile(null);
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("price", form.price);
    fd.append("brand", form.brand);
    fd.append("description", form.description);
    fd.append("sizes", form.sizes);
    fd.append("colors", form.colors);
    if (imageFile) fd.append("image", imageFile);
    try {
      setSubmitting(true);
      if (editing) {
        await api.put(`/api/products/${editing._id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Cập nhật sản phẩm thành công");
      } else {
        await api.post(`/api/products`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Thêm sản phẩm thành công");
      }
      setShowForm(false);
      setEditing(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi lưu sản phẩm");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Xóa sản phẩm?")) return;
    try {
      await api.delete(`/api/products/${id}`);
      fetchProducts();
    } catch (err) {
      toast.error("Lỗi xóa sản phẩm");
    }
  };

  if (loading) return <div className="animate-pulse">Đang tải sản phẩm...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black">Sản phẩm</h2>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Thêm mới
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-xs text-gray-400 uppercase">
            <tr>
              <th>Ảnh</th>
              <th>Tên</th>
              <th>Hãng</th>
              <th>Giá</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50">
                <td className="py-3 w-20">
                  <img
                    src={p.image}
                    alt=""
                    className="w-16 h-12 object-cover rounded"
                  />
                </td>
                <td className="py-3 font-bold">{p.name}</td>
                <td className="py-3">{p.brand}</td>
                <td className="py-3 font-black text-orange-600">
                  {(p.price || 0).toLocaleString("vi-VN")}đ
                </td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="px-3 py-1 bg-blue-500 text-white rounded"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => remove(p._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-xl">
                {editing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500"
              >
                Đóng
              </button>
            </div>
            <form
              onSubmit={submit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Tên"
                className="p-3 bg-gray-50 rounded"
                required
              />
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="Giá"
                className="p-3 bg-gray-50 rounded"
                required
              />
              <input
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="Hãng"
                className="p-3 bg-gray-50 rounded"
              />
              <input
                value={form.sizes}
                onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                placeholder="Sizes (40,41)"
                className="p-3 bg-gray-50 rounded"
              />
              <input
                value={form.colors}
                onChange={(e) => setForm({ ...form, colors: e.target.value })}
                placeholder="Màu"
                className="p-3 bg-gray-50 rounded"
              />
              <div className="p-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full"
                />
                {(imageFile || (editing && editing.image)) && (
                  <img
                    src={
                      imageFile ? URL.createObjectURL(imageFile) : editing.image
                    }
                    alt="preview"
                    className="mt-2 w-32 h-24 object-cover rounded"
                  />
                )}
              </div>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Mô tả"
                className="p-3 col-span-2 bg-gray-50 rounded"
              />
              <div className="col-span-2 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditing(null);
                  }}
                  className="px-4 py-2 rounded border"
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded"
                  disabled={submitting}
                >
                  {submitting ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
