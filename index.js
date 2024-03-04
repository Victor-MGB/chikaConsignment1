const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require('path')
const cors = require("cors");
const casual = require("casual");
const jwt = require("jsonwebtoken")
const User = require("./model/userModel");
const Parcel = require("./model/parcelModel");
const otpRoutes = require('./routes/otpAuth')
const goldData = require("./newgold/goldData");
require("dotenv").config();

const app = express();


app.use(cors()); // Enable CORS

app.use("/goldcollections",express.static(path.join(__dirname,"goldcollections")))


mongoose.connect(process.env.DB_CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", (error) => {
  console.error("MongoDb connection error:", error);
});

db.once("open", () => {
  console.log("connected to mongoDb");
});

const PORT = process.env.PORT || 4000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



const coordinateSchema = new mongoose.Schema({
  timestamp: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  status: { type: String, required: true },
  address: { type: String, required: true },
});

const Coordinate = mongoose.model("Coordinate", coordinateSchema);

const trackingDataStore = {};

function getRandomNumberInRange(min, max) {
  return Math.random() * (max - min) + min;
}

// Function to get a random status from a predefined list
function getRandomStatus() {
  const statuses = ["In transit", "Out for delivery", "Delivered"];
  return casual.random_element(statuses);
}

// Function to generate fake tracking data
function generateFakeTrackingData() {
  const latitude = getRandomNumberInRange(30.0, 40.0);
  const longitude = getRandomNumberInRange(-120.0, -100.0);
  const timestamp = casual.moment.toISOString();
  const status = getRandomStatus();

  return { timestamp, latitude, longitude, status };
}

// Function to update tracking information for a shipment
function updateTrackingInfo() {
  const trackingData = generateFakeTrackingData();

  // Add a dummy address
  trackingData.address = "123 Main St";

  // Save to MongoDB
  const coordinate = new Coordinate(trackingData);
  coordinate.save((error, savedCoordinate) => {
    if (error) {
      console.error("Error saving tracking information to MongoDB:", error);
    } else {
      trackingDataStore[savedCoordinate._id] = trackingData;
      console.log(`Tracking information saved for shipment ${savedCoordinate._id}:`, trackingData);
    }
  });
}

setInterval(() => {
  updateTrackingInfo();
}, 10000); // Update every 10 seconds

// Define an API endpoint to retrieve tracking information
app.get("/tracking/:shipmentId", async (req, res) => {
  const { shipmentId } = req.params;

  try {
    // Retrieve tracking information from MongoDB
    const trackingData = await Coordinate.findOne({ _id: shipmentId });

    if (trackingData) {
      res.json({
        success: true,
        message: "Tracking information retrieved successfully",
        data: trackingData,
      });
    } else {
      res
        .status(404)
        .json({ success: false, error: "Tracking information not found" });
    }
  } catch (error) {
    console.error("Error retrieving tracking information from MongoDB:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

app.get('/parcels', async (req, res) => {
  try {
    const parcels = await Parcel.find();
    res.json(parcels);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add a new parcel
app.post('/parcels', async (req, res) => {
  try {
    const newParcel = req.body;
    const parcel = new Parcel(newParcel);
    await parcel.save();
    res.json(parcel);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update the price of a parcel
app.put('/parcels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;

    const updatedParcel = await Parcel.findByIdAndUpdate(
      id,
      { $set: { price } },
      { new: true }
    );

    if (updatedParcel) {
      res.json(updatedParcel);
    } else {
      res.status(404).json({ error: 'Parcel not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Registration Route
app.post("/register", (req, res) => {
  const { email, phonenumber } = req.body;

  User.findOne({ email: email })
    .then((user) => {
      if (user) {
        res.json("Already exist");
      } else {
        User.create(req.body)
          .then((newUser) => {
            // Generate and send a JWT token upon successful registration with expiration time (e.g., 1 day)
            const token = jwt.sign(
              { userId: newUser._id },
              process.env.SECRETE_KEY,
              {
                expiresIn: "1d",
              }
            );
            res.json({ success: true, token: token });
          })
          .catch((err) => res.json(err));
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json("Internal Server Error");
    });
});


// Login Route
app.post("/login", (req, res) => {
  const { email, phonenumber } = req.body;

  User.findOne({ email: email })
    .then((user) => {
      if (user) {
        if (user.phonenumber === phonenumber) {
          // Generate and send a JWT token upon successful login with expiration time (e.g., 1 day)
          const token = jwt.sign({ userId: user._id },process.env.SECRETE_KEY, {
            expiresIn: "1d",
          });
          res.json({ success: true, token: token });
        } else {
          res.json({ success: false, message: "Wrong phonenumber" });
        }
      } else {
        res.json({ success: false, message: "No record" });
      }
    })
    .catch((err) => {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    });
});


app.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.use("/authotp", otpRoutes);

app.get("/getgold",(req,res)=>{
    res.json(goldData)
})

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});

