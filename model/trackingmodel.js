const mongoose = require("mongoose");

const TrackingUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  trackingCode: {
    type: String,
    unique: true,
  },
});

const UserTracking = mongoose.model("Trackings", TrackingUserSchema);

module.exports = UserTracking;
