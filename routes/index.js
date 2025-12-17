const router = require("express").Router();
const { NotFoundError } = require("../utils/errors");
const auth = require("../middlewares/auth");

router.use(auth);
router.use("/coffee-shops", require("./coffeeShops"));
router.use("/users", require("./users"));

router.use((req, res, next) => {
  next(new NotFoundError("The requested resource was not found"));
});

module.exports = router;
