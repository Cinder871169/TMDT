import React, { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import { Plus, Edit2, Trash2, Tag } from "lucide-react";
import { adminApi } from "../services/adminApi";
import toast from "react-hot-toast";

export default function Vouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);

  const [formData, setFormData] = useState({
    code: "",
    discountType: "percent",
    discountValue: "",
    minOrderValue: "",
    maxDiscount: "",
    usageLimit: "",
    expiryDate: "",
    isActive: true,
  });

  const loadVouchers = async () => {
    try {
      setLoading(true);
      const { data } = await adminApi.getVouchers();
      setVouchers(data);
    } catch (err) {
      console.error("Lỗi tải mã giảm giá:", err);
      toast.error("Không thể tải danh sách mã giảm giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVouchers();
  }, []);

  const handleOpenModal = (voucher = null) => {
    if (voucher) {
      setEditingVoucher(voucher);
      setFormData({
        ...voucher,
        expiryDate: new Date(voucher.expiryDate).toISOString().split("T")[0],
      });
    } else {
      setEditingVoucher(null);
      setFormData({
        code: "",
        discountType: "percent",
        discountValue: "",
        minOrderValue: "",
        maxDiscount: "",
        usageLimit: "",
        expiryDate: "",
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVoucher) {
        await adminApi.updateVoucher(editingVoucher._id, formData);
        toast.success("Cập nhật mã thành công!");
      } else {
        await adminApi.createVoucher(formData);
        toast.success("Tạo mã thành công!");
      }
      setShowModal(false);
      loadVouchers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc chắn muốn xóa mã này?")) return;
    try {
      await adminApi.deleteVoucher(id);
      toast.success("Đã xóa mã giảm giá");
      loadVouchers();
    } catch (err) {
      toast.error("Lỗi khi xóa mã");
    }
  };

  const columns = [
    {
      key: "code",
      label: "Mã",
      render: (val) => <span className="font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase">{val}</span>,
    },
    {
      key: "discount",
      label: "Giảm giá",
      render: (_, item) => (
        <span className="font-semibold">
          {item.discountType === "percent" ? `${item.discountValue}%` : `${item.discountValue.toLocaleString()}đ`}
        </span>
      ),
    },
    {
      key: "minOrderValue",
      label: "Đơn tối thiểu",
      render: (val) => <span>{val?.toLocaleString() || 0}đ</span>,
    },
    {
      key: "usage",
      label: "Đã dùng",
      render: (_, item) => (
        <span>
          {item.usedCount} / {item.usageLimit === 0 ? "∞" : item.usageLimit}
        </span>
      ),
    },
    {
      key: "expiryDate",
      label: "Hạn sử dụng",
      render: (val) => (
        <span className={new Date(val) < new Date() ? "text-red-500 font-semibold" : ""}>
          {new Date(val).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
    {
      key: "isActive",
      label: "Trạng thái",
      render: (val) => (
        <span className={`badge ${val ? "badge-delivered" : "badge-cancelled"}`}>
          {val ? "Kích hoạt" : "Vô hiệu hóa"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (_, item) => (
        <div className="flex gap-2">
          <button onClick={() => handleOpenModal(item)} className="btn btn-secondary btn-sm" title="Sửa">
            <Edit2 size={14} />
          </button>
          <button onClick={() => handleDelete(item._id)} className="btn btn-danger btn-sm" title="Xóa">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Quản lý mã giảm giá"
        actions={
          <button onClick={() => handleOpenModal()} className="btn btn-primary">
            <Plus size={18} /> Thêm mã mới
          </button>
        }
      />

      <div className="card">
        <DataTable
          columns={columns}
          data={vouchers}
          loading={loading}
          emptyTitle="Chưa có mã giảm giá nào"
          emptyText="Bấm 'Thêm mã mới' để tạo mã giảm giá đầu tiên."
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Tag className="text-orange-500" />
                {editingVoucher ? "Cập nhật mã giảm giá" : "Thêm mã giảm giá mới"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black">
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <form id="voucherForm" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Mã giảm giá (Code)</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="form-input uppercase"
                    placeholder="VD: SUMMER2024"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Loại giảm giá</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                      className="form-input"
                    >
                      <option value="percent">Phần trăm (%)</option>
                      <option value="fixed">Số tiền trực tiếp (đ)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Giá trị giảm</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max={formData.discountType === "percent" ? "90" : undefined}
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      className="form-input"
                      placeholder={formData.discountType === "percent" ? "Ví dụ: 10 (tối đa 90)" : "Ví dụ: 50000"}
                    />
                  </div>
                </div>

                {formData.discountType === "percent" && (
                  <div>
                    <label className="block text-sm font-semibold mb-1">Giảm tối đa (đ) (Tùy chọn)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                      className="form-input"
                      placeholder="Nhập 0 nếu không giới hạn"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold mb-1">Đơn hàng tối thiểu (đ)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                    className="form-input"
                    placeholder="Ví dụ: 200000"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Lượt sử dụng tối đa</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                      className="form-input"
                      placeholder="0 = Không giới hạn"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Ngày hết hạn</label>
                    <input
                      type="date"
                      required
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-semibold">
                    Cho phép sử dụng mã này
                  </label>
                </div>
              </form>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                Hủy
              </button>
              <button type="submit" form="voucherForm" className="btn btn-primary">
                {editingVoucher ? "Cập nhật" : "Tạo mã mới"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
