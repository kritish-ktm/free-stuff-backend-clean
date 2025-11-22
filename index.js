const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// Firebase initialization
let db;

if (process.env.SERVICE_ACCOUNT_KEY) {
  try {
    const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    db = admin.firestore();
    console.log("Firebase connected successfully");
  } catch (error) {
    console.error("Firebase init failed:", error.message);
  }
} else {
  console.error("No SERVICE_ACCOUNT_KEY found");
}

// ROOT
app.get("/", (req, res) => {
  res.send("Free Stuff Backend is LIVE! 🚀");
});

// TEST ENDPOINT
app.get("/api/test", (req, res) => {
  res.json({ 
    success: true, 
    message: "Test endpoint works",
    dbReady: !!db 
  });
});

// POST ITEM
app.post("/api/post-item", async (req, res) => {
  if (!db) {
    return res.status(500).json({ success: false, error: "Firebase not initialized" });
  }

  try {
    const data = req.body;
    const docRef = await db.collection("items").add({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error("Error saving item:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export for Vercel
module.exports = app;
