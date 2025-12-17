const { AppError, NOT_FOUND } = require("./app-error");

class NotFoundError extends AppError {
  constructor(message = "Not Found") {
    super(message, NOT_FOUND);
  }
}

module.exports = NotFoundError;
