const express = require("express");
const router = express.Router();
const FactoryEvent = require("../models/FactoryEvent.js");
const Project = require("../models/Project.js");
const auth = require("../utils/auth.js");
const projectIdsFromNames = require("../utils/projectIdsFromNames.js");
const formidable = require("express-formidable");
const { uploadToS3, deleteFromS3 } = require("../utils/s3Client.js");
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const s3KeyFromURL = (url) => url.split(process.env.S3_BUCKET + "/")[1];

// Get the most recent factory event
router.get("/", async (req, res) => {
  try {
    const user_token = req.cookies?.user_auth_token;
    const factoryEvent = await FactoryEvent.findOne().sort({date: -1}).select(["name", "active", "progresses", "parts", "locations"]).lean();
    if (!factoryEvent || !factoryEvent.active) {
      return res.status(200).json({factoryEvent: null});
    }
    let complete = false;
    if (user_token && user_token != "null") {
      complete = true;
      const decoded = jwt.verify(user_token, process.env.USER_ACCESS_TOKEN_SECRET);
      factoryEvent.progress = [];
      factoryEvent.progresses.forEach((users, index) => {
        factoryEvent.progress[index] = users.includes(decoded.user);
        if (!users.includes(decoded.user)) complete = false;
      });
      delete factoryEvent.progresses;
    }
    delete factoryEvent.active;
    if (!complete) delete factoryEvent._id;
    res.status(200).json({factoryEvent});
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

// Get the most recent factory event for admin editing
router.get("/edit", auth, async (req, res) => {
  try {
    const factoryEvent = await FactoryEvent.findOne().sort({date: -1}).lean();
    if (!factoryEvent) {
      return res.status(404).json({error: "No factory events exist"});
    }
    const projects = await Project.find({_id: {$in: factoryEvent.projects}}).select("_id name").lean();
    const projectNames = new Map(projects.map(project => [project._id.toString(), project.name]));
    factoryEvent.projects = factoryEvent.projects.map(projectId => projectNames.get(projectId.toString()));
    res.status(200).json({factoryEvent});
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

// Get a factory event's content by ID
router.get("/:id", async (req, res) => {
  try {
    const factoryEvent = await FactoryEvent.findById(req.params.id).select(["content", "contentType", "contentNames", "contentTitle"]).lean();
    if (!factoryEvent) {
      return res.status(404).json({error: `Factory event with ID ${req.params.id} does not exist`});
    }
    factoryEvent.name = factoryEvent.contentTitle;
    delete factoryEvent.contentTitle;
    res.status(200).json({factoryEvent});
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

// Add a factory event
router.post("/", auth, formidable({
  maxFileSize: 20 * 1024 * 1024 * 1024,
}), async (req, res) => {
  const {name, contentTitle, projects, parts, locations, contentType, contentNames, active} = req.fields;
  try {
    const projectNames = JSON.parse(projects);
    const projectIds = await projectIdsFromNames(projectNames);
    const locationValues = locations ? JSON.parse(locations) : null;
    const content = [];
    await Promise.all(Object.entries(req.files).map(async ([key, file]) => {
      const fileName = await uploadToS3(file, key);
      content[parseInt(key.replace("content", ""), 10)] =
        `https://s3.us-east-1.amazonaws.com/${process.env.S3_BUCKET}/${fileName}`;
    }));
    const factoryEvent = await FactoryEvent.create({
      name,
      contentTitle,
      projects: projectIds,
      parts: parts ? JSON.parse(parts) : [],
      locations: locationValues,
      date: Date.now(),
      active: active != "false",
      progresses: Array.from({length: projectIds.length}, () => []),
      codes: {},
      content,
      contentType,
      contentNames: contentNames ? JSON.parse(contentNames) : [],
    });
    res.status(201).json({factoryEvent});
  } catch (err) {
    res.status(err.status || 500).json({error: err.status ? err.message : "Error adding factory event"});
  }
});

// Submit progress for a found project in the current factory event
router.patch("/submit", async (req, res) => {
  const user_token = req.cookies?.user_auth_token;
  if (!user_token) res.status(500).json({error: "Missing cookie"});
  else {
    try {
      const {project} = req.body;
      const {hash} = req.headers;
      const factoryEvent = await FactoryEvent.findOne().sort({date: -1});
      const decoded = jwt.verify(user_token, process.env.USER_ACCESS_TOKEN_SECRET);
      const expectedCode = factoryEvent.codes.get(decoded.user);
      if (!expectedCode) {
        return res.status(500).json({error: "Factory event not initiated for this user"});
      }
      if (!factoryEvent.projects.includes(project)) {
        return res.status(500).json({error: "Submitted project not in current factory event"});
      }
      const expectedHash = crypto.createHmac("sha512", process.env.HMAC_SECRET)
        .update(`${project}/${expectedCode}`)
        .digest("hex");
      if (hash && crypto.timingSafeEqual(Buffer.from(expectedHash, "hex"), Buffer.from(hash, "hex"))) {
        await FactoryEvent.findByIdAndUpdate(
          factoryEvent.id,
          {$addToSet: {[`progresses.${factoryEvent.projects.indexOf(project)}`]: decoded.user}}
        );
        res.status(200).json("Factory event progress submitted");
      } else {
        res.status(500).json({error: "Invalid code/hash"});
      }
    } catch (err) {
      res.status(500).json({error: err.message});
    }
  }
});

// Update a factory event
router.patch("/:id", auth, formidable({
  maxFileSize: 20 * 1024 * 1024 * 1024,
}), async (req, res) => {
  try {
    const factoryEvent = await FactoryEvent.findById(req.params.id);
    if (!factoryEvent) {
      return res.status(404).json({error: "Factory event with that ID does not exist"});
    }

    const {name, contentTitle, projects, parts, locations, content, contentType, contentNames, active} = req.fields;
    if (name != undefined) factoryEvent.name = name;
    if (contentTitle != undefined) factoryEvent.contentTitle = contentTitle;
    if (parts != undefined) factoryEvent.parts = JSON.parse(parts);
    if (projects != undefined) {
      const projectNames = typeof projects == "string" ? JSON.parse(projects) : projects;
      const projectIds = await projectIdsFromNames(projectNames);
      factoryEvent.projects = projectIds;
      factoryEvent.progresses = factoryEvent.progresses.slice(0, projectIds.length);
      while (factoryEvent.progresses.length < projectIds.length) {
        factoryEvent.progresses.push([]);
      }
    }
    if (locations != undefined) factoryEvent.locations = JSON.parse(locations);
    if (content != undefined) factoryEvent.content = JSON.parse(content);
    if (contentType != undefined) factoryEvent.contentType = contentType;
    if (contentNames != undefined) factoryEvent.contentNames = JSON.parse(contentNames);
    if (active != undefined) factoryEvent.active = active !== "false";

    await Promise.all(Object.entries(req.files).map(async ([key, file]) => {
      const index = parseInt(key.replace("content", ""), 10);
      const fileName = await uploadToS3(file, key);
      if (factoryEvent.content[index]) {
        await deleteFromS3(s3KeyFromURL(factoryEvent.content[index]));
      }
      factoryEvent.content[index] =
        `https://s3.us-east-1.amazonaws.com/${process.env.S3_BUCKET}/${fileName}`;
    }));
    await factoryEvent.save();
    res.status(200).json({factoryEvent});
  } catch (err) {
    res.status(err.status || 500).json({error: err.status ? err.message : "Error updating factory event"});
  }
});

// Delete a factory event from its ID
router.delete("/:id", auth, async (req, res) => {
  try {
    const factoryEvent = await FactoryEvent.findByIdAndDelete(req.params.id);
    if (!factoryEvent) {
      return res.status(404).json({error: "Factory event with that ID does not exist"});
    }
    await Promise.all(factoryEvent.content
      .filter(Boolean)
      .map(content => deleteFromS3(s3KeyFromURL(content))));
    res.status(204).json({message: "Factory event deleted"});
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

module.exports = router;