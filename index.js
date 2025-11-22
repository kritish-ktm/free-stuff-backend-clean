const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();

// THIS IS THE FINAL CORS — WORKS FOR LOCAL + LIVE FOREVER
app.use(cors({
  origin: [
    "http://localhost:3000",                          // for you testing now
    "https://free-stuff-nielsbrock.vercel.app",       // your final live frontend URL
    "https://free-stuff-nielsbrock-clean.vercel.app"  // just in case
  ],
  credentials: true
}));

app.use(express.json());

const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

app.post("/api/post-item", async (req, res) => {
  try {
    const data = req.body;
    const docRef = await db.collection("items").add({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Backend running on port ${port}`));
const app = express();

// THIS LINE FIXES CORS ERROR
app.use(cors({ origin: "*" }));

app.use(express.json());

// READ SECRET KEY FROM ENVIRONMENT (Vercel/Railway)
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// YOUR POST ITEM ENDPOINT
app.post("/api/post-item", async (req, res) => {
  try {
    const data = req.body;
    const docRef = await db.collection("items").add({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});

