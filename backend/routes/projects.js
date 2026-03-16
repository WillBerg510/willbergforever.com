const express = require('express');
const router = express.Router();
const Project = require("../models/Project.js");
const auth = require("../utils/auth.js");
const { uploadToS3 } = require("../utils/s3Client.js");
const formidable = require('express-formidable');

router.post("/", auth, formidable(), async (req, res) => {
  console.log(req);
  const { name, date, description, links, groups, region, icon, position } = req.fields;
  try {
    const imageURLs = {
      thumbnail: null,
      gallery: [],
    };
    const promises = Object.entries(req.files).map(async ([key, image]) => {
      const imageName = await uploadToS3(image);
      const imageURL = `https://s3.us-east-1.amazonaws.com/${process.env.S3_BUCKET}/${imageName}`;
      if (key == "thumbnail") {
        imageURLs.thumbnail = imageURL;
      } else if (key.startsWith("gallery")) {
        imageURLs.gallery.push(imageURL);
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
      links,
      groups: groups.split(','),
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

module.exports = router;