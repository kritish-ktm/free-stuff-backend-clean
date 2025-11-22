const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();

// THIS ONE LINE KILLS CORS ERROR FOREVER
app.use(cors({ origin: "*" }));

app.use(express.json());

// Read Firebase key from Vercel environment variable
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// POST ITEM ENDPOINT
app.post("/api/post-item", async (req, res) => {
  try {
    const data = req.body;

    const docRef = await db.collection("items").add({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error("Error posting item:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check (optional)
app.get("/", (req, res) => {
  res.send("Free Stuff Backend is LIVE!");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});
