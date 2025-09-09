// server/models/Asset.js
const mongoose = require("mongoose");

const AssetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // original file name or label
    file: { type: String, required: true }, // public URL (Cloudinary / S3 / other)
    type: { type: String }, // MIME type, e.g. "image/png", "application/pdf"
    bytes: { type: Number }, // file size in bytes
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    uploadedBy: { type: String }, // optional: user id/email snapshot
    meta: { type: Object }, // optional: any extra metadata
  },
  { timestamps: true }
);

// Force collection name "assets"
module.exports = mongoose.model("Asset", AssetSchema, "assets");
