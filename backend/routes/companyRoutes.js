const router = require("express").Router();
const { protect, allowRoles } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { getCompany, updateCompany } = require("../controllers/companyController");

router.get("/", protect, getCompany);
router.put("/", protect, allowRoles("Admin"), updateCompany);
router.post("/logo", protect, allowRoles("Admin"), upload.single("logo"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  res.json({ url: `/uploads/${req.file.filename}` });
});

module.exports = router;
