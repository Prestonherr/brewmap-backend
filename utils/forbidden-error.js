const { AppError, FORBIDDEN } = require("./app-error");

class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, FORBIDDEN);
  }
}

module.exports = ForbiddenError;
