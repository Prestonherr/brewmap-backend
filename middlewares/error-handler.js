const { INTERNAL_SERVER_ERROR } = require("../utils/errors");

module.exports = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || INTERNAL_SERVER_ERROR;
  const message =
    statusCode === INTERNAL_SERVER_ERROR
      ? "An error has occurred on the server"
      : err.message || "An error has occurred";

  res.status(statusCode).send({ message });
};
