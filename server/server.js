const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const newsRoutes = require("./routes/newsRoutes");
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/users", require("./routes/userRoutes"));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Đã kết nối thành công với MongoDB (shoe_store_db)"))
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
