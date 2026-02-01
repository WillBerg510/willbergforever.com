const express = require('express');
const router = express.Router();
const Update = require("../models/Update.js");

router.post("/", async (req, res) => {
  const {text, date} = req.body;
  try {
    const newUpdate = await Update.create({
      text,
      date,
    });
    res.status(201).json({update: newUpdate});
  } catch (err) {
    res.status(500).json({error: "Error adding update"});
  }
});

router.get("/", async (req, res) => {
  try {
    const updates = await Update.find();
    res.status(200).json({updates});
  } catch (err) {
    res.status(500).json({error: "Error fetching updates"});
  }
})

module.exports = router;