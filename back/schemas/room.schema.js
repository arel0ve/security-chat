const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  password: {
    type: String,
    required: true
  },
  timeForSave: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Room', roomSchema);
