const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const { UnauthorizedError } = require("../utils/errors");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Authorization required"));
  }

  const token = authorization.replace("Bearer ", "");

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      return next(new UnauthorizedError("Authorization required"));
    }

    req.user = payload;
    next();
  });
};
