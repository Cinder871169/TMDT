import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../services/adminApi";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import { Newspaper, Plus, Edit, Trash2, Search, Eye } from "lucide-react";

export default function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadNews = async () => {
    try {
      setLoading(true);
      const { data } = await adminApi.getNews();
      setNews(data);
    } catch (err) {
      console.error("Lỗi tải bài viết:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa bài viết này?")) return;
    try {
      await adminApi.deleteNews(id);
      alert("Xóa bài viết thành công!");
      loadNews();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi xóa bài viết");
    }
  };

  const filteredNews = news.filter((n) =>
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: "title",
      label: "Tiêu đề",
      sortable: true,
      render: (val) => (
        <div className="max-w-xs">
          <div className="font-semibold truncate">{val}</div>
          <div className="text-muted text-xs truncate">
            {news.find((n) => n.title === val)?.content?.slice(0, 60)}...
          </div>
        </div>
      ),
    },
    {
      key: "author",
      label: "Tác giả",
      sortable: true,
    },
    {
      key: "createdAt",
      label: "Ngày tạo",
      sortable: true,
      render: (val) => (
        <span className="text-sm">
          {new Date(val).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Hành động",
      render: (_, item) => (
        <div className="flex gap-2">
          <a
            href={`/blog/${item._id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
          >
            <Eye size={14} />
          </a>
          <Link
            to={`/admin/news/${item._id}/edit`}
            className="btn btn-secondary btn-sm"
          >
            <Edit size={14} />
          </Link>
          <button
            onClick={() => handleDelete(item._id)}
            className="btn btn-danger btn-sm"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  const pageActions = (
    <Link to="/admin/news/create" className="btn btn-primary">
      <Plus size={18} /> Thêm bài viết
    </Link>
  );

  return (
    <div>
      <PageHeader
        title="Quản lý bài viết"
        subtitle={`Tổng cộng ${filteredNews.length} bài viết`}
        actions={pageActions}
      />

      {/* Search */}
      <div className="card mb-6">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            className="form-input pl-11"
            placeholder="Tìm kiếm bài viết..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* News Table */}
      <DataTable
        columns={columns}
        data={filteredNews}
        loading={loading}
        emptyTitle="Không có bài viết nào"
        emptyText={
          searchTerm
            ? "Không tìm thấy bài viết phù hợp"
            : "Bắt đầu bằng cách viết bài mới"
        }
        pageSize={10}
      />
    </div>
  );
}
