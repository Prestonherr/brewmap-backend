const CoffeeShop = require("../models/coffeeShop");
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} = require("../utils/errors");

const getCoffeeShops = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const coffeeShops = await CoffeeShop.find({ owner: userId }).sort({
      createdAt: -1,
    });

    res.json(coffeeShops);
  } catch (error) {
    next(error);
  }
};

const createCoffeeShop = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { name, address, lat, lon, distance, tags, osmId } = req.body;

    if (!name || lat === undefined || lon === undefined) {
      throw new BadRequestError("Name, latitude, and longitude are required");
    }

    const coffeeShop = await CoffeeShop.create({
      owner: userId,
      name,
      address,
      lat,
      lon,
      distance,
      tags,
      osmId,
    });

    res.status(201).json(coffeeShop);
  } catch (error) {
    if (error.name === "ValidationError") {
      next(new BadRequestError("Invalid input data"));
    } else if (error.name === "CastError") {
      next(new BadRequestError("Invalid data format"));
    } else {
      next(error);
    }
  }
};

const deleteCoffeeShop = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { coffeeShopId } = req.params;

    const coffeeShop = await CoffeeShop.findById(coffeeShopId);

    if (!coffeeShop) {
      throw new NotFoundError("Coffee shop not found");
    }

    if (coffeeShop.owner.toString() !== userId) {
      throw new ForbiddenError(
        "You don't have permission to delete this coffee shop",
      );
    }

    await CoffeeShop.findByIdAndDelete(coffeeShopId);

    res.json({ message: "Coffee shop deleted successfully" });
  } catch (error) {
    if (error.name === "CastError") {
      next(new BadRequestError("Invalid coffee shop ID format"));
    } else {
      next(error);
    }
  }
};

module.exports = {
  getCoffeeShops,
  createCoffeeShop,
  deleteCoffeeShop,
};
