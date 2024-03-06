const mongoose = require("mongoose");

const coordinate = new mongoose.Schema({
  lat: Number,
  lon: Number,
});

const Coordinate = mongoose.model("coordinate",coordinate);
module.exports = Coordinate