const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const CourierSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phoneNumber: String,
  address:String,
  shipmentType:String,
  companyName:String,
  companyAddress:String,
  companyPhoneNumber:String,
  companyRegistrationNumber:String,
});

CourierSchema.plugin(passportLocalMongoose);

const Courier = mongoose.model("Courier", CourierSchema); 
module.exports = Courier;
