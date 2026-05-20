const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { randomUUID } = require("crypto");
const ServerState = require("./models/ServerState");

const app = express();

// CORS for both client apps (support dynamic environment variables in production)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.CLIENT_URL,
  process.env.ADMIN_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const newsRoutes = require("./routes/newsRoutes");
const reviewRoutes = require("./routes/reviewRouters");
const sitemapRoutes = require("./routes/sitemapRoutes");
const richSnippetRoutes = require("./routes/richSnippetRoutes");
const adminProductRoutes = require("./routes/admin/productRoutes");
const adminOrderRoutes = require("./routes/admin/orderRoutes");
const adminUserRoutes = require("./routes/admin/userRoutes");
const adminNewsRoutes = require("./routes/admin/newsRoutes");

app.use("/api/reviews", reviewRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/vouchers", require("./routes/voucherRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/sitemap.xml", sitemapRoutes);
app.use("/api/rich-snippets", richSnippetRoutes);

// Admin routes
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/news", adminNewsRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Đã kết nối thành công với MongoDB (shoe_store_db)");

    try {
      const instanceId = randomUUID();
      await ServerState.findOneAndUpdate(
        { key: "instanceId" },
        { value: instanceId },
        { upsert: true, new: true },
      );
      process.INSTANCE_ID = instanceId;
      console.log("Server instanceId set:", instanceId);
    } catch (err) {
      console.error("Không thể khởi tạo instanceId:", err.message);
    }
  })
  .catch((err) => {
    console.error("Lỗi kết nối MongoDB:", err.message);
    process.exit(1);
  });

app.get("/", (req, res) => {
  res.send("API Shop Giày đang hoạt động.");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
