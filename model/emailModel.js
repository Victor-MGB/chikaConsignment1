const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema({
  title: String,
  message: String,
  email: String,
});

const Email = mongoose.model("Email", emailSchema);

module.exports = { Email };
