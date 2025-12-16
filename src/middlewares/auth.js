const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const UnauthorizedError = require("../errors/UnauthorizedError");

const auth = (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authorization required");
    }

    const token = authorization.replace("Bearer ", "");

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = payload;
      next();
    } catch (error) {
      throw new UnauthorizedError("Invalid token");
    }
  } catch (error) {
    next(error);
  }
};

module.exports = auth;
