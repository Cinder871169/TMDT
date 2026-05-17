# SneakerZone Admin Dashboard - Structure Guide

## 📁 New Folder Structure

```
client-admin/src/
├── components/           # Reusable UI components
│   ├── AdminLayout.jsx     # Main layout with sidebar & topbar
│   ├── DataTable.jsx       # Reusable table with sorting & pagination
│   ├── Modal.jsx           # Modal dialog & ConfirmDialog
│   ├── PageHeader.jsx      # Page header with title & actions
│   └── StatCard.jsx        # Statistics card component
├── pages/              # Page components
│   ├── Dashboard.jsx       # Dashboard overview
│   ├── Products.jsx        # Product management
│   ├── ProductForm.jsx     # Add/Edit product
│   ├── Orders.jsx          # Order management
│   ├── OrderDetail.jsx     # Order details
│   ├── Users.jsx           # User management
│   ├── News.jsx            # News management
│   ├── NewsForm.jsx        # Add/Edit news
│   └── Login.jsx           # Admin login
├── services/           # API services
│   └── adminApi.js         # All admin API calls
├── store/              # State management
│   └── useAdminStore.jsx  # Admin auth & state
├── App.jsx             # Main app with routes
├── main.jsx            # Entry point
└── index.css           # Global styles
```

## 🎨 Key Features

### 1. AdminLayout Component
- **Collapsible sidebar** with smooth animations
- **Topbar** with search, notifications, date
- **Breadcrumb** navigation
- **Responsive** design (mobile-friendly)
- **Admin profile** in sidebar footer

### 2. DataTable Component
- **Sorting** by clicking column headers
- **Pagination** with page numbers
- **Empty state** handling
- **Loading state** with spinner
- **Custom column rendering**

### 3. Modal & ConfirmDialog
- **Modal** with header, body, footer
- **ConfirmDialog** for destructive actions
- **Backdrop blur** effect
- **Smooth animations**

### 4. StatCard Component
- **Color variants** (blue, orange, green, purple, red)
- **Trend indicators** (up/down)
- **Icon support**
- **Hover effects**

### 5. PageHeader Component
- **Title & subtitle**
- **Breadcrumbs**
- **Action buttons**

## 🔌 API Service Structure

```javascript
adminApi = {
  // Dashboard
  getDashboardStats()

  // Products (CRUD)
  getProducts(params)
  getProduct(id)
  createProduct(data)
  updateProduct(id, data)
  deleteProduct(id)

  // Orders
  getOrders(params)
  getOrder(id)
  updateOrderStatus(id, status)
  deleteOrder(id)

  // Users
  getUsers(params)
  getUser(id)
  updateUserRole(id, isAdmin)
  deleteUser(id)

  // News (CRUD)
  getNews(params)
  getNewsItem(id)
  createNews(data)
  updateNews(id, data)
  deleteNews(id)
}
```

## 🎯 How to Use Components

### DataTable Example
```jsx
const columns = [
  { key: "name", label: "Name", sortable: true },
  { key: "status", label: "Status", render: (val) => <Badge>{val}</Badge> },
  { key: "actions", label: "", render: (_, item) => <EditButton id={item.id} /> }
];

<DataTable
  columns={columns}
  data={products}
  loading={loading}
  pageSize={10}
/>
```

### PageHeader Example
```jsx
<PageHeader
  title="Quản lý sản phẩm"
  subtitle="Tổng cộng 50 sản phẩm"
  actions={<Button>Thêm mới</Button>}
/>
```

### Modal Example
```jsx
<Modal isOpen={isOpen} onClose={onClose} title="Xác nhận">
  <p>Nội dung modal</p>
</Modal>

<ConfirmDialog
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={handleConfirm}
  title="Xóa?"
  message="Bạn có chắc?"
  type="danger"
/>
```

## 🚀 Running the Project

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Client (user-facing)
cd client
npm run dev

# Terminal 3 - Admin Dashboard
cd client-admin
npm run dev
```

- **Client**: http://localhost:5173
- **Admin**: http://localhost:5174

## 🔐 Authentication Flow

1. User logs in at `localhost:5173/login`
2. If `isAdmin === true`, redirect to `localhost:5174` with user data
3. Admin app reads user data and stores in localStorage
4. All admin API calls include JWT token
5. Token validation on every request

## 📱 Responsive Breakpoints

- **Desktop**: Full sidebar visible
- **Tablet**: Collapsed sidebar (icons only)
- **Mobile**: Hidden sidebar with hamburger menu
