const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Order = require("./models/Order");
const User = require("./models/User");
const Product = require("./models/Product");

dotenv.config();

const seedOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Đã kết nối MongoDB...");

    // Lấy một user (hoặc tạo nếu không có)
    let user = await User.findOne({ isAdmin: false });
    if (!user) {
      user = await User.create({
        name: "Test User",
        email: "user@example.com",
        password: "user123",
        isAdmin: false,
      });
      console.log("Tạo user mới:", user.email);
    }

    // Lấy các sản phẩm
    const products = await Product.find().limit(10);
    if (products.length === 0) {
      console.log("Không có sản phẩm, vui lòng chạy seeder trước!");
      process.exit(1);
    }

    // Tạo 20 orders với các trạng thái khác nhau
    const orders = [];
    const statuses = ["Chờ xử lý", "Đang giao", "Đã giao", "Đã hủy"];
    const paymentStatuses = [
      "Chưa thanh toán",
      "Đã thanh toán",
      "Đã hoàn tiền",
    ];

    for (let i = 0; i < 20; i++) {
      const product = products[i % products.length];
      const status = statuses[i % statuses.length];
      const paymentStatus = paymentStatuses[i % paymentStatuses.length];

      // Tạo ngày tạo từ 30 ngày trước đến hôm nay
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      const order = {
        user: user._id,
        orderItems: [
          {
            name: product.name,
            size: product.sizes ? product.sizes[0] : 40,
            color: product.colors ? product.colors[0] : "Đen",
            quantity: Math.floor(Math.random() * 3) + 1,
            image: product.image,
            price: product.price,
            product: product._id,
          },
        ],
        totalPrice: product.price * (Math.floor(Math.random() * 3) + 1),
        shippingFee: 30000,
        status: status,
        address: `${100 + i} Đường ABC, Quận 1, TP.HCM`,
        phone: "0912345678",
        city: "TP.HCM",
        paymentMethod: Math.random() > 0.5 ? "vietqr" : "banking",
        paymentStatus: paymentStatus,
        paymentInfo:
          status === "Đã giao"
            ? {
                bankName: "Vietcombank",
                accountNumber: "1234567890",
                accountName: "Test User",
                transferContent: `Order #${i + 1}`,
              }
            : null,
        paidAt: paymentStatus === "Đã thanh toán" ? new Date() : null,
        createdAt: createdAt,
        updatedAt: createdAt,
      };
      orders.push(order);
    }

    // Chèn tất cả orders
    await Order.insertMany(orders);
    console.log(`✓ Đã thêm ${orders.length} đơn hàng thành công!`);

    // In thống kê
    const totalOrders = await Order.countDocuments();
    const deliveredOrders = await Order.countDocuments({ status: "Đã giao" });
    const totalRevenue = await Order.aggregate([
      { $match: { status: "Đã giao" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    console.log("\n📊 Thống kê:");
    console.log(`- Tổng đơn hàng: ${totalOrders}`);
    console.log(`- Đơn hàng đã giao: ${deliveredOrders}`);
    console.log(`- Doanh thu từ đơn giao: ${totalRevenue[0]?.total || 0} VND`);

    process.exit(0);
  } catch (error) {
    console.error("Lỗi:", error.message);
    process.exit(1);
  }
};

seedOrders();
