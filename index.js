const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
app.use(cors());
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
    console.log("✓ Firebase initialized");
  } catch (error) {
    console.error("Firebase init error:", error.message);
  }
} else {
  console.error("Missing SERVICE_ACCOUNT_KEY");
}

app.get("/", (req, res) => {
  res.send("Backend alive");
});

app.get("/api/test-db", async (req, res) => {
  if (!db) {
    return res.json({ success: false, error: "DB not initialized" });
  }

  try {
    const testDoc = await db.collection("test").doc("test-doc").get();
    res.json({ 
      success: true, 
      message: "Connected to Firestore",
      testDocExists: testDoc.exists,
      testDocData: testDoc.data()
    });
  } catch (error) {
    res.json({ 
      success: false, 
      error: error.message,
      code: error.code
    });
  }
});

app.post("/api/post-item", async (req, res) => {
  if (!db) {
    return res.status(500).json({ success: false, error: "Firebase not initialized" });
  }

  try {
    const { name, description, price, category, condition, location, image, postedBy, postedByName, postedByEmail } = req.body;

    console.log("Attempting to save:", name);

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

    console.log("✓ Saved:", docRef.id);
    res.json({ success: true, id: docRef.id });

  } catch (error) {
    console.error("POST Error:", error.code, "-", error.message);
    res.status(500).json({ success: false, error: error.message, code: error.code });
  }
});

module.exports = app;
