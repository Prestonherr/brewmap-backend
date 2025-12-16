const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { JWT_SECRET } = require("../utils/config");
const BadRequestError = require("../errors/BadRequestError");
const ConflictError = require("../errors/ConflictError");
const UnauthorizedError = require("../errors/UnauthorizedError");
const NotFoundError = require("../errors/NotFoundError");

// Create JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
};

// Register new user
const createUser = async (req, res, next) => {
  try {
    const { email, password, name, username } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    // Check if username is taken (if provided)
    if (username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        throw new ConflictError("Username already taken");
      }
    }

    // Create new user
    const user = await User.create({ email, password, name, username });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
      },
      token,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      next(new BadRequestError("Invalid input data"));
    } else if (error.code === 11000) {
      // MongoDB duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      next(
        new ConflictError(
          `${field === "username" ? "Username" : "Email"} already exists`,
        ),
      );
    } else {
      next(error);
    }
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError("Email and password are required");
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      next(new BadRequestError("Invalid user ID format"));
    } else {
      next(error);
    }
  }
};

// Update user
const updateUser = async (req, res, next) => {
  try {
    const { name, email, username } = req.body;
    const userId = req.user.userId;

    // Check if email is being changed and if it's already taken
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        throw new ConflictError("Email already in use");
      }
    }

    // Check if username is being changed and if it's already taken
    if (username) {
      const existingUsername = await User.findOne({
        username,
        _id: { $ne: userId },
      });
      if (existingUsername) {
        throw new ConflictError("Username already taken");
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (username !== undefined) updateData.username = username || null;

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      next(new BadRequestError("Invalid input data"));
    } else if (error.name === "CastError") {
      next(new BadRequestError("Invalid user ID format"));
    } else if (error.code === 11000) {
      // MongoDB duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      next(
        new ConflictError(
          `${field === "username" ? "Username" : "Email"} already exists`,
        ),
      );
    } else {
      next(error);
    }
  }
};

module.exports = {
  createUser,
  login,
  getCurrentUser,
  updateUser,
};
