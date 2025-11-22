const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
const cors = require("cors");

app.use(cors({
  origin: [
    "http://localhost:3000",           // for local testing
    "https://free-stuff-nielsbrock.vercel.app",  // your future live frontend (add later)
  ],
  credentials: true
}));
app.use(express.json());

// READ KEY FROM ENV (Railway/Vercel)
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

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

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Backend live on port ${port}`));