const { INTERNAL_SERVER_ERROR } = require("../utils/errors");

module.exports = (err, req, res, next) => {
  console.error(err);

  let statusCode = err.statusCode || INTERNAL_SERVER_ERROR;
  let message =
    statusCode === INTERNAL_SERVER_ERROR
      ? "An error has occurred on the server"
      : err.message || "An error has occurred";

  if (err.isCelebrate) {
    statusCode = 400;
    const details =
      err.details.get("body") ||
      err.details.get("params") ||
      err.details.get("query");
    if (details && details.details && details.details.length > 0) {
      message = details.details[0].message || "Validation error";
    } else {
      message = "Validation error";
    }
  }

  res.status(statusCode).json({ error: { message } });
};
