import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import useAdminStore from "./store/useAdminStore.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Products from "./pages/Products.jsx";
import ProductForm from "./pages/ProductForm.jsx";
import Orders from "./pages/Orders.jsx";
import OrderDetail from "./pages/OrderDetail.jsx";
import Users from "./pages/Users.jsx";
import News from "./pages/News.jsx";
import NewsForm from "./pages/NewsForm.jsx";
import Vouchers from "./pages/Vouchers.jsx";
import AdminLayout from "./components/AdminLayout.jsx";

// Guard cho các trang admin - yêu cầu đã đăng nhập
function AdminGuard({ children }) {
  const { isAuthenticated, isLoading } = useAdminStore();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Guard cho trang login - nếu đã đăng nhập thì redirect sang dashboard
function LoginGuard() {
  const { isAuthenticated, isLoading } = useAdminStore();

  if (isLoading) return null;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Login />;
}

function App() {
  return (
    <div className="admin-app">
      <Routes>
        {/* Trang login - tự động chuyển sang dashboard nếu đã đăng nhập */}
        <Route path="/login" element={<LoginGuard />} />

        {/* Protected admin routes */}
        <Route
          path="/dashboard"
          element={
            <AdminGuard>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </AdminGuard>
          }
        />

        {/* Products */}
        <Route
          path="/products"
          element={
            <AdminGuard>
              <AdminLayout>
                <Products />
              </AdminLayout>
            </AdminGuard>
          }
        />
        <Route
          path="/products/create"
          element={
            <AdminGuard>
              <AdminLayout>
                <ProductForm />
              </AdminLayout>
            </AdminGuard>
          }
        />
        <Route
          path="/products/:id/edit"
          element={
            <AdminGuard>
              <AdminLayout>
                <ProductForm />
              </AdminLayout>
            </AdminGuard>
          }
        />

        {/* Orders */}
        <Route
          path="/orders"
          element={
            <AdminGuard>
              <AdminLayout>
                <Orders />
              </AdminLayout>
            </AdminGuard>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <AdminGuard>
              <AdminLayout>
                <OrderDetail />
              </AdminLayout>
            </AdminGuard>
          }
        />

        {/* Users */}
        <Route
          path="/users"
          element={
            <AdminGuard>
              <AdminLayout>
                <Users />
              </AdminLayout>
            </AdminGuard>
          }
        />

        {/* News */}
        <Route
          path="/news"
          element={
            <AdminGuard>
              <AdminLayout>
                <News />
              </AdminLayout>
            </AdminGuard>
          }
        />
        <Route
          path="/news/create"
          element={
            <AdminGuard>
              <AdminLayout>
                <NewsForm />
              </AdminLayout>
            </AdminGuard>
          }
        />
        <Route
          path="/news/:id/edit"
          element={
            <AdminGuard>
              <AdminLayout>
                <NewsForm />
              </AdminLayout>
            </AdminGuard>
          }
        />

        {/* Vouchers */}
        <Route
          path="/vouchers"
          element={
            <AdminGuard>
              <AdminLayout>
                <Vouchers />
              </AdminLayout>
            </AdminGuard>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default App;
