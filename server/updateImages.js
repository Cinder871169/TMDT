const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const newImages = {
  "Nike Air Force 1 '07": "https://placehold.co/400x400/ffffff/000000?text=Nike+Air+Force+1",
  "Adidas Ultraboost 22": "https://placehold.co/400x400/cccccc/000000?text=Adidas+Ultraboost",
  "Converse Chuck Taylor All Star": "https://placehold.co/400x400/ff0000/ffffff?text=Converse+Chuck+Taylor",
  "Puma RS-X3": "https://placehold.co/400x400/00ff00/000000?text=Puma+RS-X3",
  "New Balance 990v5": "https://placehold.co/400x400/808080/ffffff?text=New+Balance+990v5",
  "Vans Old Skool": "https://placehold.co/400x400/000000/ffffff?text=Vans+Old+Skool",
  "ASICS Gel-Kayano 28": "https://placehold.co/400x400/0000ff/ffffff?text=ASICS+Gel-Kayano",
  "Reebok Nano X2": "https://placehold.co/400x400/ff6600/ffffff?text=Reebok+Nano+X2",
};

const updateImages = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Đã kết nối MongoDB...");

    const Product = require("./models/Product");
    
    for (const [name, image] of Object.entries(newImages)) {
      const result = await Product.updateOne(
        { name },
        { $set: { image } }
      );
      console.log(`Updated "${name}": ${result.modifiedCount} document(s)`);
    }

    console.log("\nCập nhật ảnh hoàn tất!");
    process.exit();
  } catch (error) {
    console.error("Lỗi:", error.message);
    process.exit(1);
  }
};

updateImages();
