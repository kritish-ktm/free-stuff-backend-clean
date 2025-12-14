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
      projectId: "free-stuff-nielsbrock",
    });
    db = admin.firestore();
    console.log("✓ Firebase initialized with project: free-stuff-nielsbrock");
  } catch (error) {
    console.error("Firebase init error:", error.message);
  }
} else {
  console.error("Missing SERVICE_ACCOUNT_KEY");
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

    console.log("Saving item:", name);

    const docRef = await db.collection("items").add({
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

    console.log("✓ Item saved with ID:", docRef.id);
    res.json({ success: true, id: docRef.id });

  } catch (error) {
    console.error("Error:", error.code, error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = app;
