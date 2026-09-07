const express = require('express');
const router = express.Router();
const Update = require("../models/Update.js");
const auth = require("../utils/auth.js");
const jwt = require('jsonwebtoken');

// Add new update
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

// Get all updates and provide specific information if a valid user made the call
router.get("/", async (req, res) => {
  const user_token = req.cookies?.user_auth_token;
  const requireUserToken = req.query?.requireUserToken == "true";
  if (!user_token && requireUserToken) res.status(500).json({error: "Missing cookie"});
  else {
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
          });
          delete update.reactions;
        });
      }
      res.status(200).json({updates});
    } catch (err) {
      res.status(500).json({error: "Error fetching updates"});
    }
  }
});

// Delete an update from its ID
router.delete("/one/:id", auth, async (req, res) => {
  try {
    const update = await Update.findOneAndDelete({
      _id: req.params.id,
    });
    if (!update) {
      res.status(404).json({error: "Update with that ID does not exist"});
    }
    else {
      res.status(204).json({message: "Update deleted"});
    }
  } catch (err) {
    res.status(500).json({error: "Error deleting update"});
  }
});

// Clear all updates
router.delete("/clear", auth, async (req, res) => {
  try {
    await Update.deleteMany({});
    res.status(204).json({message: "Updates cleared"});
  } catch (err) {
    res.status(500).json({error: "Error clearing updates"});
  }
});

// Add a reaction to an update
router.patch("/react/:id", async (req, res) => {
  const user_token = req.cookies?.user_auth_token;
  if (user_token) {
    try {
      const { reaction } = req.body;
      const decoded = jwt.verify(user_token, process.env.USER_ACCESS_TOKEN_SECRET);
      await Update.findOneAndUpdate(
        {_id: req.params.id},
        {$addToSet: {[`reactions.${reaction}`]: decoded.user}},
      );
      res.status(204).json({message: `Reaction ${reaction} added`});
    } catch (err) {
      res.status(500).json({error: "Error reacting"});
    }
  } else {
    res.status(500).json({error: "Error reacting"});
  }
});

// Remove a user's reaction to an update 
router.patch("/unreact/:id", async (req, res) => {
  const user_token = req.cookies?.user_auth_token;
  if (user_token) {
    try {
      const { reaction } = req.body;
      const decoded = jwt.verify(user_token, process.env.USER_ACCESS_TOKEN_SECRET);
      await Update.findOneAndUpdate(
        {_id: req.params.id},
        {$pull: {[`reactions.${reaction}`]: decoded.user}},
      );
      res.status(204).json({message: `Reaction ${reaction} removed`});
    } catch (err) {
      res.status(500).json({error: "Error removing reaction"});
    }
  } else {
    res.status(500).json({error: "Error reacting"});
  }
});

module.exports = router;