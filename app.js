const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const localStrategy = require("passport-local");
const path = require('path')
const cors = require("cors");
const fetch = require("node-fetch");
const User = require("./model/userModel");
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

app.use(
  require("express-session")({
    secret: "Rusty is a dog",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const coordinateSchema = new mongoose.Schema({
  timestamp: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  status: { type: String, required: true },
});

const Coordinate = mongoose.model("Coordinate", coordinateSchema);

app.post("/coordinates", async (req, res) => {
  try {
    const { timestamp, latitude, longitude, status } = req.body;

    // Use OpenCage Geocoding API to get the address based on coordinates
    const apiKey = "8445ebdd3f804923af05ca3a9aeb0984";
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?key=${apiKey}&q=${latitude}+${longitude}&pretty=1`
    );
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const address = data.results[0].formatted;
      const newCoordinate = new Coordinate({
        timestamp,
        latitude,
        longitude,
        status,
        address,
      });
      await newCoordinate.save();
      res.json(newCoordinate);
    } else {
      res.status(404).json({ error: "Location not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.post("/register", async (req, res) => {
  try {
    if (!req.body.email) {
      throw new Error("Email is required");
    }

    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      throw new Error("Username is already taken");
    }

    const user = await User.create({
      fullName: req.body.fullName,
      email: req.body.email,
      username: req.body.username, // Use email as the username
      phoneNumber: req.body.phoneNumber,
      address: req.body.address,
      DateOfBirth: req.body.DateOfBirth,
      permanentAddress: req.body.permanentAddress,
    });

    console.log("User created:", user);

    res.status(201).send({ message: "User registered successfully", user });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).send({ error: error.message, stack: error.stack });
  }
});

app.post("/login", async (req, res) => {
  try {
    console.log("Login route reached");
    console.log("Email:", req.body.email);
    console.log("PhoneNumber:", req.body.phoneNumber);

    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (user) {
      const result = req.body.phoneNumber === user.phoneNumber;
      if (result) {
        res.status(200).json({ message: "Login successful" });
      } else {
        res.status(400).json({ error: "PhoneNumber does not match" });
      }
    } else {
      res.status(400).json({ error: "User does not exist" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: error.message }); // Send the actual error message
  }
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

