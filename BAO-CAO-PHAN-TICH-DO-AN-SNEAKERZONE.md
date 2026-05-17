# BÁO CÁO PHÂN TÍCH ĐỒ ÁN - SNEAKERZONE

## PHẦN 1 — TÓM TẮT PROJECT

### 1. Project này làm gì?
**SneakerZone** là website thương mại điện tử bán giày sneaker, gồm 2 phần:
- **Client** (port 5173): Website bán hàng cho khách hàng
- **Admin** (port 5174): Trang quản trị cho admin

### 2. Mục tiêu chính của hệ thống
- Bán giày online với trải nghiệm người dùng mượt mà
- Quản lý sản phẩm, đơn hàng, người dùng
- Thanh toán qua VietQR (QR code ngân hàng)
- Hệ thống đánh giá sản phẩm

### 3. Bài toán thực tế đang giải quyết
- E-commerce giày với nhiều biến thể (size, màu sắc)
- Thanh toán offline qua chuyển khoản ngân hàng
- Quản lý tồn kho theo từng sản phẩm

### 4. Người dùng của hệ thống
- **Khách hàng**: Xem sản phẩm, mua hàng, đánh giá
- **Admin**: Quản lý đơn hàng, sản phẩm, người dùng

### 5. Công nghệ sử dụng

| Layer | Công nghệ |
|-------|-----------|
| **Frontend Client** | React 19, Vite, Tailwind CSS 4, Zustand |
| **Frontend Admin** | React, Vite, Tailwind CSS, Recharts |
| **Backend** | Express.js, Node.js |
| **Database** | MongoDB (Mongoose) |
| **Authentication** | JWT + OTP Email |
| **Image Storage** | Cloudinary |
| **Payment** | VietQR API |
| **Email** | Nodemailer |

### 6. Kiến trúc tổng thể hệ thống

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Server    │────▶│   MongoDB   │
│  (5173)    │     │  (5000)     │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
┌─────────────┐            │
│ Admin (5174)│────────────┘
└─────────────┘
```

### 7. Luồng hoạt động tổng quát
1. User đăng nhập → JWT token
2. Xem sản phẩm → API /api/products
3. Thêm vào giỏ → Zustand store + localStorage
4. Checkout → Tạo order + trừ tồn kho
5. Thanh toán VietQR → User chuyển khoản
6. Admin xác nhận đơn hàng

---

## PHẦN 2 — GIẢI THÍCH SOURCE CODE

### SERVER SIDE

#### File: server/server.js
- **Chức năng**: Điểm khởi đầu của ứng dụng
- **Logic chính**:
  - Khởi tạo Express app
  - Cấu hình CORS cho 2 port (5173, 5174)
  - Mount các router
  - Kết nối MongoDB
  - Tạo ServerState (instanceId để invalidate tokens sau restart)

#### File: server/models/Product.js
- **Schema**:
  - name, brand, description, price
  - sizes[]: Array các size giày
  - colors[]: Array các biến thể màu với ảnh
  - countInStock: Số lượng tồn kho
  - isOnSale, originalPrice: Cho sản phẩm giảm giá
- **Điểm hay**: Lưu trữ variant theo embedded array, không cần collection riêng

#### File: server/models/Order.js
- **Schema**:
  - user (ref User)
  - orderItems[]: [{name, size, color, quantity, price, product}]
  - totalPrice, shippingFee, status
  - paymentMethod: ["vietqr", "banking"]
  - paymentStatus: ["Chưa thanh toán", "Đã thanh toán", "Đã hoàn tiền"]
  - paymentInfo: Thông tin ngân hàng
- **Logic quan trọng**:
  - Khi tạo đơn → TRỪ tồn kho ngay
  - Khi hủy → HOÀN tồn kho

#### File: server/models/User.js
- **Schema**:
  - name, email, password (bcrypt hashed)
  - isAdmin: boolean cho phân quyền
  - otp, otpExpires: cho xác thực OTP
  - resetPasswordToken, resetPasswordExpires: cho quên mk
- **Pre-save hook**: Tự động hash password trước khi lưu (10 salt rounds)

#### File: server/models/Review.js
- **Schema**:
  - user (ref), product (ref)
  - rating (1-5), comment
  - timestamps
- **Constraint**: Mỗi user chỉ đánh giá 1 lần/sản phẩm

#### File: server/middleware/authMiddleware.js
```javascript
protect: Verify JWT token
- Kiểm tra instanceId để invalidate token sau server restart
- Lấy user từ DB (không dùng token payload)

