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
  times: {
    type: Map,
    of: Number,
  },
  codes: {
    type: Map,
    of: String,
  }
});

module.exports = mongoose.model("Race", race);