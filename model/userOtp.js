const mongoose = require("mongoose");

const otpSChema = new mongoose.Schema({
    username:String,
    phone:String,
    otp:String,
    otpExpiration:Date,
});

module.exports = mongoose.model("otpUser", otpSChema);