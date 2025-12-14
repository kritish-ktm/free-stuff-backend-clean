const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

let db;

if (process.env.SERVICE_ACCOUNT_KEY) {
  try {
    const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    db = admin.firestore();
    console.log("Firebase initialized");
  } catch (error) {
    console.error("Firebase init error:", error.message);
  }
}

app.get("/", (req, res) => {
  res.send("Backend alive");
});

app.post("/api/post-item", async (req, res) => {
  if (!db) {
    return res.status(500).json({ success: false, error: "Firebase not initialized" });
  }

  try {
    const { name, description, price, category, condition, location, image, postedBy, postedByName, postedByEmail } = req.body;

    console.log("Writing to Firestore...");
    console.log("Name:", name);
    console.log("Posted by:", postedBy);

    const docRef = await db.collection("items").doc().set({
      name,
      description,
      price,
      category,
      condition,
      location,
      image,
      postedBy,
      postedByName,
      postedByEmail,
      createdAt: new Date().toISOString(),
    });

    console.log("Success!");
    res.json({ success: true, message: "Item saved" });

  } catch (error) {
    console.error("ERROR:", error.code, error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = app;
