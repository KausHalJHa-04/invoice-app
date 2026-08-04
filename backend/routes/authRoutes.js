const router = require("express").Router();
const { register, login, me } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post("/register", register); // guarded on the frontend after the first Admin exists
router.post("/login", login);
router.get("/me", protect, me);

module.exports = router;
