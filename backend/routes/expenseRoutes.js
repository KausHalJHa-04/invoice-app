const router = require("express").Router();
const { protect, allowRoles } = require("../middleware/auth");
const e = require("../controllers/expenseController");

router.use(protect, allowRoles("Admin", "Accountant"));
router.get("/", e.getExpenses);
router.post("/", e.createExpense);
router.put("/:id", e.updateExpense);
router.delete("/:id", e.deleteExpense);

module.exports = router;
