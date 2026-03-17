const express = require('express');
const router = express.Router();
const Project = require("../models/Project.js");
const auth = require("../utils/auth.js");
const { uploadToS3 } = require("../utils/s3Client.js");
const formidable = require('express-formidable');
const jwt = require('jsonwebtoken');

router.post("/", auth, formidable(), async (req, res) => {
  const { name, date, description, youtube, spotify, link, groups, specialReaction, region, icon, position } = req.fields;
  try {
    const imageURLs = {
      thumbnail: null,
      gallery: [],
    };
    let galleryIndex = 0;
    const promises = Object.entries(req.files).map(async ([key, image]) => {
      const imageName = await uploadToS3(image);
      const imageURL = `https://s3.us-east-1.amazonaws.com/${process.env.S3_BUCKET}/${imageName}`;
      if (key == "thumbnail") {
        imageURLs.thumbnail = imageURL;
      } else if (key.startsWith("gallery")) {
        imageURLs.gallery[galleryIndex] = imageURL;
        galleryIndex += 1;
      }
      return imageURL;
    });
    await Promise.all(promises);
    const newProject = await Project.create({
      name,
      date,
      description,
      thumbnail: imageURLs.thumbnail,
      gallery: imageURLs.gallery,
      links: {
        youtube,
        spotify,
        link,
      },
      groups: groups.split(','),
      specialReaction,
      region,
      icon,
      position: position.split(','),
      reactions: {},
      awards: {},
    });
    res.status(201).json({Project: newProject});
  } catch (err) {
    console.log(err);
    res.status(500).json({error: `Error adding project`});
  }
});

router.get("/:id", async (req, res) => {
  const user_token = req.cookies?.user_auth_token;
  const requireUserToken = req.query?.requireUserToken;
  if (!user_token && requireUserToken) res.status(500).json({error: "Missing cookie"});
  else {
    try {
      const project = await Project.findById(req.params.id).lean();
      if (!project) {
        res.status(404).json({error: "Requested project does not exist"});
      } else {
        if (user_token && user_token != "null") {
          const decoded = jwt.verify(user_token, process.env.USER_ACCESS_TOKEN_SECRET);
          project.reacted = {};
          project.reactionNums = {};
          Object.entries(project.reactions).forEach(([reaction, users]) => {
            project.reacted[reaction] = users.includes(decoded.user);
            project.reactionNums[reaction] = users.length - users.includes(decoded.user);
          })
        }
        delete project.reactions;
        delete project.awards;
        res.status(200).json({project});
      }
    } catch (err) {
      res.status(500).json({error: "Error getting project"});
    }
  }
});

// Add a reaction to a project
router.patch("/react/:id", async (req, res) => {
  const user_token = req.cookies?.user_auth_token;
  if (user_token) {
    try {
      const { reaction } = req.body;
      const decoded = jwt.verify(user_token, process.env.USER_ACCESS_TOKEN_SECRET);
      await Project.findByIdAndUpdate(
        req.params.id,
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

// Remove a user's reaction to a project
router.patch("/unreact/:id", async (req, res) => {
  const user_token = req.cookies?.user_auth_token;
  if (user_token) {
    try {
      const { reaction } = req.body;
      const decoded = jwt.verify(user_token, process.env.USER_ACCESS_TOKEN_SECRET);
      await Project.findByIdAndUpdate(
        req.params.id,
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