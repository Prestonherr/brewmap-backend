const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const { errors } = require("celebrate");
const routes = require("./routes");
const { createUser, login } = require("./controllers/users");
const {
  validateCreateUserBody,
  validateLoginBody,
} = require("./middlewares/validation");
const errorHandler = require("./middlewares/error-handler");
const { requestLogger, errorLogger } = require("./middlewares/logger");

const app = express();
const { PORT = 3001 } = process.env;

app.use(express.json());

mongoose
  .connect("mongodb://127.0.0.1:27017/brewmap")
  .then(() => {})
  .catch(console.error);

app.use(cors());

app.use(requestLogger);

app.post("/api/signin", validateLoginBody, login);
app.post("/api/signup", validateCreateUserBody, createUser);

app.use("/api", routes);

// Handle 404 for API routes
app.use("/api/*", (req, res, next) => {
  const { NotFoundError } = require("./utils/errors");
  next(new NotFoundError("The requested resource was not found"));
});

app.use(errorLogger);

app.use(errors());

app.use(errorHandler);

app.listen(PORT, () => {});
