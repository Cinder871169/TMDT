const mongoose = require("mongoose");

const serverStateSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ServerState", serverStateSchema);
