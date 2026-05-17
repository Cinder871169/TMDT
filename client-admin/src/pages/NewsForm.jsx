import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { adminApi } from "../services/adminApi";
import PageHeader from "../components/PageHeader";
import { Save, ArrowLeft, X, Image, Upload, Eye } from "lucide-react";

export default function NewsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [news, setNews] = useState({
    title: "",
    content: "",
    author: "Admin",
    published: true,
  });
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadNews();
    }
  }, [id]);

  const loadNews = async () => {
    try {
      setLoading(true);
      const { data } = await adminApi.getNewsItem(id);
      setNews({
        title: data.title,
        content: data.content,
        author: data.author || "Admin",
        published: data.published !== false,
      });
      setImagePreview(data.image || "");
    } catch (err) {
      console.error("Lỗi tải bài viết:", err);
      alert("Không thể tải thông tin bài viết");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("title", news.title);
      formData.append("content", news.content);
      formData.append("author", news.author);
      formData.append("published", news.published);
      
      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (isEditing) {
        await adminApi.updateNews(id, formData);
        alert("Cập nhật bài viết thành công!");
      } else {
        await adminApi.createNews(formData);
        alert("Thêm bài viết thành công!");
      }
      navigate("/news");
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi lưu bài viết");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={isEditing ? "Chỉnh sửa bài viết" : "Viết bài mới"}
        breadcrumbs={["Bài viết", isEditing ? "Chỉnh sửa" : "Viết mới"]}
        actions={
          <Link to="/news" className="btn btn-secondary">
            <ArrowLeft size={18} /> Quay lại
          </Link>
        }
      />

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="card-body">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Content */}
              <div className="lg:col-span-2 space-y-6">
                <div className="form-group">
                  <label className="form-label">Tiêu đề bài viết *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={news.title}
                    onChange={(e) =>
                      setNews({ ...news, title: e.target.value })
                    }
                    placeholder="Nhập tiêu đề bài viết..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nội dung bài viết *</label>
                  <textarea
                    required
                    className="form-input min-h-[400px]"
                    rows="20"
                    value={news.content}
                    onChange={(e) =>
                      setNews({ ...news, content: e.target.value })
                    }
                    placeholder="Viết nội dung bài viết tại đây...&#10;&#10;Bạn có thể viết văn bản thuần túy hoặc sử dụng các định dạng đơn giản."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Nhập nội dung văn bản bình thường. Nội dung sẽ được hiển thị đầy đủ trên trang bài viết.
                  </p>
                </div>
              </div>

              {/* Right Column - Settings & Preview */}
              <div className="space-y-6">
                {/* Publish Settings */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h3 className="font-bold text-gray-900 mb-4">Cài đặt</h3>
                  
                  <div className="form-group">
                    <label className="form-label">Tác giả</label>
                    <input
                      type="text"
                      className="form-input"
                      value={news.author}
                      onChange={(e) =>
                        setNews({ ...news, author: e.target.value })
                      }
                      placeholder="Tên tác giả"
                    />
                  </div>

                  <div className="form-group">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={news.published}
                        onChange={(e) =>
                          setNews({ ...news, published: e.target.checked })
                        }
                        className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="font-medium">Xuất bản ngay</span>
                    </label>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h3 className="font-bold text-gray-900 mb-4">Hình ảnh bài viết</h3>
                  
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                      dragActive
                        ? "border-orange-500 bg-orange-50"
                        : imagePreview
                        ? "border-green-300 bg-green-50"
                        : "border-gray-300 hover:border-orange-400"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {imagePreview ? (
                      <div className="relative">
                        <div className="relative group">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-40 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <Eye className="text-white w-8 h-8" />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={clearImage}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="text-gray-500">
                        <Upload className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                        <p className="font-medium">Kéo thả ảnh vào đây</p>
                        <p className="text-xs mt-1">hoặc</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="mt-4 w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                      onChange={handleImageChange}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Hỗ trợ JPG, PNG. Kích thước khuyến nghị: 800x600px
                  </p>
                </div>

                {/* Preview Card */}
                {news.title && (
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="font-bold text-gray-900 mb-4">Xem trước</h3>
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-32 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h4 className="font-bold text-gray-900 line-clamp-2">
                          {news.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-2">
                          {news.author} • {new Date().toLocaleDateString("vi-VN")}
                        </p>
                        {news.content && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                            {news.content.slice(0, 150)}...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card-footer flex justify-end gap-3 border-t p-4">
            <Link to="/news" className="btn btn-secondary">
              Hủy
            </Link>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={saving}
            >
              <Save size={18} />
              {saving ? "Đang lưu..." : isEditing ? "Cập nhật" : "Xuất bản"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
