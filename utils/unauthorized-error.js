const { AppError, UNAUTHORIZED } = require("./app-error");

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, UNAUTHORIZED);
  }
}

module.exports = UnauthorizedError;
