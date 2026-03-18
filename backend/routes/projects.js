const express = require('express');
const router = express.Router();
const Project = require("../models/Project.js");
const auth = require("../utils/auth.js");
const { uploadToS3, deleteFromS3 } = require("../utils/s3Client.js");
const formidable = require('express-formidable');
const jwt = require('jsonwebtoken');

// Post a new project using FormData which will upload images to the AWS S3 bucket
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

// Update project
router.patch("/:id", auth, formidable(), async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) res.status(404).json({error: "Requested project does not exist"});
  else {
    try {
      const { deleteGallery, youtube, spotify, link, groups, position } = req.fields;
      if (deleteGallery != "") {
        for (const index of deleteGallery.split(",")) {
          await deleteFromS3(project.gallery[index].split(process.env.S3_BUCKET + "/")[1]);
          project.gallery.splice(index, 1);
        }
      }
      const imageURLs = {
        thumbnail: project.thumbnail,
        gallery: project.gallery,
      };
      const promises = Object.entries(req.files).map(async ([key, image]) => {
        const imageName = await uploadToS3(image);
        const imageURL = `https://s3.us-east-1.amazonaws.com/${process.env.S3_BUCKET}/${imageName}`;
        if (key == "thumbnail") {
          await deleteFromS3(project.thumbnail.split(process.env.S3_BUCKET + "/")[1]);
          imageURLs.thumbnail = imageURL;
        } else if (key.startsWith("gallery")) {
          imageURLs.gallery[key.split("gallery")[1]] = imageURL;
        }
        return imageURL;
      });
      await Promise.all(promises);
      ["name", "date", "description", "specialReaction", "region", "icon"].forEach(field => {
        project[field] = req.fields[field];
      });
      project.thumbnail = imageURLs.thumbnail;
      project.gallery = imageURLs.gallery;
      project.links = {
        youtube,
        spotify,
        link
      };
      project.groups = groups.split(",");
      project.position = position.split(",");
      const updatedProject = project.save();
      res.status(200).json({updatedProject});
    } catch (err) {
      res.status(500).json({error: err});
    }
  }
});

// Get all projects in a certain region
router.get("/region/:region", async (req, res) => {
  try {
    const projects = await Project.find({region: req.params.region}).select(["_id", "name", "icon", "position"]);
    res.status(200).json({projects});
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

// Get a project's information by its ID
router.get("/:id", async (req, res) => {
  const user_token = req.cookies?.user_auth_token;
  const requireUserToken = req.query?.requireUserToken == "true";
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
      res.status(500).json({error: err.message});
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