const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// ─────── SAFE FIREBASE INITIALIZATION (THIS FIXES THE 500) ───────
let db = null;

if (process.env.SERVICE_ACCOUNT_KEY) {
  try {
    const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    db = admin.firestore();
    console.log("Firebase initialized successfully");
  } catch (error) {
    console.error("Firebase init error:", error.message);
  }
} else {
  console.error("Missing SERVICE_ACCOUNT_KEY");
}

// ─────── ROOT ROUTE ───────
app.get("/", (req, res) => {
  res.send("FREE STUFF BACKEND IS 100% ALIVE BRO!");
});

// ─────── POST ITEM ROUTE ───────
app.post("/api/post-item", async (req, res) => {
  if (!db) {
    return res.status(500).json({ success: false, error: "Firebase not ready" });
  }
  try {
    const item = req.body;
    console.log("Received item:", item); // Log what you're getting
    
    const docRef = await db.collection("items").add({
      name: item.name,
      price: item.price,
      description: item.description,
      category: item.category,
      condition: item.condition,
      location: item.location,
      image: item.image,
      postedBy: item.postedBy,
      postedByName: item.postedByName,
      postedByEmail: item.postedByEmail,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    res.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error("Save error:", error); // This will show in Vercel logs
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─────── THIS LINE IS REQUIRED FOR VERCEL ───────
module.exports = app;

