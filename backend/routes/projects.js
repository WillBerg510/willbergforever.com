const express = require('express');
const router = express.Router();
const Project = require("../models/Project.js");
const Race = require("../models/Race.js");
const auth = require("../utils/auth.js");
const { uploadToS3, deleteFromS3 } = require("../utils/s3Client.js");
const formidable = require('express-formidable');
const jwt = require('jsonwebtoken');
const lodash = require('lodash');

// Post a new project using FormData which will upload files to the AWS S3 bucket
router.post("/", auth, formidable({
  maxFileSize: 20 * 1024 * 1024 * 1024,
}), async (req, res) => {
  const { name, date, description, youtube, spotify, link, groups, specialReaction, region, icon, position, contentType, contentNames, visible } = req.fields;
  try {
    const newProject = new Project({
      name,
      date,
      description,
      thumbnail: "placeholder",
      links: {
        youtube,
        spotify,
        link,
      },
      groups: (groups != "undefined" ? JSON.parse(groups) : null),
      visible,
      specialReaction,
      region,
      icon,
      position: JSON.parse(position),
      contentType,
      reactions: {},
      awards: {},
      contentNames: (contentNames != "undefined" ? JSON.parse(contentNames) : null),
    });
    await newProject.validate();

    const fileURLs = {
      thumbnail: null,
      gallery: [],
      content: [],
    };
    const promises = Object.entries(req.files).map(async ([key, file]) => {
      const fileName = await uploadToS3(file, key);
      const fileURL = `https://s3.us-east-1.amazonaws.com/${process.env.S3_BUCKET}/${fileName}`;
      if (key == "thumbnail") {
        fileURLs[key] = fileURL;
      } else if (key.startsWith("gallery")) {
        fileURLs.gallery[key.split("gallery")[1]] = fileURL;
      } else if (key.startsWith("content")) {
        fileURLs.content[key.split("content")[1]] = fileURL;
      }
      return fileURL;
    });
    await Promise.all(promises);
    newProject.thumbnail = fileURLs.thumbnail;
    newProject.gallery = fileURLs.gallery;
    newProject.content = fileURLs.content;
    await newProject.save();
    res.status(201).json({Project: newProject});
  } catch (err) {
    console.log(err);
    res.status(500).json({error: `Error adding project`});
  }
});

// Update project
router.patch("/:id", auth, formidable({
  maxFileSize: 20 * 1024 * 1024 * 1024,
}), async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) res.status(404).json({error: "Requested project does not exist"});
  else {
    try {
      const { deleteGallery, deleteContent, youtube, spotify, link, groups, position, contentNames, visible } = req.fields;
      project.links = {
        youtube,
        spotify,
        link,
      };
      if (groups != "undefined") project.groups = JSON.parse(groups);
      project.position = JSON.parse(position);
      if (contentNames != "undefined") project.contentNames = JSON.parse(contentNames);
      project.visible = visible;
      ["name", "date", "description", "specialReaction", "region", "icon", "contentType"].forEach(field => {
        project[field] = req.fields[field];
      });
      await project.validate();
      if (deleteGallery != "") {
        for (const index of JSON.parse(deleteGallery)) {
          if (project.gallery[index]) {
            await deleteFromS3(project.gallery[index].split(process.env.S3_BUCKET + "/")[1]);
            project.gallery.splice(index, 1);
          }
        }
      }
      if (deleteContent != "") {
        for (const index of JSON.parse(deleteContent)) {
          if (project.content[index]) {
            await deleteFromS3(project.content[index].split(process.env.S3_BUCKET + "/")[1]);
            project.content.splice(index, 1);
          }
        }
      }
      const fileURLs = {
        thumbnail: project.thumbnail,
        gallery: project.gallery,
        content: project.content,
      };
      const promises = Object.entries(req.files).map(async ([key, file]) => {
        const fileName = await uploadToS3(file, key);
        const fileURL = `https://s3.us-east-1.amazonaws.com/${process.env.S3_BUCKET}/${fileName}`;
        if (key == "thumbnail") {
          await deleteFromS3(project.thumbnail.split(process.env.S3_BUCKET + "/")[1]);
          fileURLs.thumbnail = fileURL;
        } else if (key.startsWith("content")) {
          if (project.content[key.split("content")[1]]) {
            await deleteFromS3(project.content[key.split("content")[1]].split(process.env.S3_BUCKET + "/")[1]);
          }
          fileURLs.content[key.split("content")[1]] = fileURL;
        } else if (key.startsWith("gallery")) {
          if (project.gallery[key.split("gallery")[1]]) {
            await deleteFromS3(project.gallery[key.split("gallery")[1]].split(process.env.S3_BUCKET + "/")[1]);
          }
          fileURLs.gallery[key.split("gallery")[1]] = fileURL;
        }
        return fileURL;
      });
      await Promise.all(promises);
      project.thumbnail = fileURLs.thumbnail;
      project.gallery = fileURLs.gallery;
      project.content = fileURLs.content;
      const updatedProject = await project.save();
      res.status(200).json({updatedProject});
    } catch (err) {
      res.status(500).json({error: err});
    }
  }
});

