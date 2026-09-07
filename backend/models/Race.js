const mongoose = require("mongoose");

const race = new mongoose.Schema({
  level: {
    type: Number,
    required: true,
  },
  projects: {
    type: Array,
    of: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  bestTime: {
    type: Number,
  }
});

module.exports = mongoose.model("Race", race);