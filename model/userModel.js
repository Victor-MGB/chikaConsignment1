const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const CourierSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  username: String, 
  phoneNumber: String,
  address: String,
  DateOfBirth: String,
  permanentAddress: String,
});

CourierSchema.plugin(passportLocalMongoose, { usernameField: "email" });

const Courier = mongoose.model("Courier", CourierSchema);
module.exports = Courier;
