const mongoose = require("mongoose");

const coordinate = new mongoose.Schema({
  latitude: Number,
  longitude: Number,
});

const Coordinate = mongoose.model("coordinate",coordinate);
module.exports = Coordinate