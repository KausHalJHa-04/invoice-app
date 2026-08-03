const router = require("express").Router();
const { protect } = require("../middleware/auth");
const c = require("../controllers/customerController");

router.use(protect);
router.get("/", c.getCustomers);
router.get("/:id", c.getCustomer);
router.post("/", c.createCustomer);
router.put("/:id", c.updateCustomer);
router.delete("/:id", c.deleteCustomer);

module.exports = router;
