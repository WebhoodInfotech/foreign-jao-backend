const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

function issueJwt(user) {
  return jwt.sign(
    { sub: String(user._id), email: user.email }, // payload
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || "7d" }
  );
}

exports.handleAuth = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, error: "Email and password are required" });
    }

    // 1) find by email
    const existing = await User.findOne({ email });

    // ─────────────────────────────────────────
    // LOGIN FLOW (email found)
    // ─────────────────────────────────────────
    if (existing) {
      const ok = await bcrypt.compare(password, existing.passwordHash);
      if (!ok) {
        return res.status(401).json({ ok: false, error: "Incorrect password" });
      }

      const token = issueJwt(existing);

      // Option A: return token in JSON (frontend stores it)
      return res.json({
        ok: true,
        mode: "login",
        message: "Login successful",
        token,
        user: {
          id: existing._id,
          email: existing.email,
          name: existing.name || "",
          profile: existing.profile || "",
        },
      });

      // Option B (alternative): set httpOnly cookie (uncomment if you prefer cookies)
      // res.cookie("fj_token", token, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 7*24*3600*1000 });
      // return res.json({ ok: true, mode: "login", message: "Login successful" });
    }

    // ─────────────────────────────────────────
    // SIGNUP FLOW (email not found)
    // ─────────────────────────────────────────
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      passwordHash,
      name: name || "", // optional
    });

    const token = issueJwt(user);

    return res.status(201).json({
      ok: true,
      mode: "signup",
      message: "Signup successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name || "",
        profile: user.profile || "",
      },
    });
  } catch (err) {
    console.error("handleAuth error:", err);
    // duplicate email safety (in case of race)
    if (err.code === 11000 && err.keyPattern?.email) {
      return res.status(409).json({ ok: false, error: "Email already in use" });
    }
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
};