admin: Check isAdmin flag
```

#### File: server/routes/orderRoutes.js - LOGIC PHỨC TẠP NHẤT
```javascript
createOrder() - Hàm xử lý chính:
1. Validate data
2. Lấy products từ DB
3. Check tồn kho cho TỪNG sản phẩm
4. Nếu đủ → TRỪ tồn kho (bulkWrite)
5. Tính phí ship: >2M = miễn phí
6. Tạo order
7. Generate VietQR URL
```

### CLIENT SIDE

#### File: client/src/App.jsx
```javascript
- Home: Trang chủ với Hero, Categories, Trending, Products
- Cart Drawer: Slide-in cart panel
- Routes: /, /products, /product/:id, /checkout, /orders, etc.
```

#### File: client/src/store/useCartStore.js - Zustand Store
```javascript
- cart: array of items [{_id, name, size, color, quantity, price}]
- storageKey: "cart_guest" hoặc "cart_{userId}"
- hydrateCart(): Merge cart khi user đăng nhập
- addToCart(), decreaseQuantity(), removeFromCart()
- Lưu vào localStorage
```

**Luồng Cart**:
- User chưa login → Lưu vào cart_guest
- User đăng nhập → Merge cart_guest vào cart_{userId}
- User logout → Giữ nguyên cart_{userId}

#### File: client/src/pages/Checkout.jsx
```javascript
Step 1: Nhập địa chỉ giao hàng
Step 2: Thanh toán VietQR / Banking
  - Tạo order → Backend trừ tồn kho
  - Generate QR code
  - User "Tôi đã thanh toán" → PUT /api/orders/:id/pay
```

#### File: client/src/pages/ProductDetail.jsx
```javascript
- Fetch product details
- Select color → Hiển thị ảnh variant
- Select size
- Add to cart (check tồn kho)
- Review section: RatingSummary + ReviewForm + ReviewList
```

### ADMIN SIDE

#### File: client-admin/src/App.jsx
```javascript
- Protected routes với AdminGuard
- LoginGuard: redirect nếu đã login
- Routes: /dashboard, /products, /orders, /users, /news
```

#### File: client-admin/src/components/AdminLayout.jsx
```javascript
- Sidebar navigation
- Topbar với search, notifications
- Breadcrumb
- Responsive (mobile menu)
```

#### File: client-admin/src/pages/Dashboard.jsx
```javascript
- StatCards: Tổng doanh thu, đơn hàng, sản phẩm, users
- RevenueChart: Biểu đồ doanh thu theo thời gian (Recharts)
- OrderStatus: Pie chart phân bố trạng thái đơn
- RecentOrders: Table 5 đơn mới nhất
```

---

## PHẦN 3 — DATABASE

### ERD (Sơ đồ quan hệ)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    User      │────▶│    Order     │────▶│   Product    │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ _id          │     │ _id          │     │ _id          │
│ name         │     │ user (ref)   │     │ name         │
│ email*       │     │ orderItems[] │     │ brand        │
│ password     │     │ totalPrice   │     │ price        │
│ isAdmin      │     │ status       │     │ sizes[]      │
│ isVerified   │     │ paymentStatus│     │ colors[]     │
└──────────────┘     └──────────────┘     │ countInStock │
      │                    │              └──────────────┘
      │                    │                    │
      │                    │                    ▼
      │                    │              ┌──────────────┐
      ▼                    ▼              │   Review     │
┌──────────────┐     ┌──────────────┐     ├──────────────┤
│  Wishlist    │     │   Contact    │     │ user (ref)   │
├──────────────┤     ├──────────────┤     │ product (ref)│
│ user (ref)   │     │ name         │     │ rating       │
│ products[]   │     │ email        │     │ comment      │
└──────────────┘     │ message      │     └──────────────┘
                     └──────────────┘

┌──────────────┐     ┌──────────────┐
│    News      │     │ Newsletter   │
├──────────────┤     ├──────────────┤
│ _id          │     │ email*       │
│ title        │     │ createdAt    │
│ content      │     └──────────────┘
│ image        │
│ published    │
└──────────────┘
```

### Primary Key / Foreign Key

| Bảng | Primary Key | Foreign Key |
|------|-------------|------------|
| User | _id | - |
| Product | _id | - |
| Order | _id | user (ref User) |
| Review | _id | user (ref User), product (ref Product) |
| Wishlist | _id | user (ref User), products[] (ref Product) |
| News | _id | - |
| Contact | _id | - |
| Newsletter | _id | - |

### Ý nghĩa từng bảng

| Bảng | Ý nghĩa |
|------|----------|
| User | Tài khoản người dùng, có isAdmin để phân quyền |
| Product | Sản phẩm với các biến thể size, màu sắc |
| Order | Đơn hàng, lưu snapshot để không phụ thuộc product thay đổi |
| Review | Đánh giá sản phẩm của user |
| Wishlist | Sản phẩm yêu thích của user |
| News | Tin tức, blog của cửa hàng |
| Contact | Liên hệ từ khách hàng |
| Newsletter | Email đăng ký nhận tin |

### Điểm mạnh thiết kế

1. **Embedded Array** cho colors/images: Giảm số query
2. **Ref Database** cho User-Order: Đảm bảo referential integrity
3. **Timestamps** tự động cho mọi model
4. **Index unique** cho wishlist (user: 1)
5. **Snapshot pattern** trong Order items: Không bị ảnh hưởng khi product thay đổi

### Điểm yếu

1. **Không có index** cho trường thường query (brand, status, createdAt)
2. **Product.reviews** không có ref → Phải query riêng
3. **Order items** lưu snapshot (name, price) → Không cập nhật khi product thay đổi

### Câu hỏi phản biện về Database

