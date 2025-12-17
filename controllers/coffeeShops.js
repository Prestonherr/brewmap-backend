const CoffeeShop = require("../models/coffeeShop");
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} = require("../utils/errors");

const getCoffeeShops = (req, res, next) => {
  const userId = req.user.userId;
  CoffeeShop.find({ owner: userId })
    .sort({ createdAt: -1 })
    .then((coffeeShops) => {
      res.json(coffeeShops);
    })
    .catch((error) => {
      next(error);
    });
};

const createCoffeeShop = (req, res, next) => {
  const userId = req.user.userId;
  const { name, address, lat, lon, distance, tags, osmId } = req.body;

  if (!name || lat === undefined || lon === undefined) {
    return next(
      new BadRequestError("Name, latitude, and longitude are required"),
    );
  }

  CoffeeShop.create({
    owner: userId,
    name,
    address,
    lat,
    lon,
    distance,
    tags,
    osmId,
  })
    .then((coffeeShop) => {
      res.status(201).json(coffeeShop);
    })
    .catch((error) => {
      if (error.name === "ValidationError") {
        next(new BadRequestError("Invalid input data"));
      } else if (error.name === "CastError") {
        next(new BadRequestError("Invalid data format"));
      } else {
        next(error);
      }
    });
};

const deleteCoffeeShop = (req, res, next) => {
  const userId = req.user.userId;
  const { coffeeShopId } = req.params;

  CoffeeShop.findById(coffeeShopId)
    .then((coffeeShop) => {
      if (!coffeeShop) {
        throw new NotFoundError("Coffee shop not found");
      }

      if (coffeeShop.owner.toString() !== userId) {
        throw new ForbiddenError(
          "You don't have permission to delete this coffee shop",
        );
      }

      return CoffeeShop.findByIdAndDelete(coffeeShopId);
    })
    .then(() => {
      res.json({ message: "Coffee shop deleted successfully" });
    })
    .catch((error) => {
      if (error.name === "CastError") {
        next(new BadRequestError("Invalid coffee shop ID format"));
      } else {
        next(error);
      }
    });
};

module.exports = {
  getCoffeeShops,
  createCoffeeShop,
  deleteCoffeeShop,
};
