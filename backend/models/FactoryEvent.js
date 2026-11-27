const mongoose = require("mongoose");

const factoryEvent = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  projects: {
    type: Array,
    of: String,
    required: true,
  },
  parts: {
    type: Array,
    of: String,
    required: true,
  },
  locations: {
    type: Array,
    of: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
    default: true,
  },
  progresses: {
    type: Array,
    of: Array,
    required: true,
  },
  codes: {
    type: Map,
    of: String,
  },
  contentType: {
    type: String,
    required: true,
  },
  content: {
    type: Array,
    of: String,
    required: true,
  },
  contentNames: {
    type: Array,
    of: String,
  },
  contentTitle: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model("FactoryEvent", factoryEvent);