**Q: Tại sao lưu orderItems là embedded array thay vì ref?**
A: Snapshot để đơn hàng không bị ảnh hưởng khi sản phẩm thay đổi giá/tên. Nếu dùng ref, khi product thay đổi thì đơn hàng cũ cũng thay đổi.

**Q: Cần thêm index gì để tối ưu?**
A:
```javascript
Product.createIndex({ brand: 1 })
Product.createIndex({ price: 1 })
Order.createIndex({ status: 1 })
Order.createIndex({ createdAt: -1 })
Review.createIndex({ product: 1, rating: 1 })
```

---

## PHẦN 4 — LUỒNG CHẠY THỰC TẾ

### Flow 1: Mua hàng

```
1. User vào trang chủ (/)
   └─▶ useEffect fetch /api/products → Hiển thị ProductCard

2. Click sản phẩm (/product/:id)
   └─▶ Fetch /api/products/:id
   └─▶ Chọn Color → Hiển thị ảnh variant
   └─▶ Chọn Size

3. Click "Thêm vào giỏ hàng"
   └─▶ useCartStore.addToCart()
   └─▶ Lưu vào localStorage
   └─▶ Toast "Đã thêm"

4. Mở Cart Drawer
   └─▶ State isCartOpen = true
   └─▶ Side panel slide-in từ phải

5. Click "Thanh Toán Ngay"
   └─▶ Nếu chưa login → Navigate /login
   └─▶ Nếu đã login → Navigate /checkout

6. Checkout Step 1: Nhập địa chỉ
   └─▶ Validate form
   └─▶ Click "Tiếp tục thanh toán"

7. Backend xử lý:
   └─▶ POST /api/orders
   └─▶ Verify JWT token
   └─▶ Validate stock (từng sản phẩm)
   └─▶ Product.bulkWrite: $inc countInStock -= quantity
   └─▶ Order.create()
   └─▶ Generate VietQR URL
   └─▶ Return order + qrCodeUrl

8. Checkout Step 2: Thanh toán
   └─▶ Hiển thị QR Code
   └─▶ User quét và chuyển khoản (thực tế)
   └─▶ Click "Tôi đã thanh toán"

9. Xác nhận thanh toán:
   └─▶ PUT /api/orders/:id/pay
   └─▶ Update paymentStatus = "Đã thanh toán"
   └─▶ Update status = "Đã xác nhận"
   └─▶ clearCart() → Xóa localStorage
   └─▶ Navigate /order-success
```

### Flow 2: Admin Dashboard

```
1. Login Admin (/admin/login)
   └─▶ POST /api/users/login
   └─▶ Return JWT + isAdmin: true
   └─▶ Redirect /admin/?user={encoded}

2. Dashboard (/admin/dashboard)
   └─▶ useDashboard() hook fetch:
       - GET /api/admin/orders/stats/overview
       - GET /api/admin/products/stats/overview
       - GET /api/admin/users/stats/overview
       - GET /api/admin/orders (5 orders gần nhất)
   
3. Quản lý đơn hàng:
   └─▶ View orders list
   └─▶ Click order → View detail
   └─▶ Update status: "Chờ xử lý" → "Đã xác nhận" → "Đang giao" → "Đã giao"
   └─▶ Cancel order → Hoàn tiền stock
```

---

## PHẦN 5 — CÂU HỎI PHẢN BIỆN

### 30 Câu hỏi cơ bản

**1. Tại sao dùng JWT thay vì Session?**
- JWT stateless, không cần server lưu session
- Scale tốt hơn
- Có thể lưu trong localStorage
- Dễ implement cho multiple clients

**2. Tại sao trừ tồn kho NGAY khi tạo đơn?**
- Đảm bảo không bán quá số lượng có
- Nếu không, 2 user cùng mua 1 sản phẩm cuối sẽ không có hàng

**3. Điều gì xảy ra nếu user hủy đơn?**
- Backend cập nhật status="Đã hủy"
- Hoàn tồn kho bằng `$inc: {countInStock: quantity}`

**4. Tại sao dùng Zustand thay vì Redux?**
- Zustand nhẹ hơn
- API đơn giản hơn
- Boilerplate ít hơn
- Có persist middleware sẵn

**5. localStorage vs sessionStorage?**
- localStorage: Tồn tại vĩnh viễn
- sessionStorage: Mất khi đóng tab
- Cart cần localStorage để user quay lại vẫn thấy sản phẩm

**6. VietQR hoạt động thế nào?**
- Gọi API VietQR với params: bankId, accountNumber, amount, addInfo
- Trả về URL ảnh QR để hiển thị

