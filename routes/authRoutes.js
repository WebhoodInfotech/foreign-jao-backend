const express = require("express");
const router = express.Router();
const { handleAuth } = require("../controllers/authController");

// One endpoint for both signup + login
router.post("/auth", handleAuth);

module.exports = router;