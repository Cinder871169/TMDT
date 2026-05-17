import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../services/adminApi";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import { Package, Plus, Edit, Trash2, Search, Eye, Filter } from "lucide-react";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [brands, setBrands] = useState([]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data } = await adminApi.getProducts();
      setProducts(data);
      // Extract unique brands
      const uniqueBrands = [...new Set(data.map((p) => p.brand).filter(Boolean))];
      setBrands(uniqueBrands);
    } catch (err) {
      console.error("Lỗi tải sản phẩm:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    try {
      await adminApi.deleteProduct(id);
      alert("Xóa sản phẩm thành công!");
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi xóa sản phẩm");
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = brandFilter === "all" || p.brand === brandFilter;
    return matchesSearch && matchesBrand;
  });

  const columns = [
    {
      key: "image",
      label: "Ảnh",
      render: (_, item) => {
        // Get first image from first color
        const firstImage = item.colors?.[0]?.images?.[0] || item.image;
        return (
          <img
            src={firstImage || 'https://placehold.co/48x48/cccccc/666666?text=No'}
            alt="product"
            style={{ width: "40px", height: "40px", objectFit: "cover" }}
            onError={(e) => {
              e.target.src = 'https://placehold.co/48x48/cccccc/666666?text=No';
            }}
          />
        );
      },
    },
    {
      key: "name",
      label: "Sản phẩm",
      sortable: true,
      render: (val, item) => (
        <div>
          <div className="font-semibold">{val}</div>
          <div className="text-muted text-xs">
            Sizes: {item.sizes?.join(", ")}
          </div>
          {item.colors && item.colors.length > 0 && (
            <div className="text-muted text-xs">
              Màu: {item.colors.map(c => c.name).join(", ")}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "brand",
      label: "Hãng",
      sortable: true,
    },
    {
      key: "price",
      label: "Giá",
      sortable: true,
      render: (val, item) => (
        <div>
          <div className="font-bold">{val?.toLocaleString("vi-VN")}đ</div>
          {item.isOnSale && item.originalPrice && (
            <div className="text-muted text-xs line-through">
              {item.originalPrice.toLocaleString("vi-VN")}đ
            </div>
          )}
        </div>
      ),
    },
    {
      key: "countInStock",
      label: "Tồn kho",
      sortable: true,
      render: (val) => (
        <div className="text-center">
          <span className={`font-bold ${val <= 5 && val > 0 ? 'text-orange-500' : val === 0 ? 'text-red-500' : 'text-green-600'}`}>
            {val}
          </span>
          {val <= 5 && val > 0 && (
            <div className="text-xs text-orange-500">Sắp hết</div>
          )}
          {val === 0 && (
            <div className="text-xs text-red-500">Hết hàng</div>
          )}
        </div>
      ),
    },
    {
      key: "isOnSale",
      label: "Trạng thái",
      render: (val) =>
        val ? (
          <span className="badge badge-pending">Sale</span>
        ) : (
          <span className="badge badge-user">Bình thường</span>
        ),
    },
    {
      key: "actions",
      label: "Hành động",
      render: (_, item) => (
        <div className="flex gap-2">
          <Link
            to={`/products/${item._id}/edit`}
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
    <Link to="/products/create" className="btn btn-primary">
      <Plus size={18} /> Thêm sản phẩm
    </Link>
  );

  return (
    <div>
      <PageHeader
        title="Quản lý sản phẩm"
        subtitle={`Tổng cộng ${filteredProducts.length} sản phẩm`}
        actions={pageActions}
      />

      {/* Search & Filter */}
      <div className="card mb-6">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              className="form-input pl-11"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="form-input w-auto"
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
          >
            <option value="all">Tất cả hãng</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <DataTable
        columns={columns}
        data={filteredProducts}
        loading={loading}
        emptyTitle="Không có sản phẩm nào"
        emptyText={
          searchTerm || brandFilter !== "all"
            ? "Không tìm thấy sản phẩm phù hợp"
            : "Bắt đầu bằng cách thêm sản phẩm mới"
        }
        pageSize={10}
      />
    </div>
  );
}
