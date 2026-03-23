const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    brand: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    sizes: [{ type: Number, required: true }],
    colors: [{ type: String, required: true }],
    countInStock: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Product", productSchema);
