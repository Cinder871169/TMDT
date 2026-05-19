const mongoose = require("mongoose");

const chatSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    history: [
      {
        role: {
          type: String,
          required: true,
          enum: ["user", "model"],
        },
        parts: [
          {
            text: {
              type: String,
              required: true,
            },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatSession", chatSessionSchema);
