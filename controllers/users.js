const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { JWT_SECRET } = require("../utils/config");
const {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} = require("../utils/errors");

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
};

const createUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Check if username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw new ConflictError("Username already taken");
    }

    // Create new user
    const user = await User.create({ username, password });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
      },
      token,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      next(new BadRequestError("Invalid input data"));
    } else if (error.code === 11000) {
      // MongoDB duplicate key error
      next(new ConflictError("Username already exists"));
    } else {
      next(error);
    }
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new BadRequestError("Username and password are required");
    }

    // Find user and include password for comparison
    const user = await User.findOne({ username }).select("+password");
    if (!user) {
      throw new UnauthorizedError("Invalid username or password");
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid username or password");
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      user: {
        id: user._id,
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
    const { username, password } = req.body;
    const userId = req.user.userId;

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
    if (username) updateData.username = username;
    if (password) updateData.password = password; // Will be hashed by pre-save hook

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
      next(new ConflictError("Username already exists"));
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
