const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const casual = require("casual");
const jwt = require("jsonwebtoken");
const Coordinate = require("./model/cordinate");
const User = require("./model/userModel");
const Parcel = require("./model/parcelModel");
const otpRoutes = require("./routes/otpAuth");
const goldData = require("./newgold/goldData");
require("dotenv").config();

const app = express();

app.use(cors()); // Enable CORS

app.use(
  "/goldcollections",
  express.static(path.join(__dirname, "goldcollections"))
);

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

app.post("/store-coordinate", async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    console.log(req.body);
    const newCoordinate = new Coordinate({ latitude, longitude });
    await newCoordinate.save();

    res.status(201).json({
      success: true,
      message: "Coordinate stored successfully.",
      data: {
        /* additional data if needed */
      },
    });

    res.send(req.body);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: {
        /* additional error details if needed */
      },
    });
  }
});

app.get("/get-coordinates", async (req, res) => {
  try {
    const coordinates = await Coordinate.find();
    res.status(200).json({
      success: true,
      message: "Coordinates retrieved successfully.",
      data: { coordinates },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: {
        /* additional error details if needed */
      },
    });
  }
});

app.get("/parcels", async (req, res) => {
  try {
    const parcels = await Parcel.find();
    res.json(parcels);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add a new parcel
app.post("/parcels", async (req, res) => {
  try {
    const newParcel = req.body;
    const parcel = new Parcel(newParcel);
    await parcel.save();
    res.json(parcel);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update the price of a parcel
app.put("/parcels/:id", async (req, res) => {
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
      res.status(404).json({ error: "Parcel not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Registration Route
app.post("/register", (req, res) => {
  const { email, phonenumber } = req.body;

  User.findOne({ email: email })
    .then((user) => {
      if (user) {
        res.json({ success: false, message: "Email already exists" });
      } else {
        User.create(req.body)
          .then((newUser) => {
            // Generate and send a JWT token upon successful registration with expiration time (e.g., 1 day)
            const token = jwt.sign(
              { userId: newUser._id },
              process.env.SECRET_KEY,
              {
                expiresIn: "1d",
              }
            );
            res.json({
              success: true,
              token: token,
              message: "Registration successful",
            });
          })
          .catch((err) => {
            if (err.code === 11000) {
              // Duplicate key violation for username
              res.json({
                success: false,
                message: "Username already exists",
              });
            } else {
              console.error(err);
              res.status(500).json("Internal Server Error");
            }
          });
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
          const token = jwt.sign(
            { userId: user._id },
            process.env.SECRETE_KEY,
            {
              expiresIn: "1d",
            }
          );
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

app.get("/getgold", (req, res) => {
  res.json(goldData);
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
