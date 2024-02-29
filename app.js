const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const localStrategy = require("passport-local");
const path = require('path')
const cors = require("cors");
const User = require("./model/userModel");
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

// You might want to serve HTML files for registration and login instead of rendering them
// app.get("/register", function (req, res) {
//   res.render("register");
// });

app.post("/register", async (req, res) => {
  try {

    if (!req.body.email) {
      throw new Error("Username is required");
    }

    const user = await User.create({
      fullName: req.body.name,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      address:req.body.address,
      shipmentType:req.body.shipmentType,
      companyName:req.body.companyName,
      companyAddress:req.body.companyAddress,
      companyPhoneNumber:req.body.companyPhoneNumber,
      companyRegistrationNumber:req.body.companyRegistrationNumber
    });

    console.log("User created:", user);

    res.status(201).send({ message: "User registered successfully", user });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send({ error: error.message }); // Send the actual error message
  }
});

app.post("/login", async (req, res) => {
  try {
    console.log("Login route reached");
    console.log("Email:", req.body.email);
    console.log("PhoneNumber:", req.body.phoneNumber);

    const user = await User.findOne({ Email: req.body.email });
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
