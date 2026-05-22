import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { adminApi } from "../services/adminApi";
import PageHeader from "../components/PageHeader";
import { Save, ArrowLeft, X, Plus, Image as ImageIcon } from "lucide-react";

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState({
    name: "",
    price: "",
    brand: "",
    description: "",
    sizes: "40, 41, 42, 43",
    countInStock: 0,
    isOnSale: false,
    originalPrice: "",
  });

  // Colors state: [{ name: "Đen", images: [preview1, preview2], files: [file1, file2] }]
  const [colors, setColors] = useState([
    { name: "", images: [], files: [] }
  ]);

  useEffect(() => {
    if (isEditing) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const { data } = await adminApi.getProduct(id);
      setProduct({
        name: data.name,
        price: data.price,
        brand: data.brand,
        description: data.description || "",
        sizes: data.sizes?.join(", ") || "",
        countInStock: data.countInStock || 0,
        isOnSale: data.isOnSale || false,
        originalPrice: data.originalPrice || "",
      });

      // Load colors with images
      if (data.colors && data.colors.length > 0) {
        setColors(data.colors.map(color => ({
          name: color.name,
          images: color.images || [],
          files: []
        })));
      }
    } catch (err) {
      console.error("Lỗi tải sản phẩm:", err);
      alert("Không thể tải thông tin sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  // Add new color variant
  const addColor = () => {
    setColors([...colors, { name: "", images: [], files: [] }]);
  };

  // Remove color variant
  const removeColor = (index) => {
    if (colors.length > 1) {
      setColors(colors.filter((_, i) => i !== index));
    }
  };

  // Update color name
  const updateColorName = (index, name) => {
    const newColors = [...colors];
    newColors[index].name = name;
    setColors(newColors);
  };

  // Handle image upload for a specific color
  const handleColorImageChange = (index, e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newColors = [...colors];
    const newPreviews = [];

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        // Only update when all files are read
        if (newPreviews.length === files.length) {
          newColors[index].images = [...newColors[index].images, ...newPreviews];
          newColors[index].files = [...newColors[index].files, ...files];
          setColors([...newColors]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove image from a color
  const removeColorImage = (colorIndex, imageIndex) => {
    const newColors = [...colors];
    newColors[colorIndex].images.splice(imageIndex, 1);
    newColors[colorIndex].files.splice(imageIndex, 1);
    setColors(newColors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validate colors
      const validColors = colors.filter(c => c.name.trim() !== "");
      if (validColors.length === 0) {
        alert("Vui lòng thêm ít nhất một màu sắc");
        setSaving(false);
        return;
      }

      const formData = new FormData();
      formData.append("name", product.name);
      formData.append("price", product.price);
      formData.append("brand", product.brand);
      formData.append("description", product.description);
      formData.append("sizes", product.sizes);
      formData.append("countInStock", product.countInStock);
      formData.append("isOnSale", product.isOnSale);
      formData.append("colors", JSON.stringify(validColors.map(c => ({ name: c.name }))));

      if (product.originalPrice) {
        formData.append("originalPrice", product.originalPrice);
      }

      // Append images for each color
      validColors.forEach((color, colorIndex) => {
        color.files.forEach((file) => {
          formData.append(`color_${colorIndex}_images`, file);
        });
      });

      if (isEditing) {
        await adminApi.updateProduct(id, formData);
        alert("Cập nhật sản phẩm thành công!");
      } else {
        await adminApi.createProduct(formData);
        alert("Thêm sản phẩm thành công!");
      }
      navigate("/admin/products");
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi lưu sản phẩm");
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
        title={isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        breadcrumbs={["Sản phẩm", isEditing ? "Chỉnh sửa" : "Thêm mới"]}
        actions={
          <Link to="/admin/products" className="btn btn-secondary">
            <ArrowLeft size={18} /> Quay lại
          </Link>
        }
      />

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="card-body">
            <div className="grid-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="form-group">
                  <label className="form-label">Tên sản phẩm *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={product.name}
                    onChange={(e) =>
                      setProduct({ ...product, name: e.target.value })
                    }
                    placeholder="Nike Air Jordan 1 High..."
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Hãng *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={product.brand}
                      onChange={(e) =>
                        setProduct({ ...product, brand: e.target.value })
                      }
                      placeholder="Nike"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Giá (VNĐ) *</label>
                    <input
                      type="number"
                      required
                      className="form-input"
                      value={product.price}
                      onChange={(e) =>
                        setProduct({ ...product, price: e.target.value })
                      }
                      placeholder="2500000"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Sizes (cách nhau dấu phẩy)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={product.sizes}
                    onChange={(e) =>
                      setProduct({ ...product, sizes: e.target.value })
                    }
                    placeholder="40, 41, 42, 43"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Số lượng tồn kho</label>
                  <input
                    type="number"
                    className="form-input"
                    value={product.countInStock}
                    onChange={(e) =>
                      setProduct({ ...product, countInStock: Number(e.target.value) })
                    }
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mô tả</label>
                  <textarea
                    className="form-input"
                    rows="4"
                    value={product.description}
                    onChange={(e) =>
                      setProduct({ ...product, description: e.target.value })
                    }
                    placeholder="Mô tả chi tiết sản phẩm..."
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Color Variants Section */}
                <div className="form-group">
                  <div className="flex items-center justify-between mb-3">
                    <label className="form-label mb-0">Màu sắc & Hình ảnh</label>
                    <button
                      type="button"
                      onClick={addColor}
                      className="btn btn-secondary text-sm py-1 px-3"
                    >
                      <Plus size={14} className="mr-1" /> Thêm màu
                    </button>
                  </div>

                  <div className="space-y-4">
                    {colors.map((color, colorIndex) => (
                      <div key={colorIndex} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center gap-2 mb-3">
                          <input
                            type="text"
                            className="form-input flex-1"
                            value={color.name}
                            onChange={(e) => updateColorName(colorIndex, e.target.value)}
                            placeholder="Tên màu (VD: Đen, Trắng, Đỏ)"
                          />
                          {colors.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeColor(colorIndex)}
                              className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>

                        {/* Image Upload Area */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-white">
                          {color.images.length > 0 ? (
                            <div className="grid grid-cols-4 gap-2 mb-3">
                              {color.images.map((img, imgIndex) => (
                                <div key={imgIndex} className="relative group">
                                  <img
                                    src={img}
                                    alt={`${color.name} ${imgIndex + 1}`}
                                    className="w-full h-20 object-cover rounded-lg"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeColorImage(colorIndex, imgIndex)}
                                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-gray-400 mb-3">
                              <ImageIcon size={32} className="mx-auto mb-1" />
                              <p className="text-sm">Chưa có hình ảnh</p>
                            </div>
                          )}
                          <label className="cursor-pointer">
                            <span className="text-sm text-blue-600 hover:text-blue-800">
                              + Thêm hình ảnh
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={(e) => handleColorImageChange(colorIndex, e)}
                            />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={product.isOnSale}
                      onChange={(e) =>
                        setProduct({ ...product, isOnSale: e.target.checked })
                      }
                      className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="font-medium">Sản phẩm đang giảm giá</span>
                  </label>
                </div>

                {product.isOnSale && (
                  <div className="form-group">
                    <label className="form-label">Giá gốc (trước giảm)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={product.originalPrice}
                      onChange={(e) =>
                        setProduct({
                          ...product,
                          originalPrice: e.target.value,
                        })
                      }
                      placeholder="3000000"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card-footer flex justify-end gap-3 border-t p-4">
            <Link to="/admin/products" className="btn btn-secondary">
              Hủy
            </Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={18} />
              {saving ? "Đang lưu..." : "Lưu sản phẩm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
