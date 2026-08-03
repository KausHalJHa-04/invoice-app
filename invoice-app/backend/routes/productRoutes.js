const router = require("express").Router();
const { protect, requirePermission } = require("../middleware/auth");
const upload = require("../middleware/upload");
const p = require("../controllers/productController");

router.use(protect);
router.get("/", p.getProducts);
router.get("/:id", p.getProduct);
router.post("/", requirePermission("edit_product"), p.createProduct);
router.put("/:id", requirePermission("edit_product"), p.updateProduct);
router.delete("/:id", requirePermission("edit_product"), p.deleteProduct);
router.post("/upload-image", requirePermission("edit_product"), upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  res.json({ url: `/uploads/${req.file.filename}` });
});

module.exports = router;
