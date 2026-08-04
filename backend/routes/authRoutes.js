const router = require("express").Router();
const express = require("express");
const { register, login, me } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post("/register", express.json({ limit: "10mb" }), register); // guarded on the frontend after the first Admin exists
router.post("/login", express.json({ limit: "10mb" }), login);
router.get("/me", protect, me);

module.exports = router;
