// Run this script once to make a user an admin
// Usage: node server/makeAdmin.js <email>

const mongoose = require("mongoose");
require("dotenv").config();

const email = process.argv[2];

if (!email) {
  console.log("Usage: node makeAdmin.js <email>");
  console.log("Example: node makeAdmin.js admin@example.com");
  process.exit(1);
}

async function makeAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const User = require("./models/User");
    
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      process.exit(1);
    }
    
    user.isAdmin = true;
    await user.save();
    
    console.log(`✅ ${email} is now an admin!`);
    console.log(`   isAdmin: ${user.isAdmin}`);
    
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

makeAdmin();
