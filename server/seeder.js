const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");
const News = require("./models/News");
const shoes = require("./data/shoes");
const news = require("./data/news");

dotenv.config();

const importData = async () => {
  try {
    // 1. Kết nối DB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Đã kết nối MongoDB chuẩn bị nạp dữ liệu...");

    // 2. Xóa sạch dữ liệu cũ (nếu có) để tránh trùng lặp
    await Product.deleteMany();
    await News.deleteMany();

    // 3. Bơm dữ liệu mới vào
    await Product.insertMany(shoes);
    await News.insertMany(news);

    console.log("NẠP DỮ LIỆU THÀNH CÔNG!");
    process.exit();
  } catch (error) {
    console.error("Lỗi nạp dữ liệu:", error.message);
    process.exit(1);
  }
};

importData();
