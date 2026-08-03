const router = require("express").Router();
const { protect } = require("../middleware/auth");
const d = require("../controllers/dashboardController");

router.use(protect);
router.get("/summary", d.getSummary);
router.get("/sales-graph", d.getSalesGraph);

module.exports = router;
