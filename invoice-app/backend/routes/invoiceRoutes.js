const router = require("express").Router();
const { protect, requirePermission } = require("../middleware/auth");
const inv = require("../controllers/invoiceController");

router.use(protect);
router.get("/", inv.getInvoices);
router.get("/:id", inv.getInvoice);
router.post("/proforma", requirePermission("create_invoice"), inv.createProforma);
router.post("/tax", requirePermission("create_invoice"), inv.createTaxInvoice);
router.put("/:id", requirePermission("create_invoice"), inv.updateInvoice);
router.post("/:id/convert", requirePermission("create_invoice"), inv.convertToTaxInvoice);
router.post("/:id/duplicate", requirePermission("create_invoice"), inv.duplicateInvoice);
router.post("/:id/cancel", requirePermission("delete_invoice"), inv.cancelInvoice);
router.patch("/:id/status", requirePermission("create_invoice"), inv.updateStatus);

module.exports = router;