// Delete a project from its ID
router.delete("/one/:id", auth, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    await deleteFromS3(project.thumbnail.split(process.env.S3_BUCKET + "/")[1]);
    for (const file of project.gallery) {
      await deleteFromS3(file.split(process.env.S3_BUCKET + "/")[1]);
    }
    for (const file of project.content) {
      await deleteFromS3(file.split(process.env.S3_BUCKET + "/")[1]);
    }
    if (!project) {
      res.status(404).json({error: "Project with that ID does not exist"});
    }
    else {
      res.status(204).json({message: "Project deleted"});
    }
  } catch (err) {
    res.status(500).json({error: "Error deleting project"});
  }
});

// Get all projects in a certain region
router.get("/region/:region", async (req, res) => {
  try {
    const projects = await Project.find({region: req.params.region})
    .select(["_id", "name", "icon", "position", "visible"]);
    res.status(200).json({projects});
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

// Get all projects in a certain group
router.get("/group/:group", async (req, res) => {
  try {
    const projects = await Project.find({groups: {$elemMatch: {$eq: req.params.group}}, visible: {$ne: false}})
    .select(["_id", "name", "thumbnail", "date", "icon"])
    .sort({date: -1});
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

// Get project IDs and names for today's race of a certain level (as the number of projects), requesting a new race if the race is outdated 
router.get("/race/:level", async (req, res) => {
  try {
    const race = await Race.findOne({level: req.params.level});
    if (!race) {
      res.status(404).json({error: `Race of level ${req.params.level} does not exist`});
    } else {
      const today = new Date((new Date()).getTime() - (7 * 60 * 60 * 1000));
      const todayDate = today.toISOString().split('T')[0];
      if (race.date.toISOString().split('T')[0] != todayDate) {
        const projects = await Project.find({visible: {$ne: false}}).select(["_id", "name"]);
        const usedProjectIds = (await Race.find()).filter(otherRace => otherRace.date.toISOString().split('T')[0] == todayDate)
          .flatMap(otherRace => otherRace.projects);
        const selection = lodash.sampleSize(projects.filter(project => !usedProjectIds.includes(project._id.toString())), race.level);
        const selectionIds = selection.map(project => project._id);
        race.date = today;
        race.projects = selectionIds;
        await race.save();
        res.status(200).json({projects: selection});
      } else {
        let projects = [];
        const promises = race.projects.map(async (projectId, index) => {
          projects[index] = await Project.findOne({_id: projectId}).select(["_id", "name"]);
        });
        await Promise.all(promises);
        res.status(200).json({projects});
      }
    }
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

module.exports = router;