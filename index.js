const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Health check
app.get("/", (req, res) => {
  res.send("Free Stuff Backend is LIVE!");
});

// POST ITEM
app.post("/api/post-item", async (req, res) => {
  try {
    const data = req.body;
    const docRef = await db.collection("items").add({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Backend on port ${port}`));
