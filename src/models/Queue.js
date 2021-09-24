const mongoose = require("mongoose");

const QueueSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    required: true,
  },
  songs: {
    type: Array,
    default: [],
    required: true,
  },
});

module.exports = mongoose.model("queue", QueueSchema);
