const express = require('express');
const router = express.Router();
const Update = require("../models/Update.js");
const auth = require("../utils/auth.js");

router.post("/", auth, async (req, res) => {
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
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const update = await Update.findOneAndDelete({
      _id: req.params.id,
    });
    if (!update) {
      res.status(404).json({error: "Update with that ID does not exist"});
    }
    res.status(204).json({message: "Update deleted"});
  } catch (err) {
    res.status(500).json({error: "Error deleting update"});
  }
})

router.delete("/clear", auth, async (req, res) => {
  try {
    await Update.deleteMany({});
    res.status(204).json({message: "Updates cleared"});
  } catch (err) {
    res.status(500).json({error: "Error clearing updates"});
  }
});

module.exports = router;