import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { adminApi } from "../services/adminApi";
import PageHeader from "../components/PageHeader";
import {
  Save,
  ArrowLeft,
  X,
  Upload,
  Eye,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Minus,
  Link2,
  Code,
  Palette,
  FileText,
  Sparkles
} from "lucide-react";

export default function NewsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("editor"); // 'editor' | 'preview'
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

  // HTML Rich Text Injection Helper
  const insertTag = (beforeTag, afterTag = "") => {
    const textarea = document.getElementById("content-textarea");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const replacement = beforeTag + selectedText + afterTag;

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setNews({ ...news, content: newContent });

    // Focus back and set selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + beforeTag.length,
        start + beforeTag.length + selectedText.length
      );
    }, 0);
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
      navigate("/admin/news");
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
          <Link to="/admin/news" className="btn btn-secondary">
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
                  <label className="form-label font-bold text-gray-800">Tiêu đề bài viết *</label>
                  <input
                    type="text"
                    required
                    className="form-input text-lg font-semibold placeholder:font-normal focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    value={news.title}
                    onChange={(e) =>
                      setNews({ ...news, title: e.target.value })
                    }
                    placeholder="Nhập tiêu đề bài viết..."
                  />
                </div>

                <div className="form-group">
                  <div className="flex justify-between items-center mb-2">
                    <label className="form-label font-bold text-gray-800 mb-0">Nội dung bài viết *</label>
                    {/* Visual Tabs */}
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setActiveTab("editor")}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          activeTab === "editor"
                            ? "bg-white text-orange-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <FileText size={13} /> Biên tập
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("preview")}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          activeTab === "preview"
                            ? "bg-white text-orange-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <Eye size={13} /> Xem trước trực quan
                      </button>
                    </div>
                  </div>

                  {activeTab === "editor" ? (
                    <div className="border border-gray-200 rounded-2xl overflow-hidden focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                      {/* Rich Text Toolbar */}
                      <div className="flex flex-wrap gap-1 bg-gray-50/80 p-2 border-b border-gray-100 select-none">
                        <button
                          type="button"
                          title="Chữ đậm"
                          onClick={() => insertTag("<strong>", "</strong>")}
                          className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                          <Bold size={15} />
                        </button>
                        <button
                          type="button"
                          title="Chữ nghiêng"
                          onClick={() => insertTag("<em>", "</em>")}
                          className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                          <Italic size={15} />
                        </button>
                        <span className="w-px h-6 bg-gray-200 my-auto mx-1" />
                        <button
                          type="button"
                          title="Tiêu đề 1"
                          onClick={() => insertTag("<h1 className='text-3xl font-extrabold text-gray-900 mt-6 mb-3'>", "</h1>")}
                          className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                          <Heading1 size={15} />
                        </button>
                        <button
                          type="button"
                          title="Tiêu đề 2"
                          onClick={() => insertTag("<h2 className='text-2xl font-bold text-gray-900 mt-5 mb-2'>", "</h2>")}
                          className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                          <Heading2 size={15} />
                        </button>
                        <button
                          type="button"
                          title="Tiêu đề 3"
                          onClick={() => insertTag("<h3 className='text-xl font-bold text-gray-900 mt-4 mb-2'>", "</h3>")}
                          className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                          <Heading3 size={15} />
                        </button>
                        <span className="w-px h-6 bg-gray-200 my-auto mx-1" />
                        <button
                          type="button"
                          title="Trích dẫn"
                          onClick={() => insertTag("<blockquote className='border-l-4 border-orange-500 pl-4 py-1 my-4 italic text-gray-600 bg-orange-50/30 rounded-r-lg'>", "</blockquote>")}
                          className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                          <Quote size={15} />
                        </button>
                        <button
                          type="button"
                          title="Danh sách không thứ tự"
                          onClick={() => insertTag("<ul className='list-disc pl-6 space-y-1 my-3'>\n  <li>", "</li>\n</ul>")}
                          className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                          <List size={15} />
                        </button>
                        <button
                          type="button"
                          title="Danh sách có thứ tự"
                          onClick={() => insertTag("<ol className='list-decimal pl-6 space-y-1 my-3'>\n  <li>", "</li>\n</ol>")}
                          className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                          <ListOrdered size={15} />
                        </button>
                        <button
                          type="button"
                          title="Đường phân cách"
                          onClick={() => insertTag("<hr className='my-6 border-gray-200' />\n")}
                          className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                          <Minus size={15} />
                        </button>
                        <span className="w-px h-6 bg-gray-200 my-auto mx-1" />
                        <button
                          type="button"
                          title="Chèn liên kết"
                          onClick={() => insertTag("<a href='https://' target='_blank' className='text-orange-600 underline font-semibold'>", "</a>")}
                          className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                          <Link2 size={15} />
                        </button>
                        <button
                          type="button"
                          title="Chèn khối mã (Code)"
                          onClick={() => insertTag("<pre className='bg-slate-100 p-4 rounded-xl font-mono text-sm overflow-x-auto my-4'>\n<code>", "</code>\n</pre>")}
                          className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                          <Code size={15} />
                        </button>
                        <button
                          type="button"
                          title="Tô màu cam thương hiệu"
                          onClick={() => insertTag("<span className='text-orange-600 font-bold'>", "</span>")}
                          className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                          <Palette size={15} className="text-orange-600" />
                        </button>
                      </div>

                      <textarea
                        id="content-textarea"
                        required
                        className="w-full min-h-[450px] p-4 text-sm font-mono leading-relaxed outline-none border-none resize-y"
                        rows="20"
                        value={news.content}
                        onChange={(e) =>
                          setNews({ ...news, content: e.target.value })
                        }
                        placeholder="Viết nội dung bài viết tại đây... 

Bạn có thể soạn thảo tự do bằng văn bản thuần túy hoặc sử dụng thanh công cụ soạn thảo HTML phía trên để định dạng văn bản cực kỳ sinh động!"
                      />
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-2xl p-6 bg-white min-h-[450px] overflow-y-auto">
                      {news.content ? (
                        <div
                          className="text-gray-700 leading-relaxed text-sm prose prose-orange max-w-none space-y-4"
                          dangerouslySetInnerHTML={{ __html: news.content }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-[350px] text-gray-400">
                          <Sparkles className="w-10 h-10 mb-2 animate-pulse text-orange-300" />
                          <p className="text-xs">Chưa có nội dung để xem trước</p>
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <Sparkles size={12} className="text-orange-500" /> Mẹo: Sử dụng thanh công cụ để định dạng bài viết chuyên nghiệp mà không cần biết viết mã HTML!
                  </p>
                </div>
              </div>

              {/* Right Column - Settings & Preview */}
              <div className="space-y-6">
                {/* Publish Settings */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 pb-2 border-b border-gray-50">
                    Cấu hình bài viết
                  </h3>
                  
                  <div className="form-group mb-4">
                    <label className="form-label text-xs font-bold text-gray-500 uppercase tracking-wider">Tác giả</label>
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

                  <div className="form-group mt-5">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={news.published}
                        onChange={(e) =>
                          setNews({ ...news, published: e.target.checked })
                        }
                        className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="font-bold text-sm text-gray-700">Xuất bản ngay lập tức</span>
                    </label>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 pb-2 border-b border-gray-50">
                    Ảnh đại diện bài viết
                  </h3>
                  
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                      dragActive
                        ? "border-orange-500 bg-orange-50"
                        : imagePreview
                        ? "border-green-300 bg-green-50/50"
                        : "border-gray-300 hover:border-orange-400"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {imagePreview ? (
                      <div className="relative">
                        <div className="relative group rounded-lg overflow-hidden border">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-40 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="text-white w-8 h-8" />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={clearImage}
                          className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="text-gray-500 py-3">
                        <Upload className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                        <p className="font-bold text-xs">Kéo thả ảnh đại diện</p>
                        <p className="text-[10px] mt-1 text-gray-400">hoặc click nút bên dưới để chọn file</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="mt-4 w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
                      onChange={handleImageChange}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                    Định dạng hỗ trợ: JPG, PNG, WEBP. Ảnh tỷ lệ ngang 4:3 sẽ hiển thị đẹp nhất.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card-footer flex justify-end gap-3 border-t p-4 bg-gray-50/50">
            <Link to="/admin/news" className="btn btn-secondary rounded-xl">
              Hủy
            </Link>
            <button 
              type="submit" 
              className="btn btn-primary rounded-xl px-5 font-bold" 
              disabled={saving}
            >
              <Save size={18} />
              {saving ? "Đang lưu..." : isEditing ? "Cập nhật" : "Xuất bản bài viết"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
