const express = require("express");
const {
  getCoffeeShops,
  createCoffeeShop,
  deleteCoffeeShop,
} = require("../controllers/coffeeShops");
const auth = require("../middlewares/auth");
const {
  validateCreateCoffeeShopBody,
  validateCoffeeShopIdParam,
} = require("../middlewares/validation");

const router = express.Router();

// All routes require authentication
router.use(auth);

// Routes
router.get("/", getCoffeeShops);
router.post("/", validateCreateCoffeeShopBody, createCoffeeShop);
router.delete("/:coffeeShopId", validateCoffeeShopIdParam, deleteCoffeeShop);

module.exports = router;
