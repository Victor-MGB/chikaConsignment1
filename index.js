const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require('path')
const cors = require("cors");
const fetch = require("node-fetch");
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

//parecel

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


// Assuming you have an instance of Express named 'app'
app.post('/register', (req, res) => {
   const { email, phonenumber } = req.body;

   User.findOne({ email: email })
      .then(user => {
         if (user) {
            res.json("Already exist");
         } else {
            User.create(req.body)
               .then(courier => res.json(courier))
               .catch(err => res.json(err));
         }
      })
      .catch(err => {
         console.error(err);
         res.status(500).json("Internal Server Error");
      });
});



app.post('/login', (req, res) => {
   const { email, phonenumber } = req.body;
   User.findOne({ email: email })
      .then(user => {
         if (user) {
            if (user.phonenumber === phonenumber) {
               res.json("successful");
            } else {
               res.json("wrong phonenumber");
            }
         } else {
            res.json("no record");
         }
      })
      .catch(err => {
         console.error(err);
         res.status(500).json("Internal Server Error");
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

