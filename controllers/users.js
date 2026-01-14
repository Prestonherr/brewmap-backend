const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { JWT_SECRET } = require("../utils/config");
const {
  NOT_FOUND,
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} = require("../utils/errors");

const createUser = (req, res, next) => {
  const { email, name, password } = req.body;

  const normalizedEmail = email.toLowerCase().trim();

  User.findOne({ email: normalizedEmail })
    .then((existingUser) => {
      if (existingUser) {
        throw new ConflictError("Email already registered");
      }

      const newUser = new User({
        email: normalizedEmail,
        name: name.trim(),
        password: String(password),
      });

      return newUser.save();
    })
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });

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
      if (error.statusCode) {
        return next(error);
      }

      if (error.name === "ValidationError") {
        next(new BadRequestError("Invalid input data"));
      } else if (error.code === 11000) {
        const duplicateField = error.keyPattern
          ? Object.keys(error.keyPattern)[0]
          : "field";

        if (duplicateField === "email") {
          next(new ConflictError("Email already exists"));
        } else {
          next(new ConflictError(`Duplicate ${duplicateField}`));
        }
      } else {
        console.error("Unexpected registration error:", error);
        next(error);
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError("Email and password are required"));
  }

  const normalizedEmail = email.toLowerCase().trim();

  User.findOne({ email: normalizedEmail })
    .select("+password")
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError("Incorrect email or password");
      }
      return user.comparePassword(password).then((isPasswordCorrect) => {
        if (!isPasswordCorrect) {
          throw new UnauthorizedError("Incorrect email or password");
        }
        return user;
      });
    })
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      return res.status(200).json({
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      });
    })
    .catch((error) => {
      if (error.statusCode) {
        return next(error);
      }
      next(new UnauthorizedError("Incorrect email or password"));
    });
};

const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
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

const updateUser = (req, res, next) => {
  const { name, email, password } = req.body;
  const userId = req.user._id;

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
      return User.findById(userId);
    })
    .then((user) => {
      if (!user) {
        throw new NotFoundError("User not found");
      }

      if (name) user.name = name;
      if (email) user.email = email;
      if (password) user.password = String(password);

      return user.save();
    })
    .then((user) => {
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
