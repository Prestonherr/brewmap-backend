const express = require("express");
const { celebrate, Joi } = require("celebrate");
const {
  getCoffeeShops,
  createCoffeeShop,
  deleteCoffeeShop,
} = require("../controllers/coffeeShops");
const auth = require("../middlewares/auth");

const router = express.Router();

// Validation schemas
const createCoffeeShopSchema = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    address: Joi.string().allow(""),
    lat: Joi.number().required(),
    lon: Joi.number().required(),
    distance: Joi.number(),
    tags: Joi.object(),
    osmId: Joi.string(),
  }),
};

// All routes require authentication
router.use(auth);

// Routes
router.get("/", getCoffeeShops);
router.post("/", celebrate(createCoffeeShopSchema), createCoffeeShop);
router.delete("/:coffeeShopId", deleteCoffeeShop);

module.exports = router;
