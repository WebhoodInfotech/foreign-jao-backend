// server/controllers/assetController.js
const mongoose = require("mongoose");
const Asset = require("../models/asset");

/**
 * POST /uploadAssets
 * Body: {
 *   name: string,
 *   file: string (public URL),
 *   type: string (mime),
 *   bytes: number,
 *   studentId: string (objectId),
 *   uploadedBy?: string,
 *   meta?: object
 * }
 */
exports.uploadAsset = async (req, res) => {
  try {
    const { name, file, type, bytes, studentId, uploadedBy, meta } = req.body;

    if (!name || !file || !studentId) {
      return res
        .status(400)
        .json({ ok: false, error: "name, file and studentId are required" });
    }
    if (!mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({ ok: false, error: "invalid studentId" });
    }

    const doc = await Asset.create({
      name,
      file,
      type: type || null,
      bytes: typeof bytes === "number" ? bytes : null,
      studentId,
      uploadedBy: uploadedBy || null,
      meta: meta || null,
    });

    return res
      .status(201)
      .json({ ok: true, message: "Asset saved", data: doc });
  } catch (err) {
    console.error("uploadAsset error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};

/**
 * GET /getUploadedAssets?studentId=<id>
 * or GET /getUploadedAssets/:studentId
 */
exports.getUploadedAssets = async (req, res) => {
  try {
    const studentId = req.query.studentId || req.params.studentId;
    if (!studentId)
      return res
        .status(400)
        .json({ ok: false, error: "studentId is required" });
    if (!mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({ ok: false, error: "invalid studentId" });
    }

    const docs = await Asset.find({ studentId }).sort({ createdAt: -1 }).lean();
    return res.json({ ok: true, data: docs });
  } catch (err) {
    console.error("getUploadedAssets error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};

/**
 * Optional: GET /assets (admin) to list all assets with pagination
 */
exports.listAllAssets = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(parseInt(req.query.limit || "50", 10), 200);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Asset.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Asset.countDocuments(),
    ]);

    return res.json({ ok: true, data, meta: { total, page, limit } });
  } catch (err) {
    console.error("listAllAssets error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};
