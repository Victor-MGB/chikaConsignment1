const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require('path')
const cors = require("cors");
const casual = require("casual");
const jwt = require("jsonwebtoken")
const webPush = require("web-push");
const nodemailer = require("nodemailer");
const Email = require('./model/emailModel')
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

const Coordinate = mongoose.model('Coordinate', coordinateSchema);

// Create a Mock Data Generator
function generateFakeTrackingData(shipmentId) {
  // Simulate movement by generating coordinates
  const latitude = casual.latitude;
  const longitude = casual.longitude;

  // Generate a timestamp for the current time
  const timestamp = new Date().toISOString();

  // Generate a random status for the shipment (e.g., "In transit", "Delivered")
  const status = casual.random_element(['In transit', 'Delivered']);

  // Generate a fake address
  const address = casual.address;

  return { shipmentId, timestamp, latitude, longitude, status, address };
}

// Set Up a Timer or Interval (not included, you can add as needed)

// Update Tracking Information
app.get('/tracking/:shipmentId', async (req, res) => {
  const shipmentId = req.params.shipmentId;

  try {
    // Fetch tracking data from the MongoDB database
    const trackingData = await Coordinate.findOne({ shipmentId });

    // If tracking data not found, generate fake data (for testing purposes)
    if (!trackingData) {
      const fakeData = generateFakeTrackingData(shipmentId);
      res.json(fakeData);
    } else {
      res.json(trackingData);
    }
  } catch (error) {
    console.error('Error fetching tracking data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/send-email/:subject', async (req, res) => {
  const { to, body } = req.body;
  const subject = req.params.subject || 'Default Subject';

  try {
    // Send email
    await transporter.sendMail({
      from: "mgbemenaosonduv@gmail.com",
      to: "aztop29@gmail.com",
      subject: "test mail",
      text: "nodejs testing mail",
    });

    // Save to MongoDB
    await Email.create({ to, subject, body });

    res.status(200).json({ success: true, message: 'Email sent and notification saved.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error sending email and saving notification.' });
  }
});

app.post('/send-push-notification', async (req, res) => {
  const { subscription, message } = req.body;

  try {
    // Send push notification
    await webpush.sendNotification(subscription, JSON.stringify({ title: 'Push Notification', body: message }));

    // Save to MongoDB
    await Email.create({ to: 'Push Notification', subject: 'Push Notification', body: message });

    res.status(200).json({ success: true, message: 'Push notification sent and saved.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error sending push notification and saving notification.' });
  }
});

// const transporter = nodemailer.createTransport({
//   host: "Gmail",
//   auth: {
//     user: process.env.USER ,
//     pass: process.env.PASSWORD,
//   },
// });

// const publicKey = process.env.PUBLIC_KEY;
// const privateKey = process.env.PRIVATE_KEY;

// webPush.setVapidDetails(
//   "mailto:mgbemeosonduv@gmail.com",
//   publicKey,
//   privateKey
// );

// app.post("/send-email", async (req, res) => {
//   try {
//     const { to, subject, body } = req.body;

//     // Save email to MongoDB
//     const newEmail = new Email({ to, subject, body });
//     await newEmail.save();

//     // Send email
//     await transporter.sendMail({
//       from: "mgbemeosonduv@gmail.com",
//       to:"aztop29@gmail.com",
//       subject:"hello victor",
//       text: "text email sent"
//     });

//     res.status(200).json({ message: "Email sent successfully!" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });


app.post("/subscribe", async (req, res) => {
  try {
    const subscription = req.body;

    const payload = JSON.stringify({
      title: "Hello world",
      body: "This is your first notification",
    });

    await webPush.sendNotification(subscription, payload);

    res
      .status(201)
      .json({ success: true, message: "Push notification sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
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

