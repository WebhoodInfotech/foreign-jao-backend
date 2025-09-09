// server/routes/assetRoutes.js
const express = require("express");
const router = express.Router();
const {
  uploadAsset,
  getUploadedAssets,
  listAllAssets,
} = require("../controllers/assetController");

// Public endpoints (frontend will call these)
router.post("/uploadAssets", uploadAsset); // save uploaded file metadata
router.get("/getUploadedAssets", getUploadedAssets); // query param ?studentId=...
router.get("/getUploadedAssets/:studentId", getUploadedAssets); // alternative path

// Optional admin listing
router.get("/assets", listAllAssets);

module.exports = router;
