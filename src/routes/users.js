const express = require("express");
const { celebrate, Joi } = require("celebrate");
const { getCurrentUser, updateUser } = require("../controllers/users");
const auth = require("../middlewares/auth");

const router = express.Router();

// Validation schema
const updateUserSchema = {
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().email(),
    username: Joi.string()
      .min(3)
      .max(30)
      .pattern(/^[a-z0-9_]+$/)
      .allow(null, ""),
  }),
};

// Routes
router.get("/me", auth, getCurrentUser);
router.patch("/me", auth, celebrate(updateUserSchema), updateUser);

module.exports = router;
