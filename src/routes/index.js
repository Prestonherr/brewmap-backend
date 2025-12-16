const express = require("express");
const { celebrate, Joi } = require("celebrate");
const { createUser, login } = require("../controllers/users");
const usersRouter = require("./users");
const coffeeShopsRouter = require("./coffeeShops");

const router = express.Router();

// Validation schemas
const registerSchema = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    name: Joi.string().min(2).max(30).required(),
    username: Joi.string()
      .min(3)
      .max(30)
      .pattern(/^[a-z0-9_]+$/)
      .optional(),
  }),
};

const loginSchema = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

// Auth routes at root level
router.post("/signup", celebrate(registerSchema), createUser);
router.post("/signin", celebrate(loginSchema), login);

// User routes
router.use("/users", usersRouter);

// Coffee shop routes
router.use("/coffee-shops", coffeeShopsRouter);

module.exports = router;
