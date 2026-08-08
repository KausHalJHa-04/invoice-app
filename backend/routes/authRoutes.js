const router = require("express").Router();
const express = require("express");
const { register, login, me } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const softAuth = require("../middleware/softAuth");

router.post("/register", express.json({ limit: "10mb" }), softAuth, register);
router.post("/login", express.json({ limit: "10mb" }), login);
router.get("/me", protect, me);

module.exports = router;
