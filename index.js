const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "50mb" }));

let db = null;

try {
  if (!process.env.SERVICE_ACCOUNT_KEY) {
    throw new Error("SERVICE_ACCOUNT_KEY not set");
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
  console.error("Firebase init error:", err.message);
}

app.get("/", (req, res) => {
  res.json({ message: "Backend is alive" });
});

app.post("/api/post-item", async (req, res) => {
  try {
    console.log("POST /api/post-item");
    console.log("Request body:", JSON.stringify(req.body));

    if (!db) {
      return res.status(500).json({ success: false, error: "DB not ready" });
    }

    const { name, description, price, category, condition, location, image, postedBy, postedByName, postedByEmail } = req.body;

    if (!name || !description) {
      return res.status(400).json({ success: false, error: "Name and description required" });
    }

    const itemData = {
      name,
      description,
      price: Number(price) || 0,
      category: category || "General",
      condition: condition || "Good",
      location: location || "Niels Brock",
      image: image || null,
      postedBy,
      postedByName: postedByName || "Anonymous",
      postedByEmail,
      createdAt: new Date().toISOString(),
    };

    console.log("Saving to Firestore:", itemData);
    const docRef = await db.collection("items").add(itemData);
    console.log("✓ Saved with ID:", docRef.id);

    res.json({ success: true, id: docRef.id });

  } catch (error) {
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    console.error("Full error:", error);
    
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = app;
