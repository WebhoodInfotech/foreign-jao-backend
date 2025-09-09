// models/Wishlist.js
const mongoose = require("mongoose");

const WishlistSchema = new mongoose.Schema(
  {
    item: { type: String },
    userData: { type: Object },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wishlist", WishlistSchema);
