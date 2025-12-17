const { AppError, BAD_REQUEST } = require("./app-error");

class BadRequestError extends AppError {
  constructor(message = "Bad Request") {
    super(message, BAD_REQUEST);
  }
}

module.exports = BadRequestError;
