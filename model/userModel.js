const mongoose = require("mongoose");

const CourierSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  username: String, 
  phonenumber: String,
  address: String,
  DateOfBirth: String,
  permanentAddress: String,
});

const Courier = mongoose.model("Courier", CourierSchema);
module.exports = Courier;
