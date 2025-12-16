const mongoose = require("mongoose");

const coffeeShopSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lon: {
      type: Number,
      required: true,
    },
    distance: {
      type: Number,
    },
    tags: {
      type: Object,
      default: {},
    },
    // Store the original OSM ID if it came from Overpass API
    osmId: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient queries by owner
coffeeShopSchema.index({ owner: 1 });

module.exports = mongoose.model("CoffeeShop", coffeeShopSchema);
