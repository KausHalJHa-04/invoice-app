const router = require("express").Router();
const { protect, allowRoles } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { getCompany, updateCompany } = require("../controllers/companyController");

const publicUrl = (req, filename) => {
  const base = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;
  return `${base.replace(/\/?$/, "")}/uploads/${filename}`;
};

router.get("/", protect, getCompany);
router.put("/", protect, allowRoles("Admin"), updateCompany);
router.post("/logo", protect, allowRoles("Admin"), upload.single("logo"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  res.json({ url: publicUrl(req, req.file.filename) });
});

module.exports = router;
