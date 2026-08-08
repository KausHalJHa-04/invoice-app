const router = require("express").Router();
const express = require("express");
const { protect, allowRoles } = require("../middleware/auth");
const { getUsers, createUser, updateUser, deleteUser } = require("../controllers/userController");

router.use(protect, allowRoles("Admin"));
router.get("/", getUsers);
router.post("/", express.json({ limit: "10mb" }), createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
