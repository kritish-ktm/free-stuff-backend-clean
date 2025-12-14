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
    console.log("✓ Firebase initialized");
  } catch (error) {
    console.error("Firebase init error:", error.message);
  }
} else {
  console.error("Missing SERVICE_ACCOUNT_KEY");
}

app.get("/", (req, res) => {
  res.send("Backend is LIVE!");
});

app.post("/api/post-item", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ success: false, error: "DB not ready" });
    }

    const itemData = req.body;
    console.log("Saving item:", itemData.name);

    const docRef = await db.collection("items").add({
      name: itemData.name,
      description: itemData.description,
      price: itemData.price,
      category: itemData.category,
      condition: itemData.condition,
      location: itemData.location,
      image: itemData.image,
      postedBy: itemData.postedBy,
      postedByName: itemData.postedByName,
      postedByEmail: itemData.postedByEmail,
      createdAt: new Date().toISOString(),
    });

    console.log("✓ Saved with ID:", docRef.id);
    res.json({ success: true, id: docRef.id });

  } catch (error) {
    console.error("Save error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = app;
