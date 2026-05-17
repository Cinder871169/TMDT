const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    orderItems: [
      {
        name: { type: String, required: true },
        size: { type: Number, required: true },
        color: { type: String, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, default: "" },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
      },
    ],
    totalPrice: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    voucherCode: { type: String, default: "" },
    status: { type: String, default: "Chờ xử lý" },
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    note: { type: String, default: "" },
    paymentMethod: { 
      type: String, 
      enum: ["vietqr", "banking"], 
      required: true 
    },
    paymentStatus: { 
      type: String, 
      enum: ["Chưa thanh toán", "Đã thanh toán", "Đã hoàn tiền"],
      default: "Chưa thanh toán" 
    },
    paymentInfo: {
      bankName: String,
      accountNumber: String,
      accountName: String,
      transferContent: String,
    },
    paidAt: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
