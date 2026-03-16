const express = require('express');
const router = express.Router();
const Project = require("../models/Project.js");
const auth = require("../utils/auth.js");
const jwt = require('jsonwebtoken');
const uploadFile = require("../utils/fileUpload.js");

router.post("/", uploadFile.single("thumbnail"), async (req, res) => {
  //const { name, date, description, thumbnail, links, groups, region, icon, position } = req.body;
  try {
    const newProject = await Project.create({
      name: "a",
      date: new Date(),
      region: "e",
      icon: "i",
      position: [0, 0],
      reactions: {},
      thumbnail: `${req.protocol}://${req.hostname}:${process.env.PORT || 5050}/image_uploads/${req.file.filename}`,
    });
    /*const newProject = await Project.create({
      name,
      date,
      description,
      thumbnail,
      links,
      groups,
      region,
      icon,
      position,
      reactions: {},
      awards: {},
    });*/
    res.status(201).json({Project: newProject});
  } catch (err) {
    console.log(err);
    res.status(500).json({error: `Error adding project`});
  }
});

module.exports = router;