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
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
      },
    ],
    totalPrice: { type: Number, required: true },
    status: { type: String, default: "Chờ xử lý" },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
