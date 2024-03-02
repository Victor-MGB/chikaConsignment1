const mongoose = require("mongoose");

const ParcelSchema = mongoose.Schema({
  sender: String,
  recipient: String,
  weight: String,
  destination: String,
  price: Number,
});

const Parcel = mongoose.model("parcel", ParcelSchema);
module.exports = Parcel;