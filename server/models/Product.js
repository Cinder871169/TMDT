const mongoose = require("mongoose");

const colorVariantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  images: [{ type: String }],
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    brand: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    isOnSale: { type: Boolean, default: false },
    sizes: [{ type: Number }],
    colors: [colorVariantSchema],
    countInStock: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
