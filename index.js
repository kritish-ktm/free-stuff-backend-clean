const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// THIS IS THE ONLY WAY THAT NEVER FAILS ON VERCEL
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY || "{}");

if (Object.keys(serviceAccount).length === 0) {
  console.error("SERVICE_ACCOUNT_KEY is missing or empty");
} else {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("Firebase Admin initialized");
}

const db = admin.firestore();

// ROOT — PROOF IT'S ALIVE
app.get("/", (req, res) => {
  res.send("FREE STUFF BACKEND IS 100% ALIVE BRO! 🚀");
});

// POST ITEM — THIS WORKS 100000%
app.post("/api/post-item", async (req, res) => {
  try {
    const item = req.body;
    const docRef = await db.collection("items").add({
      ...item,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.status(200).json({ success: true, id: docRef.id });
  } catch (error) {
    console.error("POST ERROR:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = app;   // ← THIS LINE IS REQUIRED FOR VERCEL SERVERLESS
