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
      type: mongoose.Schema.Types.Mixed,
      default: function () {
        return {};
      },
    },
    osmId: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

coffeeShopSchema.index({ owner: 1 });

module.exports = mongoose.model("CoffeeShop", coffeeShopSchema);
