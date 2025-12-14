const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
app.use(cors());
app.use(express.json());

let db;

try {
  if (!process.env.SERVICE_ACCOUNT_KEY) {
    throw new Error("SERVICE_ACCOUNT_KEY missing");
  }

  const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  
  db = admin.firestore();
  db.settings({ ignoreUndefinedProperties: true });
  
  console.log("✓ Firebase ready");
} catch (error) {
  console.error("Init error:", error.message);
}

app.get("/", (req, res) => {
  res.send("OK");
});

app.post("/api/post-item", async (req, res) => {
  if (!db) {
    return res.status(500).json({ success: false, error: "DB not ready" });
  }

  try {
    const data = req.body;
    
    const result = await db.collection("items").add({
      name: data.name || "",
      description: data.description || "",
      price: data.price || 0,
      category: data.category || "",
      condition: data.condition || "",
      location: data.location || "",
      image: data.image || "",
      postedBy: data.postedBy || "",
      postedByName: data.postedByName || "",
      postedByEmail: data.postedByEmail || "",
      createdAt: new Date(),
    });

    res.json({ success: true, id: result.id });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = app;
