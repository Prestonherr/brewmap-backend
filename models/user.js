const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (value) => validator.isEmail(value),
        message: "Invalid email format",
      },
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  if (
    this.password &&
    this.password.startsWith("$2") &&
    this.password.length === 60
  ) {
    return;
  }

  const passwordToHash = this.password;
  if (!passwordToHash) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(passwordToHash, salt);
  this.password = hash;
});

// Instance method to compare passwords
userSchema.methods.comparePassword = function (candidatePassword) {
  // Ensure both are strings
  const candidate = String(candidatePassword);
  const hashed = String(this.password);

  // Both should be non-empty
  if (!candidate || !hashed) {
    return Promise.resolve(false);
  }

  return bcrypt.compare(candidate, hashed);
};

module.exports = mongoose.model("User", userSchema);
