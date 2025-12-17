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

const createUser = (req, res, next) => {
  const { email, name, password } = req.body;

  User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        throw new ConflictError("Email already registered");
      }

      return User.create({ email, name, password });
    })
    .then((user) => {
      const token = generateToken(user._id);

      res.status(201).json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
        token,
      });
    })
    .catch((error) => {
      if (error.name === "ValidationError") {
        next(new BadRequestError("Invalid input data"));
      } else if (error.code === 11000) {
        // MongoDB duplicate key error
        next(new ConflictError("Email already exists"));
      } else {
        next(error);
      }
    });
};

// Login user
const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError("Email and password are required"));
  }

  User.findOne({ email })
    .select("+password")
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError("Invalid email or password");
      }

      return user.comparePassword(password).then((isMatch) => {
        if (!isMatch) {
          throw new UnauthorizedError("Invalid email or password");
        }

        const token = generateToken(user._id);

        res.json({
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
          },
          token,
        });
      });
    })
    .catch((error) => {
      next(error);
    });
};

// Get current user
const getCurrentUser = (req, res, next) => {
  User.findById(req.user.userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError("User not found");
      }

      res.json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      });
    })
    .catch((error) => {
      if (error.name === "CastError") {
        next(new BadRequestError("Invalid user ID format"));
      } else {
        next(error);
      }
    });
};

// Update user
const updateUser = (req, res, next) => {
  const { name, email, password } = req.body;
  const userId = req.user.userId;

  const checkEmail = () => {
    if (!email) {
      return Promise.resolve();
    }

    return User.findOne({
      email,
      _id: { $ne: userId },
    }).then((existingEmail) => {
      if (existingEmail) {
        throw new ConflictError("Email already taken");
      }
    });
  };

  checkEmail()
    .then(() => {
      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (password) updateData.password = password; // Will be hashed by pre-save hook

      return User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      });
    })
    .then((user) => {
      if (!user) {
        throw new NotFoundError("User not found");
      }

      res.json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      });
    })
    .catch((error) => {
      if (error.name === "ValidationError") {
        next(new BadRequestError("Invalid input data"));
      } else if (error.name === "CastError") {
        next(new BadRequestError("Invalid user ID format"));
      } else if (error.code === 11000) {
        // MongoDB duplicate key error
        next(new ConflictError("Email already exists"));
      } else {
        next(error);
      }
    });
};

module.exports = {
  createUser,
  login,
  getCurrentUser,
  updateUser,
};
