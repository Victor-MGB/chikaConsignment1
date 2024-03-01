const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const CourierSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true }, // Make email field unique
  phoneNumber: String,
  address: String,
  shipmentType: String,
  companyName: String,
  companyAddress: String,
  companyPhoneNumber: String,
  companyRegistrationNumber: String,
  username:String
});

// Add the following line to specify 'email' as the username field
CourierSchema.plugin(passportLocalMongoose, { usernameField: "email" });

const Courier = mongoose.model("Courier", CourierSchema);
module.exports = Courier;
