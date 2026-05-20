# Hướng dẫn Triển khai Chi tiết (SneakerZone Production Deployment Guide)

Tài liệu này hướng dẫn bạn từng bước triển khai Backend API lên **Render** (hoặc **Railway**) và triển khai 2 ứng dụng Frontend (Client, Client-Admin) lên **Vercel** theo Phương án 1 đã chọn.

---

## BƯỚC 1: TRIỂN KHAI BACKEND API (Lên Render)

**Render** là một dịch vụ PaaS rất dễ sử dụng và cung cấp gói miễn phí tốt cho ứng dụng Node.js.

### 1. Chuẩn bị Git Repository
1. Đảm bảo toàn bộ mã nguồn dự án đã được commit và push lên **GitHub** (hoặc GitLab/Bitbucket) ở chế độ **Private** (để bảo mật cấu hình).

### 2. Tạo Web Service trên Render
1. Đăng nhập vào [Render Dashboard](https://dashboard.render.com/).
2. Nhấn nút **New +** và chọn **Web Service**.
3. Kết nối với tài khoản GitHub của bạn và chọn repository của dự án.
4. Cấu hình dịch vụ với các thông số sau:
   - **Name**: `sneakerzone-api` (hoặc tên tùy chọn).
   - **Environment**: `Node`
   - **Region**: Chọn vùng gần Việt Nam nhất (ví dụ: `Singapore - ap-southeast-1` để có độ trễ thấp).
   - **Branch**: `main` (hoặc branch chính của bạn).
   - **Root Directory**: `server` (Rất quan trọng! Render sẽ chỉ chạy lệnh trong thư mục `server`).
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Chọn gói **Free** (hoặc gói có phí tùy nhu cầu).

### 3. Cấu hình Biến môi trường (Environment Variables)
Nhấp vào tab **Environment** trong dịch vụ Render vừa tạo và thêm các biến sau (dựa trên file [.env.example](file:///c:/Users/Admin/Documents/TMDT/server/.env.example)):

| Key | Value (Ví dụ) | Mô tả |
| :--- | :--- | :--- |
| `PORT` | `5000` | Cổng dịch vụ |
| `MONGO_URI` | `mongodb+srv://admin:c8HRjVlnNZHsljjK@...` | Chuỗi kết nối MongoDB Atlas (đã có sẵn trong code) |
| `JWT_SECRET` | `Mật_khẩu_bí_mật_của_bạn_ở_đây` | Chuỗi ký tự ngẫu nhiên dùng để mã hóa token đăng nhập |
| `CLOUDINARY_CLOUD_NAME` | `dairz8k9a` | Tên tài khoản Cloudinary (đã có sẵn) |
| `CLOUDINARY_API_KEY` | `773947998222513` | API Key của Cloudinary (đã có sẵn) |
| `CLOUDINARY_API_SECRET` | `1z8HE9nCFgRiTcqS69e_nPfMZnI` | API Secret của Cloudinary (đã có sẵn) |
| `GMAIL_USER` | `buingocthien234@gmail.com` | Email gửi OTP & Hóa đơn |
| `GMAIL_APP_PASSWORD` | `qoid paqt vuyt zigc` | Mật khẩu ứng dụng của Gmail (đã có sẵn) |
| `GEMINI_API_KEY` | `AIzaSyCbHty8JRAjW_2cCbthZr4CE_1eD6pEJnE` | API Key kết nối trợ lý ảo AI (đã có sẵn) |
| `CLIENT_URL` | `https://sneakerzone.vercel.app` | **URL của trang Client sau khi deploy ở Bước 2** |
| `ADMIN_URL` | `https://sneakerzone-admin.vercel.app` | **URL của trang Admin sau khi deploy ở Bước 3** |

5. Nhấn **Save Changes**. Render sẽ tự động tiến hành build và khởi chạy API Server. Sau khi hoàn tất, Render sẽ cấp cho bạn một đường dẫn API công khai (ví dụ: `https://sneakerzone-api.onrender.com`). Hãy sao chép URL này để dùng cho bước tiếp theo.

---

## BƯỚC 2: TRIỂN KHAI FRONTEND CLIENT (Lên Vercel)

### 1. Tạo Project trên Vercel
1. Đăng nhập vào [Vercel](https://vercel.com/).
2. Nhấn **Add New...** -> **Project**.
3. Chọn Repository chứa dự án của bạn từ tài khoản GitHub.

### 2. Cấu hình Build cho Client
1. Tại phần cấu hình dự án, mở phần **Configure Project**:
   - **Framework Preset**: Chọn **Vite** (Vercel sẽ tự động phát hiện).
   - **Root Directory**: Chọn thư mục `client`.
2. Mở phần **Environment Variables** và thêm biến môi trường sau:
   - **Key**: `VITE_API_BASE`
   - **Value**: `https://sneakerzone-api.onrender.com` (Đường dẫn API Render bạn nhận được ở Bước 1).
3. Nhấn **Deploy**. Quá trình build diễn ra chỉ khoảng 30-45 giây. Khi thành công, Vercel sẽ cấp cho bạn một tên miền (ví dụ: `https://sneakerzone.vercel.app`).
4. **Lưu ý**: Hãy sao chép URL này và cập nhật vào biến `CLIENT_URL` trên phần quản trị Environment Variables của Render (Bước 1).

---

## BƯỚC 3: TRIỂN KHAI FRONTEND ADMIN (Lên Vercel)

Lặp lại quy trình như Bước 2 cho ứng dụng quản trị.

### 1. Tạo Project trên Vercel
1. Nhấn **Add New...** -> **Project** trên Vercel Dashboard.
2. Chọn cùng Repository chứa dự án.

### 2. Cấu hình Build cho Admin
1. Tại cấu hình dự án:
   - **Framework Preset**: Chọn **Vite**.
   - **Root Directory**: Chọn thư mục `client-admin`.
2. Mở phần **Environment Variables** và thêm các biến môi trường sau:
   - **Biến 1**:
     - **Key**: `VITE_API_BASE`
     - **Value**: `https://sneakerzone-api.onrender.com` (Đường dẫn API Render ở Bước 1).
   - **Biến 2**:
     - **Key**: `VITE_CLIENT_URL`
     - **Value**: `https://sneakerzone.vercel.app` (Đường dẫn trang bán hàng Client ở Bước 2).
3. Nhấn **Deploy**.
4. **Lưu ý**: Hãy sao chép URL này (ví dụ: `https://sneakerzone-admin.vercel.app`) và cập nhật vào biến `ADMIN_URL` trên phần quản trị Environment Variables của Render (Bước 1).

---

## BƯỚC 4: HOÀN THIỆN & KIỂM TRA

1. **Khởi động lại Web Service trên Render**:
   - Sau khi bạn đã cập nhật đầy đủ cả `CLIENT_URL` và `ADMIN_URL` trên Render Environment, hãy vào Render Dashboard -> Chọn dịch vụ Backend -> Nhấn **Manual Deploy** -> Chọn **Clear Build Cache & Deploy** để cập nhật cấu hình CORS mới nhất.
2. **Kiểm thử**:
   - Truy cập vào URL Client trên Vercel, thử tiến hành đặt hàng, lưu voucher, và trò chuyện với trợ lý ảo AI.
   - Truy cập URL Admin trên Vercel, đăng nhập bằng tài khoản admin để quản lý sản phẩm, đơn hàng, và xuất bản bài viết tin tức mới bằng công cụ Rich Text Editor.

Chúc mừng bạn! Hệ thống SneakerZone đã được deploy thành công lên môi trường production chất lượng cao và hoàn toàn miễn phí/tối ưu chi phí!
