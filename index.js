const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// ─────── SAFE FIREBASE INITIALIZATION ───────
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

app.get("/api/test", (req, res) => {
  console.log("TEST LOG - This should appear in Vercel logs");
  res.json({ message: "If you see the console log, logging works" });
});
/*
// ─────── POST ITEM ROUTE WITH BETTER DEBUGGING ───────
app.post("/api/post-item", async (req, res) => {
  console.log("=== POST /api/post-item ===");
  console.log("Request body:", JSON.stringify(req.body, null, 2));

  if (!db) {
    console.error("Firebase DB is null!");
    return res.status(500).json({ 
      success: false, 
      error: "Firebase not initialized" 
    });
  }

  try {
    const item = req.body;

    // Validate required fields
    if (!item.name || !item.description) {
      return res.status(400).json({ 
        success: false, 
        error: "Name and description are required" 
      });
    }

    console.log("Attempting to save item to Firestore...");

    const docRef = await db.collection("items").add({
      name: item.name,
      price: item.price || 0,
      description: item.description,
      category: item.category || "General",
      condition: item.condition || "Good",
      location: item.location || "Niels Brock",
      image: item.image || null,
      postedBy: item.postedBy,
      postedByName: item.postedByName || "Anonymous",
      postedByEmail: item.postedByEmail,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("✓ Item saved successfully with ID:", docRef.id);
    res.json({ 
      success: true, 
      id: docRef.id,
      message: "Item posted successfully"
    });

  } catch (error) {
    console.error("=== FIREBASE ERROR ===");
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    console.error("Full error:", error);
    
    res.status(500).json({ 
      success: false, 
      error: error.message,
      code: error.code
    });
  }
});

// ─────── REQUIRED FOR VERCEL ───────
module.exports = app;

*/
