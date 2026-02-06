const express = require('express');
const router = express.Router();
const cors = require('cors');
const Update = require("../models/Update.js");
const auth = require("../utils/auth.js");
const jwt = require('jsonwebtoken');

router.post("/", auth, async (req, res) => {
  const {text, date} = req.body;
  try {
    const newUpdate = await Update.create({
      text,
      date,
      reactions: {},
    });
    res.status(201).json({update: newUpdate});
  } catch (err) {
    res.status(500).json({error: "Error adding update"});
  }
});

router.get("/", cors(), async (req, res) => {
  const user_token = req.headers.authorization?.split(' ')[1];
  try {
    const updates = await Update.find().lean();
    if (user_token && user_token != "null") {
      const decoded = jwt.verify(user_token, process.env.USER_ACCESS_TOKEN_SECRET);
      updates.forEach(update => {
        update.reacted = {};
        update.reactionNums = {};
        Object.entries(update.reactions).forEach(([reaction, users]) => {
          update.reacted[reaction] = users.includes(decoded.user);
          update.reactionNums[reaction] = users.length - users.includes(decoded.user);
        })
      });
    }
    res.status(200).json({updates});
  } catch (err) {
    console.log(err);
    res.status(500).json({error: "Error fetching updates"});
  }
});

router.delete("/one/:id", auth, async (req, res) => {
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
});

router.delete("/clear", auth, async (req, res) => {
  try {
    await Update.deleteMany({});
    res.status(204).json({message: "Updates cleared"});
  } catch (err) {
    res.status(500).json({error: "Error clearing updates"});
  }
});

router.patch("/react/:id", async (req, res) => {
  try {
    const {reaction, user_token} = req.body;
    const decoded = jwt.verify(user_token, process.env.USER_ACCESS_TOKEN_SECRET);
    await Update.findOneAndUpdate(
      {_id: req.params.id},
      {$push: {[`reactions.${reaction}`]: decoded.user}},
    );
    res.status(204).json({message: `Reaction ${reaction} added`});
  } catch (err) {
    res.status(500).json({error: "Error reacting"});
  }
});

router.patch("/unreact/:id", async (req, res) => {
  try {
    const {reaction, user_token} = req.body;
    const decoded = jwt.verify(user_token, process.env.USER_ACCESS_TOKEN_SECRET);
    await Update.findOneAndUpdate(
      {_id: req.params.id},
      {$pull: {[`reactions.${reaction}`]: decoded.user}},
    );
    res.status(204).json({message: `Reaction ${reaction} removed`});
  } catch (err) {
    res.status(500).json({error: "Error removing reaction"});
  }
});

module.exports = router;