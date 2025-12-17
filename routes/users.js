const express = require("express");
const { getCurrentUser, updateUser } = require("../controllers/users");
const auth = require("../middlewares/auth");
const { validateUpdateUserBody } = require("../middlewares/validation");

const router = express.Router();

// Routes
router.get("/me", auth, getCurrentUser);
router.patch("/me", auth, validateUpdateUserBody, updateUser);

module.exports = router;
