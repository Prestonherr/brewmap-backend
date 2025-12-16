const { NODE_ENV = "development" } = process.env;
const BadRequestError = require("../errors/BadRequestError");
const NotFoundError = require("../errors/NotFoundError");

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle MongoDB CastError (invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  // Handle MongoDB ValidationError (if not already handled)
  if (err.name === "ValidationError" && !err.statusCode) {
    statusCode = 400;
    message = "Invalid input data";
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Ensure we never expose database or Node.js errors directly
  // If it's not a custom error, return generic 500 error
  if (statusCode === 500 && !err.statusCode) {
    message = "Internal Server Error";
  }

  const response = {
    error: {
      message,
      ...(NODE_ENV === "development" && { stack: err.stack }),
    },
  };

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
