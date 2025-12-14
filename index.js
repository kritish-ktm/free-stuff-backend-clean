const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());

const SUPABASE_URL = "https://crcmzrtbuyahubqhutsz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyY216cnRidXlhaHVicWh1dHN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MTU1MDcsImV4cCI6MjA4MTI5MTUwN30.x3BMvXQdbBCDnIXlGDvmIEAZUwZ1yHncxW7bHA0mHMU";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.get("/", (req, res) => {
  res.send("Supabase Backend OK");
});

app.post("/api/post-item", async (req, res) => {
  try {
    const { name, description, price, category, condition, location, image, postedBy, postedByName, postedByEmail } = req.body;

    const { data, error } = await supabase
      .from("items")
      .insert([
        {
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
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error.message);
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true, id: data[0].id });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = app;
