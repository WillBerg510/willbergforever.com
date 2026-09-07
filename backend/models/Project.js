const mongoose = require("mongoose");

const project = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  gallery: {
    type: Array,
    of: String,
  },
  links: {
    youtube: {
      type: String,
    },
    spotify: {
      type: String,
    },
    link: {
      type: String,
    },
  },
  contentType: {
    type: String,
  },
  content: {
    type: Array,
    of: String,
  },
  contentNames: {
    type: Array,
    of: String,
  },
  groups: {
    type: Array,
    of: String,
  },
  visible: {
    type: Boolean,
    required: true,
  },
  specialReaction: {
    type: String,
  },
  region: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  position: {
    type: Array,
    of: Number,
    required: true,
  },
  reactions: {
    type: Map,
    of: Array,
    required: true,
  },
  awards: {
    gold: {
      type: Array,
      of: String,
    },
    silver: {
      type: Array,
      of: String,
    },
    bronze: {
      type: Array,
      of: String,
    },
  },
});

module.exports = mongoose.model("Project", project);