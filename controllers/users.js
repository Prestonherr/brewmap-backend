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
        return User.findOne({
          email: {
            $regex: new RegExp(
              `^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
              "i",
            ),
          },
        }).select("+password");
      }
      return user;
    })
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError("Invalid email or password");
      }

      if (!user.password) {
        throw new UnauthorizedError("Invalid email or password");
      }

      const passwordToCompare = String(password);

      // Debug: Log password comparison attempt (remove in production)
      if (process.env.NODE_ENV === "development") {
        console.log("Login attempt:", {
          email: normalizedEmail,
          passwordLength: passwordToCompare.length,
          hasPasswordHash: !!user.password,
          hashLength: user.password ? user.password.length : 0,
        });
      }

      return user.comparePassword(passwordToCompare).then((isMatch) => {
        if (process.env.NODE_ENV === "development") {
          console.log("Password match result:", isMatch);
        }

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
      // If it's already a custom error, pass it through
      if (error.statusCode) {
        return next(error);
      }
      // Otherwise, it's an unexpected error
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
      // Use findById + save so Mongoose pre-save hooks run (password hashing)
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
