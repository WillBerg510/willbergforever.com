const mongoose = require("mongoose");

const update = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  reactions: {
    type: Map,
    of: Number,
    required: true,
  }
});

module.exports = mongoose.model("Update", update);