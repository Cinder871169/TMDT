import React, { useState, useEffect } from "react";
import { adminApi } from "../services/adminApi";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import { ConfirmDialog } from "../components/Modal";
import toast from "react-hot-toast";
import { Users as UsersIcon, Shield, User, Trash2, Search } from "lucide-react";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmRole, setConfirmRole] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data } = await adminApi.getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Lỗi tải người dùng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleToggle = async () => {
    if (!confirmRole) return;
    
    try {
      await adminApi.updateUserRole(confirmRole.id, !confirmRole.currentIsAdmin);
      toast.success("Cập nhật quyền thành công!");
      setConfirmRole(null);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật quyền");
    }
  };

  const handleDeleteUser = async () => {
    if (!confirmDelete) return;
    
    try {
      await adminApi.deleteUser(confirmDelete);
      toast.success("Xóa người dùng thành công!");
      setConfirmDelete(null);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi xóa người dùng");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      roleFilter === "all" ||
      (roleFilter === "admin" && user.isAdmin) ||
      (roleFilter === "user" && !user.isAdmin);
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.isAdmin).length,
    regular: users.filter((u) => !u.isAdmin).length,
  };

  const columns = [
    {
      key: "profile",
      label: "Người dùng",
      render: (_, item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center font-bold text-white">
            {item.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <div className="font-semibold">{item.name}</div>
            {item.phone && (
              <div className="text-muted text-xs">{item.phone}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
    },
    {
      key: "address",
      label: "Địa chỉ",
      render: (val) => (
        <span className="text-sm text-muted">{val || "Chưa cập nhật"}</span>
      ),
    },
    {
      key: "createdAt",
      label: "Ngày đăng ký",
      sortable: true,
      render: (val) => (
        <span className="text-sm">
          {new Date(val).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
    {
      key: "isAdmin",
      label: "Vai trò",
      render: (val) => (
        <span className={`badge ${val ? "badge-admin" : "badge-user"}`}>
          {val ? "Admin" : "User"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Hành động",
      render: (_, item) => (
        <div className="flex gap-2">
          <button
            onClick={() =>
              setConfirmRole({
                id: item._id,
                currentIsAdmin: item.isAdmin,
                name: item.name,
              })
            }
            className={`btn btn-sm ${item.isAdmin ? "btn-secondary" : "btn-success"}`}
            title={item.isAdmin ? "Hủy quyền admin" : "Cấp quyền admin"}
          >
            <Shield size={14} />
          </button>
          <button
            onClick={() => setConfirmDelete({ id: item._id, name: item.name })}
            className="btn btn-danger btn-sm"
            title="Xóa người dùng"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Quản lý người dùng"
        subtitle={`Tổng cộng ${filteredUsers.length} người dùng`}
      />

      {/* Stats */}
      <div className="stats-grid mb-6">
        <div
          className="stat-card cursor-pointer"
          onClick={() => setRoleFilter("all")}
        >
          <div className="stat-icon blue">
            <UsersIcon size={24} />
          </div>
          <div>
            <p className="stat-label">Tổng người dùng</p>
            <p className="stat-value">{stats.total}</p>
          </div>
        </div>
        <div
          className="stat-card cursor-pointer"
          onClick={() => setRoleFilter("admin")}
        >
          <div className="stat-icon purple">
            <Shield size={24} />
          </div>
          <div>
            <p className="stat-label">Quản trị viên</p>
            <p className="stat-value">{stats.admins}</p>
          </div>
        </div>
        <div
          className="stat-card cursor-pointer"
          onClick={() => setRoleFilter("user")}
        >
          <div className="stat-icon green">
            <User size={24} />
          </div>
          <div>
            <p className="stat-label">Người dùng</p>
            <p className="stat-value">{stats.regular}</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
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
              placeholder="Tìm kiếm người dùng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="form-input w-auto"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        loading={loading}
        emptyTitle="Không có người dùng nào"
        emptyText={
          searchTerm || roleFilter !== "all"
            ? "Không tìm thấy người dùng phù hợp"
            : "Chưa có người dùng nào đăng ký"
        }
        pageSize={10}
      />

      {/* Confirm Role Change Dialog */}
      <ConfirmDialog
        isOpen={!!confirmRole}
        onClose={() => setConfirmRole(null)}
        onConfirm={handleRoleToggle}
        title={
          confirmRole?.currentIsAdmin ? "Hủy quyền Admin" : "Cấp quyền Admin"
        }
        message={
          confirmRole?.currentIsAdmin
            ? `Bạn có chắc muốn hủy quyền admin của "${confirmRole?.name}"?`
            : `Bạn có chắc muốn cấp quyền admin cho "${confirmRole?.name}"?`
        }
        confirmText={confirmRole?.currentIsAdmin ? "Hủy quyền" : "Cấp quyền"}
        type={confirmRole?.currentIsAdmin ? "warning" : "info"}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeleteUser}
        title="Xóa người dùng"
        message={`Bạn có chắc muốn xóa người dùng "${confirmDelete?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        type="danger"
      />
    </div>
  );
}