**7. Tại sao split frontend và admin?**
- Bảo mật: Admin có endpoint riêng (/api/admin/*)
- Performance: Load nhẹ hơn, code riêng
- Scale: Có thể deploy độc lập

**8. JWT token lưu ở đâu? Tại sao?**
- localStorage
- Không dùng cookie vì để tránh CSRF
- Dễ quản lý hơn với React

**9. bcrypt hash password mấy round?**
- 10 round (salt)
- Đủ bảo mật mà không quá chậm

**10. Mongoose vs MongoDB Driver?**
- Mongoose cung cấp schema validation
- Middleware hooks
- Relationship handling
- Phù hợp với dự án có cấu trúc rõ ràng

**11. CORS là gì? Tại sao cần?**
- Cross-Origin Resource Sharing
- Cho phép frontend (port khác) gọi API backend
- Bảo mật mặc định của browser

**12. Schema validation trong Mongoose?**
- Đảm bảo dữ liệu đúng format trước khi lưu
- Giảm lỗi runtime
- Ví dụ: required, min, max, enum

**13. Pre-save hook là gì?**
- Tự động chạy trước khi lưu document
- Dùng để hash password, transform data

**14. Virtual property trong Mongoose?**
- Trường được tính toán, không lưu vào DB
- Ví dụ: fullName từ firstName + lastName

**15. Population trong Mongoose?**
- Điền thông tin từ document referenced
- Dùng .populate('field')

### 20 Câu hỏi nâng cao

**16. Race condition khi 2 user cùng mua?**
- Code check tồn kho trong transaction
- Với MongoDB single document atomic, cần dùng `findOneAndUpdate` với filter `countInStock: {$gte: quantity}` để atomic hơn

**17. Nếu server restart, token có còn valid?**
- Có! Vì dùng JWT verify thông thường
- Code có thêm instanceId check để buộc re-login sau restart

**18. Tại sao dùng Cloudinary thay vì lưu local?**
- CDN toàn cầu, load nhanh
- Tự động optimize, resize
- Miễn phí tier đủ cho dev

**19. Index nào cần thêm cho performance?**
```javascript
Product.createIndex({ brand: 1 })
Product.createIndex({ price: 1 })
Order.createIndex({ status: 1 })
Order.createIndex({ createdAt: -1 })
Review.createIndex({ product: 1, rating: 1 })
```

**20. Làm sao tránh duplicate review?**
- Frontend: Check existed review trước khi submit
- Backend: Query check trong route

**21. Middleware trong Express là gì?**
- Hàm chạy trước route handler
- Dùng cho auth, logging, error handling, validation

**22. Auth middleware hoạt động thế nào?**
- Lấy token từ header
- Verify token bằng JWT_SECRET
- Attach user vào req.user
- Gọi next() để tiếp tục

**23. State management nào phù hợp cho dự án này?**
- Zustand: Đơn giản, nhẹ, có persist
- Redux: Quá phức tạp cho dự án này

**24. Tại sao dùng React Router?**
- Single Page Application (SPA)
- Không reload trang khi chuyển route
- URL đẹp, share được link

**25. Tailwind CSS khác gì CSS thuần?**
- Utility-first CSS
- Không cần viết file CSS riêng
- Faster development
- Consistent design

### 10 Câu hỏi cực khó

**26. Nếu 1 triệu user thì sao?**
- Scale horizontal: Thêm replica set cho MongoDB
- Cache: Redis cho frequently accessed data
- CDN: Cloudflare/CloudFront
- Database sharding nếu cần

**27. Transaction trong MongoDB?**
- Dùng `mongoose.startSession()` và `withTransaction()`
- Code hiện tại dùng `bulkWrite` đã atomic cho stock updates

**28. Security concerns?**
- Input validation: Thiếu server-side validation kỹ
- Rate limiting: Không có
- XSS: React tự escape
- SQL Injection: Không áp dụng (NoSQL)

**29. Điểm yếu lớn nhất của hệ thống?**
- Thanh toán manual (user tự xác nhận đã chuyển tiền) → Có thể gian lận
- Không có webhook từ ngân hàng
- Không real-time notification

**30. Scale strategy?**
- Horizontal scaling: Thêm server Node.js phía sau load balancer
- Database: MongoDB replica set → Sharding nếu cần
- Caching: Redis cho session, cart
- CDN: Cloudinary (images)

---

## PHẦN 6 — SCRIPT THUYẾT TRÌNH

### 1. Mở đầu (30 giây)
"Em xin chào thầy/cô. Hôm nay em xin trình bày đồ án **SneakerZone** - một website thương mại điện tử bán giày sneaker. Đồ án gồm 2 phần: website bán hàng cho khách và trang quản trị cho admin."

### 2. Giới thiệu công nghệ (1 phút)
"Về công nghệ, em sử dụng:
- **Frontend**: React 19 với Vite, Tailwind CSS 4 cho styling, Zustand cho state management
- **Backend**: Node.js với Express.js
- **Database**: MongoDB với Mongoose ODM
- **Authentication**: JWT kết hợp OTP qua email
- **Payment**: VietQR API để tạo mã thanh toán
- **Images**: Cloudinary để lưu trữ và tối ưu ảnh

Em chọn MERN stack vì đây là stack phổ biến, cộng đồng lớn, dễ tìm tài liệu và có hiệu suất tốt cho ứng dụng real-time."

### 3. Demo Flow (2 phút)
"Em xin demo luồng mua hàng:
1. User vào trang chủ, xem sản phẩm
2. Chọn màu, chọn size, thêm vào giỏ
3. Điền thông tin thanh toán
4. Hệ thống tạo đơn, sinh mã QR
5. User quét QR để thanh toán
6. Admin vào dashboard xác nhận đơn"

### 4. Điểm nổi bật
"Điểm nổi bật của đồ án:
- Hệ thống đa biến thể sản phẩm (màu sắc, kích cỡ)
- Quản lý tồn kho real-time
- 2 phương thức thanh toán: VietQR và banking
- Authentication đa lớp: Password + OTP
- Dashboard với biểu đồ thống kê"

### 5. Kết luận
"Trong tương lai, em có thể phát triển thêm:
- Tích hợp thanh toán online qua payment gateway
- Push notification cho đơn hàng
- Mobile app

Em xin cảm ơn thầy/cô đã lắng nghe."

---

## PHẦN 7 — NHỮNG THỨ PHẢI NHỚ GẤP

### 20 Ý quan trọng nhất

1. **Luồng mua hàng**: Xem → Chọn variant → Add cart → Checkout → Tạo order (trừ stock) → Thanh toán VietQR
2. **JWT Token**: Lưu localStorage, expire 30 ngày, instanceId check
3. **Tồn kho**: Trừ NGAY khi tạo đơn, hoàn khi hủy
4. **Zustand Store**: useCartStore với hydrateCart() merge guest cart vào user cart
5. **VietQR**: Gọi API VietQR với bankId, accountNumber, amount, addInfo
6. **OTP**: Lưu trong User.otp, expire 5 phút
7. **bcrypt**: Salt 10 round, auto hash trong pre-save hook
8. **Ref vs Embedded**: Order items là embedded snapshot, Wishlist là ref array
9. **Admin routes**: Tất cả prefix `/api/admin/*`, require `isAdmin: true`
10. **Product Schema**: name, brand, price, sizes[], colors[{name, images[]}]
11. **Order Schema**: user ref, orderItems[], totalPrice, status, paymentStatus
12. **Review**: Mỗi user 1 review/sản phẩm
13. **Shipping fee**: >2M = miễn phí, ≤2M = 30K
14. **Cart key**: `cart_guest` khi chưa login, `cart_{userId}` khi đã login
15. **Cloudinary**: Lưu ảnh, folder `sneakerzone_products`
16. **React Router**: Client ở `/`, Admin ở `/dashboard`, `/products`, etc.
17. **Recharts**: Dùng cho RevenueChart và OrderStatus pie chart
18. **API Response**: Luôn return `{message, data}` hoặc `{message, error}`
19. **CORS**: Cho phép localhost:5173 (client) và localhost:5174 (admin)
20. **Timestamps**: Mongoose tự tạo createdAt, updatedAt

### Những file quan trọng nhất

| File | Lý do |
|------|-------|
| server/routes/orderRoutes.js | Logic phức tạp nhất, xử lý tồn kho |
| client/src/store/useCartStore.js | Quản lý cart với merge logic |
| server/middleware/authMiddleware.js | Authentication & Authorization |
| client/src/pages/Checkout.jsx | Flow thanh toán |

### Những API quan trọng nhất

| API | Mục đích |
|-----|----------|
| POST /api/orders | Tạo đơn hàng |
| PUT /api/orders/:id/pay | Xác nhận thanh toán |
| GET /api/products | Danh sách sản phẩm |
| POST /api/users/login | Đăng nhập |
| POST /api/users/auth/verify-otp | Verify OTP |

### Những bảng DB quan trọng nhất

| Bảng | Vai trò |
|------|---------|
| Order | Quản lý tất cả đơn hàng, trạng thái |
| Product | Sản phẩm + tồn kho |
| User | Tài khoản + quyền |

---

## PHẦN 8 — ĐÁNH GIÁ ĐỒ ÁN

### Điểm mạnh

| Tiêu chí | Đánh giá |
|----------|----------|
| **Chức năng đầy đủ** | ⭐⭐⭐⭐⭐ Có đủ: auth, cart, checkout, admin, review |
| **UI/UX đẹp** | ⭐⭐⭐⭐⭐ Tailwind CSS với design hiện đại |
| **Code structure** | ⭐⭐⭐⭐ Gọn gàng, phân chia rõ ràng |
| **Authentication** | ⭐⭐⭐⭐ Có OTP, JWT, bcrypt |
| **Payment flow** | ⭐⭐⭐⭐ VietQR tích hợp tốt |
| **Architecture** | ⭐⭐⭐⭐ Tách client/admin rõ ràng |

### Điểm yếu

| Tiêu chí | Đánh giá |
|----------|----------|
| **Security** | ⚠️ Không có rate limiting, input validation hạn chế |
| **Real payment** | ⚠️ Thanh toán manual, không có webhook |
| **Performance** | ⚠️ Thiếu index cho các trường query thường xuyên |
| **Error handling** | ⚠️ Chưa toàn diện |
| **Testing** | ⚠️ Không có unit test |
| **Scalability** | ⚠️ Chưa có cache, CDN cho static assets |

### Mức độ khó
- **Trung bình-cao**: Đòi hỏi hiểu biết về React, Node.js, MongoDB, Authentication

### Tính thực tế
- **Cao**: Các chức năng đều có thể áp dụng thực tế cho cửa hàng nhỏ

### Tính mở rộng
- **Khá**: Có thể thêm payment gateway, notification, mobile app

### Tính tối ưu
- **Trung bình**: Cần thêm index và cache để tối ưu hơn

### Khả năng deploy thực tế
- **Khá**: Có thể deploy lên Vercel (frontend) + Railway/Render (backend) + MongoDB Atlas

### Dự đoán số điểm

| Tiêu chí | Điểm |
|----------|------|
| Chức năng | 8-9/10 |
| Code quality | 7-8/10 |
| UI/UX | 8-9/10 |
| Database | 7-8/10 |
| Presentation | 7-8/10 |
| **Tổng** | **7.5-8.5/10** |

---

## CHECKLIST ÔN BẢO VỆ

### Trước 15 phút:
- [ ] Chạy được cả server và 2 client
- [ ] Tạo tài khoản test
- [ ] Demo được flow mua hàng
- [ ] Demo được flow admin

### Trả lời được:
- [ ] Tại sao trừ tồn kho khi tạo đơn?
- [ ] VietQR hoạt động thế nào?
- [ ] JWT vs Session?
- [ ] Làm sao merge cart khi đăng nhập?
- [ ] Tại sao tách admin ra riêng?
- [ ] bcrypt hash password như thế nào?
- [ ] Pre-save hook là gì?

---

## CÂU "CỨU MẠNG"

Khi bị hỏi khó:

**"Em không rõ lắm về vấn đề đó, nhưng theo em nghĩ..."**
→ Đừng nói "Em không biết"

**"Với kiến thức em có, em sẽ giải quyết bằng cách..."**
→ Luôn đưa ra giải pháp

**"Đó là điểm em có thể cải thiện thêm trong tương lai..."**
→ Biến nhược điểm thành cơ hội học hỏi

**"Em sẽ research thêm về vấn đề này..."**
→ Thể hiện tinh thần học hỏi

---

*Document được tạo cho buổi bảo vệ đồ án CNTT*
*Ngày: 10/05/2026*


PHÂN TÍCH FULL PROJECT THƯƠNG MẠI ĐIỆN TỬ (TMDT)
1. TỔNG QUAN PROJECT
Project này làm gì?
Đây là một hệ thống Web Thương mại điện tử (E-Commerce Website) gồm:
• Website cho khách hàng mua giày/thời trang
• Trang Admin quản lý sản phẩm, đơn hàng, người dùng
• Backend API xử lý logic
• Database MongoDB lưu dữ liệu
• Hệ thống xác thực người dùng bằng JWT
• Upload ảnh Cloudinary/Multer
• Thanh toán và quản lý đơn hàng
Project được chia thành 3 phần chính:
1. client/ → Frontend cho người dùng
2. client-admin/ → Frontend admin
3. server/ → Backend NodeJS + Express + MongoDB

2. CÔNG NGHỆ SỬ DỤNG
Frontend User
Sử dụng:
• ReactJS
• React Router
• Axios
• CSS
• Vite
Frontend Admin
Sử dụng:
• ReactJS
• Dashboard quản trị
• Axios
• Vite
Backend
Sử dụng:
• NodeJS
• ExpressJS
• JWT Authentication
• bcryptjs
• Multer upload file
• MongoDB + Mongoose
Database
• MongoDB
Authentication
• JWT Token
Upload ảnh
• Multer middleware

3. KIẾN TRÚC HỆ THỐNG
Kiến trúc tổng thể
User Browser ↓ React Frontend ↓ Axios Request Express Backend API ↓ MongoDB Database
Admin Browser ↓ Admin React Dashboard ↓ Backend API ↓ MongoDB

4. PHÂN TÍCH THƯ MỤC PROJECT
CLIENT (Frontend User)
File quan trọng
App.jsx
Đây là file trung tâm của frontend.
Nhiệm vụ:
• Khai báo Router
• Điều hướng trang
• Load layout chính
• Kết nối các page
Nếu xóa file này: → Toàn bộ frontend không chạy.

main.jsx
Điểm bắt đầu React App.
Nhiệm vụ:
• Render ReactDOM
• Load App.jsx
Luồng: main.jsx → App.jsx → Components/Page

Cấu trúc Components
Frontend chia thành:
• components/
• pages/
• context/
• services/
Components
Là các phần UI tái sử dụng.
Ví dụ:
• Navbar
• Footer
• ProductCard
• HeroSection
• Cart
Pages
Là từng trang:
• Home
• Product Detail
• Cart
• Checkout
• Login
• Register

React Flow cực kỳ quan trọng
Khi user mở website:
main.jsx ↓ App.jsx ↓ Router ↓ Page Component ↓ Component con ↓ Axios gọi API ↓ Backend trả dữ liệu ↓ Render UI
Đây là flow phải nhớ khi bị hỏi React hoạt động thế nào.

5. BACKEND SERVER
server.js / index.js
Đây là trái tim backend.
Nhiệm vụ:
• Khởi tạo Express
• Kết nối MongoDB
• Khai báo middleware
• Mount routes
• Start server
Luồng: Request → Middleware → Route → Controller → Database → Response

Middleware
authMiddleware.js
Dùng để xác thực JWT.
Flow:
1. Lấy token từ header
2. Verify JWT
3. Decode user
4. Gắn user vào req
5. Cho phép request tiếp tục
Nếu token sai: → Trả lỗi Unauthorized.
Câu phản biện dễ gặp: "Tại sao dùng JWT?"
Trả lời:
• Stateless
• Không cần lưu session server
• Scale tốt
• Phù hợp REST API

requireAdmin.js
Kiểm tra user có quyền admin không.
Flow: User login → Middleware auth → Middleware requireAdmin → Nếu role=admin mới cho truy cập.

uploadMiddleware.js
Xử lý upload ảnh.
Sử dụng:
• multer
Nhiệm vụ:
• Nhận file ảnh
• Lưu tạm
• Trả path ảnh

6. DATABASE MODELS
Product.js
Đây là model quan trọng nhất.
Chứa:
• name
• price
• description
• image
• category
• stock
• reviews
Ý nghĩa: Lưu toàn bộ thông tin sản phẩm.
Quan hệ: Order sẽ tham chiếu Product.

User.js
Lưu:
• username
• email
• password
• role
Password được hash bằng bcrypt.
Câu hỏi dễ bị hỏi: "Tại sao phải hash password?"
Trả lời: Để tránh lộ mật khẩu thật nếu database bị hack.

Order.js
Lưu:
• user
• products
• totalPrice
• shippingAddress
• paymentStatus
• orderStatus
Đây là trung tâm nghiệp vụ của hệ thống.
Flow: User đặt hàng → Tạo Order → Lưu DB → Admin xử lý

Review.js
Lưu đánh giá sản phẩm.
Quan hệ:
• User
• Product

News.js
Lưu bài viết/tin tức.

Newsletter.js
Lưu email đăng ký nhận tin.

Contact.js
Lưu form liên hệ khách hàng.

7. ROUTES
productRoutes.js
API sản phẩm.
Ví dụ:
GET /api/products → Lấy danh sách sản phẩm
GET /api/products/:id → Chi tiết sản phẩm
POST /api/products → Admin tạo sản phẩm
PUT /api/products/:id → Cập nhật
DELETE /api/products/:id → Xóa sản phẩm
Câu hỏi dễ bị hỏi: "RESTful API là gì?"
Trả lời: API thiết kế theo resource. Sử dụng HTTP methods:
• GET
• POST
• PUT
• DELETE

userRoutes.js
Chức năng:
• Register
• Login
• Profile
• JWT
Flow login:
1. User nhập email/password
2. Server tìm user
3. Compare bcrypt
4. Tạo JWT
5. Trả token
6. Frontend lưu token

orderRoutes.js
Xử lý:
• Tạo đơn
• Xem đơn
• Update trạng thái
• Admin quản lý đơn

reviewRouters.js
Cho phép:
• Thêm review
• Xóa review
• Xem review

newsRoutes.js
CRUD bài viết.

8. EMAIL SERVICE
emailService.js
Dùng gửi email.
Có thể sử dụng:
• Nodemailer
• SMTP Gmail
Flow: Backend → SMTP → Gmail → User nhận mail

9. LUỒNG HOẠT ĐỘNG THỰC TẾ
Flow mua hàng
Bước 1
User vào trang Home.
Frontend gọi: GET /products
Backend:
• Query MongoDB
• Trả JSON
Frontend render sản phẩm.

Bước 2
User click sản phẩm.
Frontend: GET /products/:id
Backend:
• Tìm sản phẩm
• Trả chi tiết

Bước 3
Add to Cart.
Frontend:
• Lưu cart state
• Hoặc localStorage

Bước 4
Checkout.
Frontend gửi: POST /orders
Backend:
• Verify token
• Tạo order
• Trừ stock
• Lưu DB

Bước 5
Admin dashboard.
Admin: GET /orders
Backend:
• Kiểm tra admin
• Trả danh sách đơn.

10. DATABASE THIẾT KẾ
Quan hệ chính
User ↓ Order ↓ Product
Review: User ↔ Product

Vì sao dùng MongoDB?
Ưu điểm:
• Linh hoạt schema
• Dễ phát triển nhanh
• JSON-like document
• Hợp React + NodeJS tốt
Nhược điểm:
• Khó join phức tạp
• Không mạnh transaction bằng SQL

11. ĐIỂM MẠNH PROJECT
1. Tách frontend/backend rõ ràng
2. Có admin dashboard
3. Có authentication
4. Có upload ảnh
5. Có CRUD đầy đủ
6. Kiến trúc MERN khá chuẩn
7. Có middleware bảo mật
8. Có quản lý đơn hàng
9. Có review sản phẩm
10. Dễ mở rộng

12. ĐIỂM YẾU PROJECT
1. Chưa thấy:
• Redis cache
• Docker
• CI/CD
• Rate limiting
• Logging system
• Unit test
2. Security còn thiếu:
• CSRF protection
• Refresh token
• Validation mạnh
• Anti spam
3. Performance:
• Chưa pagination tốt
• Chưa optimize query lớn
• Chưa CDN ảnh

13. NHỮNG CÂU HỎI PHẢN BIỆN CHẮC CHẮN BỊ HỎI
Câu 1
Tại sao chọn MERN Stack?
Trả lời:
• Full JavaScript
• Đồng nhất frontend/backend
• Phát triển nhanh
• React UI mạnh
• MongoDB linh hoạt

Câu 2
Tại sao dùng JWT?
Trả lời:
• Stateless
• Dễ scale
• Phù hợp REST API
• Không cần session server

Câu 3
Tại sao dùng MongoDB?
Trả lời:
• Schema linh hoạt
• Phù hợp dữ liệu ecommerce
• JSON dễ map React

Câu 4
Nếu có 1 triệu user thì sao?
Trả lời:
• Scale ngang backend
• Load balancer
• Redis cache
• CDN ảnh
• Database sharding
• Queue xử lý async

Câu 5
Nếu hacker sửa JWT?
Trả lời:
• JWT có signature
• Verify secret key
• Token sai sẽ reject

Câu 6
Tại sao hash password?
Trả lời:
• Tránh lộ password thật
• Tăng bảo mật DB

Câu 7
Middleware là gì?
Trả lời: Middleware là tầng trung gian xử lý request trước khi vào route chính.
Ví dụ:
• auth
• upload
• logging

14. SCRIPT THUYẾT TRÌNH
MỞ ĐẦU
"Ngày nay nhu cầu mua sắm online tăng rất mạnh, vì vậy nhóm em xây dựng hệ thống thương mại điện tử nhằm hỗ trợ quản lý sản phẩm, đơn hàng và trải nghiệm mua sắm trực tuyến hiệu quả hơn."

GIỚI THIỆU CÔNG NGHỆ
"Hệ thống sử dụng MERN Stack gồm MongoDB, ExpressJS, ReactJS và NodeJS. Frontend dùng React để xây dựng giao diện SPA, backend dùng Express xây dựng REST API và MongoDB dùng lưu dữ liệu."

GIẢI THÍCH FLOW
"Khi người dùng truy cập website, frontend React sẽ gọi API từ backend thông qua Axios. Backend xử lý nghiệp vụ, truy vấn MongoDB và trả dữ liệu JSON cho frontend hiển thị."

KẾT LUẬN
"Project đã hoàn thành các chức năng cốt lõi của một website thương mại điện tử gồm xác thực người dùng, quản lý sản phẩm, giỏ hàng và đơn hàng. Trong tương lai hệ thống có thể mở rộng thanh toán online, AI recommendation và triển khai cloud."

15. 20 Ý QUAN TRỌNG PHẢI NHỚ
1. MERN Stack
2. React là SPA
3. Express xây REST API
4. MongoDB lưu document
5. JWT dùng xác thực
6. bcrypt hash password
7. Middleware xử lý trung gian
8. Axios gọi API
9. CRUD sản phẩm
10. CRUD đơn hàng
11. Admin dashboard
12. Upload ảnh bằng multer
13. React Router điều hướng
14. State quản lý dữ liệu
15. MongoDB schema linh hoạt
16. RESTful API
17. Token lưu frontend
18. Order flow
19. Auth flow
20. Database relations

16. CÁC FILE QUAN TRỌNG NHẤT
Frontend
• App.jsx
• main.jsx
Backend
• server.js/index.js
• productRoutes.js
• userRoutes.js
• authMiddleware.js
• Product.js
• User.js
• Order.js

17. NHỮNG THỨ GIẢNG VIÊN DỄ BẮT BẺ
1. Chưa refresh token
2. Chưa chống spam API
3. Chưa validate mạnh
4. Chưa cache
5. Chưa tối ưu query lớn
6. Chưa phân quyền sâu
7. Chưa có test
8. Chưa deploy production chuẩn

18. CÂU CỨU MẠNG KHI BÍ
Khi bị hỏi khó
"Hiện tại nhóm em đang tập trung vào core features trước để đảm bảo tính ổn định hệ thống, phần đó là hướng mở rộng trong tương lai."

Khi bị hỏi scale lớn
"Nếu triển khai thực tế nhóm em sẽ bổ sung Redis cache, load balancer và database sharding để đảm bảo hiệu năng."

Khi bị hỏi security
"Hiện tại hệ thống đã có JWT và hash password, ngoài ra trong production có thể bổ sung rate limiting và refresh token."

19. ĐÁNH GIÁ ĐỒ ÁN
Mức độ khó
Khá.
Vì:
• Có fullstack
• Có auth
• Có dashboard
• Có database
• Có upload

Tính thực tế
Cao.
Đây là mô hình ecommerce thực tế.

Khả năng mở rộng
Tốt.
Có thể mở rộng:
• Thanh toán online
• Recommendation AI
• Chat realtime
• Notification
• Analytics

Điểm dự đoán
Nếu demo ổn + trả lời tốt: 8 → 9+
Nếu trả lời yếu phần backend/database: 6.5 → 7.5

20. CHECKLIST ÔN 1 TIẾNG CUỐI
15 phút đầu
• Hiểu flow hệ thống
• Hiểu login
• Hiểu order flow
15 phút tiếp
• Học middleware
• Học JWT
• Học MongoDB
15 phút tiếp
• Học routes
• Học models
• Học React flow
15 phút cuối
• Học câu phản biện
• Tập nói flow
• Demo thử

21. MINDMAP NHỚ NHANH
Frontend React ↓ Axios ↓ Express API ↓ Middleware ↓ Route ↓ Controller ↓ MongoDB ↓ Response JSON ↓ Frontend Render

