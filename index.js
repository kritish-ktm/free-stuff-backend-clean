console.log("SERVER STARTING...");
console.log("SERVICE_ACCOUNT_KEY env var exists:", !!process.env.SERVICE_ACCOUNT_KEY);
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ─────── FIREBASE INITIALIZATION ───────
let db = null;

try {
  if (!process.env.SERVICE_ACCOUNT_KEY) {
    throw new Error("SERVICE_ACCOUNT_KEY not found");
  }

  const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  
  db = admin.firestore();
  console.log("✓ Firebase initialized");
} catch (err) {
  console.error("Firebase init failed:", err.message);
}

// ─────── TEST ROUTE ───────
app.get("/", (req, res) => {
  res.json({ message: "Backend is alive" });
});

app.get("/api/test", (req, res) => {
  res.json({ 
    success: true, 
    message: "Test endpoint works",
    dbReady: !!db 
  });
});

// ─────── POST ITEM ROUTE ───────
app.post("/api/post-item", async (req, res) => {
  try {
    console.log("POST /api/post-item received");
    console.log("Body:", req.body);

    if (!db) {
      return res.status(500).json({ 
        success: false, 
        error: "Database not initialized" 
      });
    }

    const { name, description, price, category, condition, location, image, postedBy, postedByName, postedByEmail } = req.body;

    // Validation
    if (!name || !description || !postedBy) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing required fields" 
      });
    }

    // Save to Firestore
    const docRef = await db.collection("items").add({
      name: String(name),
      description: String(description),
      price: Number(price) || 0,
      category: String(category) || "General",
      condition: String(condition) || "Good",
      location: String(location) || "Niels Brock",
      image: image ? String(image) : null,
      postedBy: String(postedBy),
      postedByName: String(postedByName) || "Anonymous",
      postedByEmail: String(postedByEmail),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("✓ Saved with ID:", docRef.id);

    return res.status(200).json({ 
      success: true, 
      id: docRef.id,
      message: "Item posted successfully"
    });

  } catch (error) {
    console.error("Error:", error.code, error.message);
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      code: error.code
    });
  }
});

// ─────── 404 handler ───────
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

module.exports = app;


