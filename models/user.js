const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true }, // store hashed password
    number: { type: String },
    profile: { type: String }, // image URL (profile picture)
    aadharNumber: { type: String },
    panNumber: { type: String },
    schoolName: { type: String },
    fatherName: { type: String },
    fatherContactNumber: { type: String },
    motherName: { type: String },
    motherContactNumber: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
